export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { queryDb, executeDb, generateId, nowISO } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let sql = `
      SELECT p.*, u.name as farmerName, u.phone as farmerPhone 
      FROM marketplace_products p
      JOIN users u ON p.farmerId = u.id
    `;
    const params: any[] = [];

    if (category && category !== "all") {
      sql += ` WHERE p.category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY p.createdAt DESC`;

    const products = await queryDb(sql, params);

    const formattedProducts = (products || []).map((p: any) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));

    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error: any) {
    console.error("Fetch marketplace products error:", error);
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
    const { title, description, category, price, unit, stock, images } = body;

    if (!title || !category || !price) {
      return NextResponse.json({ success: false, error: "Title, category, and price are required" }, { status: 400 });
    }

    const id = generateId();
    const now = nowISO();
    const imageJson = JSON.stringify(images || []);

    await executeDb(
      `INSERT INTO marketplace_products (id, farmerId, title, description, category, price, unit, stock, images, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, title, description || "", category, price, unit || "kg", stock || 1, imageJson, now, now]
    );

    return NextResponse.json({ success: true, message: "Product listed successfully", productId: id });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
