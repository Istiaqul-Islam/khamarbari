export const runtime = "edge";
// src/app/api/admin/users/route.ts
// Purpose: Admin - list all users with search and counts.

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryDb, queryDbFirst } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.avatar, u.phone, u.role, u.createdAt,
        (SELECT COUNT(*) FROM pets WHERE userId = u.id AND isActive = 1) AS petsCount,
        (SELECT COUNT(*) FROM appointments WHERE userId = u.id) AS appointmentsCount
      FROM users u
    `;
    const params: unknown[] = [];

    if (search) {
      sql += ` WHERE (LOWER(u.name) LIKE '%' || LOWER(?) || '%' OR LOWER(u.email) LIKE '%' || LOWER(?) || '%')`;
      params.push(search, search);
    }

    sql += ` ORDER BY u.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await queryDb<Record<string, unknown>>(sql, params);

    const users = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      phone: row.phone,
      role: row.role,
      createdAt: row.createdAt,
      _count: {
        livestock: Number(row.petsCount || 0),
        appointments: Number(row.appointmentsCount || 0),
      },
    }));

    // Count
    let countSql = "SELECT COUNT(*) as count FROM users";
    const countParams: unknown[] = [];
    if (search) {
      countSql += ` WHERE (LOWER(name) LIKE '%' || LOWER(?) || '%' OR LOWER(email) LIKE '%' || LOWER(?) || '%')`;
      countParams.push(search, search);
    }
    const total = await queryDbFirst<{ count: number }>(countSql, countParams);

    return NextResponse.json({
      success: true,
      users,
      total: total?.count || 0,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
