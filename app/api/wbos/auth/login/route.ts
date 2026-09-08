// app/api/wbos/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export async function POST(req: NextRequest) {
  try {
    console.log("🔐 [LOGIN] Starting login process...");
    
    const { email, password } = await req.json();
    console.log("🔐 [LOGIN] Received login request for email:", email);

    if (!email || !password) {
      console.log("🔐 [LOGIN] Missing email or password");
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Check JWT_SECRET is available
    console.log("🔐 [LOGIN] JWT_SECRET is set:", JWT_SECRET ? "yes" : "no");

    // Database query
    console.log("🔐 [LOGIN] Querying database for user...");
    const user = await prisma.wbosUser.findFirst({
      where: { email },
      include: {
        business: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    console.log("🔐 [LOGIN] Database query completed, user found:", !!user);

    if (!user) {
      console.log("🔐 [LOGIN] User not found for email:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status !== "active") {
      console.log("🔐 [LOGIN] User account not active:", email);
      return NextResponse.json(
        { error: "Account not active. Please check your email for activation." },
        { status: 401 }
      );
    }

    if (!user.business || user.business.status !== "active") {
      console.log("🔐 [LOGIN] Business account suspended for user:", email);
      return NextResponse.json(
        { error: "Business account is suspended. Contact support." },
        { status: 403 }
      );
    }

    // Password verification
    console.log("🔐 [LOGIN] Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    console.log("🔐 [LOGIN] Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    console.log("🔐 [LOGIN] Updating last login timestamp...");
    await prisma.wbosUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    console.log("🔐 [LOGIN] Last login updated");

    // 🔐 Debug log
    console.log("🔐 [LOGIN] Generating JWT for user:", {
      userId: user.id,
      businessId: user.businessId,
      businessName: user.business.name,
      slug: user.business.slug,
    });

    const token = jwt.sign(
      {
        userId: user.id,
        businessId: user.businessId,
        slug: user.business.slug,
        email: user.email,
        name: user.name,
        businessName: user.business.name, // ✅ Include businessName for /me endpoint
        roles: user.roles.map((ur) => ur.role.name),
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    console.log("🔐 [LOGIN] JWT token generated successfully");

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
        businessName: user.business.name,
        slug: user.business.slug,
      },
    });

    // ✅ Force delete and re‑set the cookie
    response.cookies.delete("wbos_token");
    response.cookies.set("wbos_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    });

    console.log("🔐 [LOGIN] Login successful for:", email);
    return response;
  } catch (error) {
    console.error("🔐 [LOGIN ERROR] Login failed with error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    console.error("🔐 [LOGIN ERROR] Error message:", errorMessage);
    console.error("🔐 [LOGIN ERROR] Error stack:", errorStack);
    return NextResponse.json({ error: "Login failed", details: errorMessage }, { status: 500 });
  }
}