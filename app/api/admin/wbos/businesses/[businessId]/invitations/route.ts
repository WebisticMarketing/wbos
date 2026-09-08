// app/api/admin/wbos/businesses/[businessId]/invitations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";
import crypto from "crypto";
import { sendInvitationEmail } from "@/lib/email";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
    });
    return admin;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const business = await prisma.wbosBusiness.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const existingUser = await prisma.wbosUser.findFirst({
      where: {
        email,
        businessId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    let targetRole = null;
    if (body.roleId) {
      targetRole = await prisma.wbosRole.findFirst({
        where: { id: body.roleId, businessId },
      });
    }

    if (!targetRole) {
      targetRole = (await prisma.wbosRole.findFirst({
        where: {
          businessId,
          name: { equals: "Owner", mode: "insensitive" },
        },
      })) || (await prisma.wbosRole.findFirst({
        where: { businessId },
      }));
    }

    if (!targetRole) {
      return NextResponse.json(
        { error: "No role found for this business" },
        { status: 500 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invitation = await prisma.invitation.create({
      data: {
        businessId,
        email,
        name: name || "",
        roleId: targetRole.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitedBy: admin.id,
        invitedByType: "admin",
        status: "pending",
      },
    });

    const user = await prisma.wbosUser.create({
      data: {
        businessId,
        email,
        name: name || "",
        status: "invited",
        invitedAt: new Date(),
      },
    });

    await prisma.wbosUserRole.create({
      data: {
        userId: user.id,
        roleId: targetRole.id,
      },
    });

    // Send email
    try {
      await sendInvitationEmail(email, name || "", business.name, token);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json({
        success: true,
        message: "Invitation created but email failed to send",
        invitationId: invitation.id,
        userId: user.id,
        token: token,
        emailSent: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      invitationId: invitation.id,
      userId: user.id,
      token: token,
      emailSent: true,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}