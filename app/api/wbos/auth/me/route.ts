// app/api/wbos/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";
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

    const user = await prisma.wbosUser.findUnique({
      where: { id: payload.userId },
      include: {
        business: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "User account is inactive" },
        { status: 401 }
      );
    }

    if (user.business.status !== "active") {
      return NextResponse.json(
        { error: "Business account suspended" },
        { status: 403 }
      );
    }

    const permissions: string[] = [];
    for (const userRole of user.roles) {
      for (const rp of userRole.role.permissions) {
        if (!permissions.includes(rp.permission.name)) {
          permissions.push(rp.permission.name);
        }
      }
    }

    const roleNames = user.roles.map((ur) => ur.role.name);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
        businessName: user.business.name,
        slug: user.business.slug, // ✅ Included
        logo: user.business.logo,
        roles: roleNames,
        permissions: permissions,
        status: user.status,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
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