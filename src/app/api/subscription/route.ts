export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { executeDb, generateId, nowISO, queryDbFirst } from "@/lib/db";
import { getSession } from "@/lib/auth";

const PREMIUM_PRICE = 99;
const DAY_MS = 24 * 60 * 60 * 1000;

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return { session: null, user: null };
  const user = await queryDbFirst<any>("SELECT id, role, subscriptionPlan, subscriptionStartedAt, subscriptionExpiresAt, subscriptionCancelledAt FROM users WHERE id = ?", [session.userId]);
  if (user?.subscriptionPlan === "premium" && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() <= Date.now()) {
    await executeDb("UPDATE users SET subscriptionPlan = 'free', subscriptionCancelledAt = NULL WHERE id = ?", [session.userId]);
    user.subscriptionPlan = "free";
    user.subscriptionCancelledAt = null;
  }
  return { session, user };
}

export async function GET() {
  try {
    const { session, user } = await getCurrentUser();
    if (!session?.userId || !user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: true, subscription: { plan: user.subscriptionPlan === "premium" ? "premium" : "free", startedAt: user.subscriptionStartedAt || null, expiresAt: user.subscriptionExpiresAt || null, cancelledAt: user.subscriptionCancelledAt || null, price: PREMIUM_PRICE, listingLimit: user.subscriptionPlan === "premium" ? 200 : 5 } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Could not load subscription" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, user } = await getCurrentUser();
    if (!session?.userId || !user) return NextResponse.json({ success: false, error: "Please sign in first." }, { status: 401 });
    if (user.role !== "livestock_farmer") return NextResponse.json({ success: false, error: "Premium listings are available to livestock farmers." }, { status: 403 });
    const body = await request.json() as { accountNumber?: string };
    const accountNumber = String(body.accountNumber || "").replace(/[\s-]/g, "");
    if (!/^01[3-9]\d{8}$/.test(accountNumber)) return NextResponse.json({ success: false, error: "Enter a valid Bangladesh mobile number." }, { status: 400 });
    const now = new Date();
    const nowText = now.toISOString();
    const oldExpiry = user.subscriptionPlan === "premium" && user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : now;
    const periodStart = oldExpiry.getTime() > now.getTime() ? oldExpiry : now;
    const expiresAt = new Date(periodStart.getTime() + 30 * DAY_MS).toISOString();
    const subscriptionId = generateId();
    // Local checkout preview only: this does not call bKash or transfer money.
    await executeDb("UPDATE users SET subscriptionPlan = 'premium', subscriptionStartedAt = ?, subscriptionExpiresAt = ?, subscriptionCancelledAt = NULL, updatedAt = ? WHERE id = ?", [nowText, expiresAt, nowText, session.userId]);
    await executeDb("INSERT INTO marketplace_subscription_payments (id, userId, amount, accountNumber, status, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?)", [subscriptionId, session.userId, PREMIUM_PRICE, accountNumber, "preview_completed", nowText, expiresAt]);
    return NextResponse.json({ success: true, message: "Premium is now active.", subscription: { plan: "premium", startedAt: nowText, expiresAt, cancelledAt: null, price: PREMIUM_PRICE, listingLimit: 200 }, paymentReference: subscriptionId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Could not activate Premium" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { session, user } = await getCurrentUser();
    if (!session?.userId || !user) return NextResponse.json({ success: false, error: "Please sign in first." }, { status: 401 });
    if (user.subscriptionPlan !== "premium" || !user.subscriptionExpiresAt) return NextResponse.json({ success: false, error: "There is no active Premium subscription to cancel." }, { status: 400 });
    const cancelledAt = nowISO();
    await executeDb("UPDATE users SET subscriptionCancelledAt = ?, updatedAt = ? WHERE id = ?", [cancelledAt, cancelledAt, session.userId]);
    return NextResponse.json({ success: true, message: "Renewal cancelled. Premium remains active until its expiry date.", cancelledAt, expiresAt: user.subscriptionExpiresAt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Could not cancel subscription" }, { status: 500 });
  }
}
