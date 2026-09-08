// app/api/wbos/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wbos_token")?.value;
    if (token) {
      let payload: any;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        // ignore invalid token
      }

      if (payload?.userId) {
        // ✅ FIXED: removed req.ip
        const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        await prisma.wbosAuditLog.create({
          data: {
            businessId: payload.businessId,
            userId: payload.userId,
            action: "logout",
            details: {
              device: userAgent,
              ip: ipAddress,
            },
            ipAddress,
            userAgent,
          },
        });
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("wbos_token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ error: "Logout failed" }, { status: 500 });
    response.cookies.delete("wbos_token");
    return response;
  }
}