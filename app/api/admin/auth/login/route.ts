// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";
import { getRequiredEnv } from "@/lib/env";
import { loginSchema } from "@/lib/validation/auth";
import { loginRateLimit, trackFailedAttempt, resetFailedAttempts, getClientIP } from "@/lib/rate-limit";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN = "7d";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse body
    const body = await req.json();
    const { email, password } = body;

    // 2. Server-side validation with Zod
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      // Generic error message - don't reveal what was wrong
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const validatedData = validationResult.data;

    // 3. Rate limiting
    const ip = getClientIP(req);
    const rateLimitResult = await loginRateLimit(validatedData.email, ip);
    if (!rateLimitResult.allowed) {
      // ✅ FIXED: Removed .message since it doesn't exist
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    // 4. Find admin - check if account exists
    const admin = await prisma.admin.findUnique({
      where: { email: validatedData.email },
    });

    // 5. Generic error for both invalid email and wrong password
    if (!admin) {
      // Still track failed attempt to prevent enumeration
      await trackFailedAttempt(validatedData.email);
      // Return generic message - same as wrong password
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    // 6. Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Account locked. Try again in ${remainingMinutes} minutes.` },
        { status: 429 }
      );
    }

    // 7. Verify password with constant-time comparison
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, admin.password);
    } catch (error) {
      // Generic error - don't reveal that comparison failed
      isValid = false;
    }

    if (!isValid) {
      // Track failed attempt
      await trackFailedAttempt(validatedData.email);
      
      // Update admin login attempts
      const newAttempts = (admin.loginAttempts || 0) + 1;
      let lockedUntil = null;
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: lockedUntil,
        },
      });

      // Return generic message
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    // 8. Login successful - reset attempts
    await resetFailedAttempts(validatedData.email);
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // 9. Generate JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 10. Return success - generic message
    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    // Generic error message
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }
}