export const runtime = "edge";
// src/app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { queryDb, getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, users: [] });
    }

    const searchTerm = `%${q}%`;

    // 1. Search Users
    const users = await queryDb<any>(
      "SELECT id, name, avatar, role FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 5",
      [searchTerm, searchTerm]
    );

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
