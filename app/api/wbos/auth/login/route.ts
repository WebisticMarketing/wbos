// app/api/wbos/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

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

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account not active. Please check your email for activation." },
        { status: 401 }
      );
    }

    if (!user.business || user.business.status !== "active") {
      return NextResponse.json(
        { error: "Business account is suspended. Contact support." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    await prisma.wbosUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 🔐 Debug log
    console.log("🔐 Generating JWT for user:", {
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
        roles: user.roles.map((ur) => ur.role.name),
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}