export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { queryDb, executeDb, generateId, nowISO } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const productId = searchParams.get("id") || searchParams.get("productId");

    let sql = `
      SELECT p.*, u.name as farmerName, u.phone as farmerPhone
      FROM marketplace_products p
      JOIN users u ON p.farmerId = u.id
    `;
    const params: any[] = [];

    if (productId) {
      sql += ` WHERE p.id = ?`;
      params.push(productId);
    } else if (category && category !== "all") {
      sql += ` WHERE p.category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY p.createdAt DESC`;

    const products = await queryDb(sql, params);

    const formattedProducts = (products || []).map((product: any) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
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
      [id, session.userId, title, description || "", category, price, unit || "kg", stock || 1, imageJson, now, now],
    );

    return NextResponse.json({ success: true, message: "Product listed successfully", productId: id });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id") || searchParams.get("productId");
    const body = (await request.json()) as any;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product id is required" }, { status: 400 });
    }

    const existing = await queryDb("SELECT id, farmerId FROM marketplace_products WHERE id = ?", [productId]);
    const owner = existing?.[0];
    if (!owner || owner.farmerId !== session.userId) {
      return NextResponse.json({ success: false, error: "You can only edit your own listings" }, { status: 403 });
    }

    const { title, description, category, price, unit, stock, images } = body;
    const imageJson = JSON.stringify(images || []);
    const now = nowISO();

    await executeDb(
      `UPDATE marketplace_products
       SET title = ?, description = ?, category = ?, price = ?, unit = ?, stock = ?, images = ?, updatedAt = ?
       WHERE id = ?`,
      [title, description || "", category, price, unit || "kg", stock || 1, imageJson, now, productId],
    );

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id") || searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ success: false, error: "Product id is required" }, { status: 400 });
    }

    const existing = await queryDb("SELECT id, farmerId FROM marketplace_products WHERE id = ?", [productId]);
    const owner = existing?.[0];
    if (!owner || owner.farmerId !== session.userId) {
      return NextResponse.json({ success: false, error: "You can only delete your own listings" }, { status: 403 });
    }

    await executeDb("DELETE FROM marketplace_products WHERE id = ?", [productId]);
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
