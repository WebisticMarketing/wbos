// app/api/admin/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";
import { changePasswordSchema } from "@/lib/validation/auth";

const BCRYPT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin is logged in
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await req.json();

    // 3. Validate with Zod
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: { message: string }) => e.message);
      return NextResponse.json(
        { error: errors[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // 4. Get admin from database
    const dbAdmin = await prisma.admin.findUnique({
      where: { id: admin.id },
    });

    if (!dbAdmin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // 5. Verify current password with constant-time comparison
    let isValid = false;
    try {
      isValid = await bcrypt.compare(currentPassword, dbAdmin.password);
    } catch (error) {
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // 6. Hash new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // 7. Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}