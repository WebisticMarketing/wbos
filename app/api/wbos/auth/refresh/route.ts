// app/api/wbos/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 [REFRESH] Starting token refresh...");

    const token = req.cookies.get("wbos_token")?.value;

    if (!token) {
      console.log("🔄 [REFRESH] No token found in cookies");
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    let payload: any;
    try {
      // Verify the current token is still valid
      payload = jwt.verify(token, JWT_SECRET) as any;
      console.log("🔄 [REFRESH] Token verified for user:", payload.userId);
    } catch (error) {
      console.log("🔄 [REFRESH] Token verification failed:", error);
      const response = NextResponse.json({ error: "Token expired or invalid" }, { status: 401 });
      response.cookies.delete("wbos_token");
      return response;
    }

    // Verify user and business are still active
    const user = await prisma.wbosUser.findUnique({
      where: { id: payload.userId },
      include: {
        business: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== "active") {
      console.log("🔄 [REFRESH] User not active or not found");
      const response = NextResponse.json({ error: "User not active" }, { status: 401 });
      response.cookies.delete("wbos_token");
      return response;
    }

    if (user.business?.status !== "active") {
      console.log("🔄 [REFRESH] Business not active");
      const response = NextResponse.json({ error: "Business not active" }, { status: 403 });
      response.cookies.delete("wbos_token");
      return response;
    }

    // Generate a new token with extended expiry
    const newToken = jwt.sign(
      {
        userId: user.id,
        businessId: user.businessId,
        slug: user.business.slug,
        email: user.email,
        name: user.name,
        businessName: user.business.name,
        roles: user.roles.map((ur) => ur.role.name),
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("🔄 [REFRESH] New token generated successfully");

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
        businessName: user.business.name,
        slug: user.business.slug,
      },
    });

    // Set the new token cookie
    response.cookies.set("wbos_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    });

    console.log("🔄 [REFRESH] Token refresh completed for:", user.email);
    return response;
  } catch (error) {
    console.error("🔄 [REFRESH ERROR] Token refresh failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Token refresh failed", details: errorMessage }, { status: 500 });
  }
}
