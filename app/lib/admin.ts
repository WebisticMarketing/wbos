// app/lib/admin.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export async function verifyAuth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return admin;
  } catch (error) {
    return null;
  }
}