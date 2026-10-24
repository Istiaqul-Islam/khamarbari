export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { queryDb, generateId, nowISO } from "@/lib/db";
import { getTurso } from "@/lib/turso";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const orders = await queryDb("SELECT * FROM marketplace_orders WHERE buyerId = ? ORDER BY createdAt DESC", [session.userId]);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not load orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ success: false, error: "Please sign in before placing an order." }, { status: 401 });
    const body = await request.json() as any;
    const items = body.items;
    const customer = body.customer || {};
    const paymentMethod = body.paymentMethod;
    const paymentStatus = paymentMethod === "bkash_demo" && body.paymentStatus === "simulated_paid" ? "simulated_paid" : "unpaid";
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) return NextResponse.json({ success: false, error: "Add between 1 and 50 cart items." }, { status: 400 });
    if (!customer.name?.trim() || !customer.phone?.trim() || !customer.email?.trim() || !customer.address?.trim()) return NextResponse.json({ success: false, error: "Customer name, phone, email and delivery address are required." }, { status: 400 });
    if (!["cash_on_delivery", "bkash_demo"].includes(paymentMethod)) return NextResponse.json({ success: false, error: "Choose a supported payment method." }, { status: 400 });
    if (paymentMethod === "bkash_demo" && paymentStatus !== "simulated_paid") return NextResponse.json({ success: false, error: "Complete the simulated bKash step before placing the order." }, { status: 400 });

    const quantities = new Map<string, number>();
    for (const item of items) {
      if (typeof item.productId !== "string" || !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) return NextResponse.json({ success: false, error: "A cart item has an invalid product or quantity." }, { status: 400 });
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }
    const checkedItems: { productId: string; quantity: number; price: number }[] = [];
    let totalAmount = 0;
    for (const [productId, quantity] of quantities.entries()) {
      const product = await queryDb("SELECT id, title, price, stock FROM marketplace_products WHERE id = ?", [productId]);
      const p: any = product[0];
      if (!p) return NextResponse.json({ success: false, error: "A product in your cart is no longer available. Refresh the marketplace." }, { status: 400 });
      if (!Number.isFinite(Number(p.price)) || Number(p.price) < 0) return NextResponse.json({ success: false, error: "A product has an invalid price." }, { status: 400 });
      if (Number(p.stock) < quantity) return NextResponse.json({ success: false, error: "Not enough stock available for " + p.title + "." }, { status: 409 });
      const price = Number(p.price);
      totalAmount += price * quantity;
      checkedItems.push({ productId, quantity, price });
    }
    totalAmount = Math.round(totalAmount * 100) / 100;
    const orderId = generateId();
    const now = nowISO();
    const status = paymentStatus === "simulated_paid" ? "processing" : "pending";
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const shippingAddress = String(customer.address).trim();
    const db = getTurso();
    const itemStatements = checkedItems.map((item) => ({
      sql: "INSERT INTO marketplace_order_items (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)",
      args: [generateId(), orderId, item.productId, item.quantity, item.price],
    }));
    const newOrderStatement = {
      sql: "INSERT INTO marketplace_orders (id, buyerId, totalAmount, status, shippingAddress, paymentMethod, paymentStatus, customerName, customerPhone, customerEmail, estimatedDelivery, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [orderId, session.userId, totalAmount, status, shippingAddress, paymentMethod, paymentStatus, String(customer.name).trim(), String(customer.phone).trim(), String(customer.email).trim(), estimatedDelivery, now, now],
    };
    try {
      await db.batch([newOrderStatement, ...itemStatements], "write");
    } catch (schemaError: any) {
      const message = String(schemaError?.message || schemaError);
      if (!/no such column|SQLITE_ERROR/i.test(message)) throw schemaError;
      // Backward-compatible path for an existing database not yet migrated.
      // Keep customer/payment metadata in the existing shippingAddress text column.
      const metadataAddress = JSON.stringify({ address: shippingAddress, customerName: String(customer.name).trim(), customerPhone: String(customer.phone).trim(), customerEmail: String(customer.email).trim(), paymentMethod, paymentStatus, estimatedDelivery, demoOnly: paymentMethod === "bkash_demo" });
      await db.batch([{
        sql: "INSERT INTO marketplace_orders (id, buyerId, totalAmount, status, shippingAddress, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [orderId, session.userId, totalAmount, status, metadataAddress, now, now],
      }, ...itemStatements], "write");
    }
    return NextResponse.json({ success: true, message: paymentStatus === "simulated_paid" ? "Demo payment recorded successfully." : "Order placed successfully.", orderId, totalAmount, status, paymentMethod, paymentStatus, estimatedDelivery });
  } catch (error: any) {
    console.error("Place marketplace order error:", error);
    return NextResponse.json({ success: false, error: error.message || "Could not place order." }, { status: 500 });
  }
}
