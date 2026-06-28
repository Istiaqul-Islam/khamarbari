export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { queryDb, executeDb, generateId, nowISO } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await queryDb(
      `SELECT * FROM marketplace_orders WHERE buyerId = ? ORDER BY createdAt DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as any;
    const { items, totalAmount, shippingAddress } = body;

    if (!items || !items.length || !shippingAddress) {
      return NextResponse.json({ success: false, error: "Cart items and shipping address are required" }, { status: 400 });
    }

    const orderId = generateId();
    const now = nowISO();

    await executeDb(
      `INSERT INTO marketplace_orders (id, buyerId, totalAmount, status, shippingAddress, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, session.userId, totalAmount, 'pending', shippingAddress, now, now]
    );

    for (const item of items) {
      const itemId = generateId();
      await executeDb(
        `INSERT INTO marketplace_order_items (id, orderId, productId, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [itemId, orderId, item.productId, item.quantity, item.price]
      );
    }

    return NextResponse.json({ success: true, message: "Order placed successfully!", orderId });
  } catch (error: any) {
    console.error("Place order error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
