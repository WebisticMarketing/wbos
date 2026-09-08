// lib/auth/wbos-jwt.ts
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export interface WbosTokenPayload {
  userId: string;
  email: string;
  businessId: string;
  businessName: string;
  roles: string[];
  permissions: string[];
}

export function verifyWbosToken(token: string): WbosTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as WbosTokenPayload;
  } catch (error) {
    return null;
  }
}

export function generateWbosToken(payload: WbosTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}