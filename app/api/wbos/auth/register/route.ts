// app/api/wbos/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, name } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        business: true,
        role: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 400 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if invitation is already accepted
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.wbosUser.findFirst({
      where: {
        email: invitation.email,
        businessId: invitation.businessId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found. Please contact support." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    const user = await prisma.wbosUser.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        status: "active",
        acceptedAt: new Date(),
        name: name || invitation.name || "",
      },
    });

    // Update invitation
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "accepted",
        acceptedAt: new Date(),
        acceptedBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account activated successfully. You can now login.",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to activate account" },
      { status: 500 }
    );
  }
}