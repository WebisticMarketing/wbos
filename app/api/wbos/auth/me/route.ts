// app/api/wbos/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wbos_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // ✅ Return user info directly from JWT payload - no database query needed
    // This prevents connection pool exhaustion on Vercel serverless
    return NextResponse.json({
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        businessId: payload.businessId,
        businessName: payload.businessName,
        slug: payload.slug,
        roles: payload.roles || [],
        // Note: For fields not in JWT (like permissions, status, avatar, lastLogin),
        // they would require a DB query. The JWT contains the essential auth data.
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}