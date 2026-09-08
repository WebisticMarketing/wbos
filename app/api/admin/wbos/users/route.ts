// app/api/admin/wbos/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

async function verifyAdmin(req: NextRequest) {
  // Read from Authorization header (not cookie)
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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.wbosUser.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove password hashes
    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      businessName: u.business?.name || "No business",
      createdAt: u.createdAt,
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Error fetching WBOS users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}