// app/lib/auth-helpers.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";
import { prisma } from "./prisma";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export interface AuthPayload {
  userId: string;
  businessId: string;
  slug: string;
  email: string;
}

export function getAuthPayload(req: NextRequest): AuthPayload | null {
  const token = req.cookies.get("wbos_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function getBusinessId(req: NextRequest): string | null {
  return getAuthPayload(req)?.businessId || null;
}

export async function getActiveWbosAuth(req: NextRequest): Promise<AuthPayload | null> {
  const payload = getAuthPayload(req);
  if (!payload?.userId || !payload.businessId) return null;

  const user = await prisma.wbosUser.findUnique({
    where: { id: payload.userId },
    select: {
      status: true,
      business: { select: { status: true, slug: true } },
    },
  });

  if (user?.status !== "active" || user.business?.status !== "active") {
    return null;
  }

  return {
    ...payload,
    slug: user.business.slug || payload.slug || "sadaat",
  };
}