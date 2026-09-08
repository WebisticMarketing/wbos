// app/api/wbos/invitations/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find or create the user
    let user = await prisma.wbosUser.findUnique({
      where: {
        businessId_email: {
          businessId: invitation.businessId,
          email: invitation.email,
        },
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.wbosUser.create({
        data: {
          businessId: invitation.businessId,
          email: invitation.email,
          name: invitation.name || invitation.email,
          password: hashedPassword,
          status: "active", // ✅ SET TO ACTIVE
          acceptedAt: new Date(),
        },
      });

      // Assign the role
      await prisma.wbosUserRole.create({
        data: {
          userId: user.id,
          roleId: invitation.roleId,
        },
      });
    } else {
      // Update existing user (if already invited)
      user = await prisma.wbosUser.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          status: "active", // ✅ SET TO ACTIVE
          acceptedAt: new Date(),
        },
      });
    }

    // Mark invitation as accepted
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
      message: "Account activated successfully",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}