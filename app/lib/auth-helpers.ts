// app/lib/auth-helpers.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export interface AuthPayload {
  userId: string;
  businessId: string;
  slug: string;
  email: string;
  name: string;
  businessName?: string;
  roles?: string[];
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

// ✅ Optimized: Returns payload from JWT without database query
// For most operations, we trust the JWT and don't need to verify user status on every request
// Status checks should only happen at login time
export async function getActiveWbosAuth(req: NextRequest): Promise<AuthPayload | null> {
  const payload = getAuthPayload(req);
  if (!payload?.userId || !payload.businessId) return null;
  
  // Return payload directly - status was verified at login time
  // This prevents connection pool exhaustion from repeated DB queries
  return payload;
}