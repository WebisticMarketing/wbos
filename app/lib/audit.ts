// app/lib/audit.ts
import { prisma } from "./prisma";

export interface AuditLogData {
  businessId: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.wbosAuditLog.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        action: data.action,
        details: data.details || {},
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Fail silently – don't break the main operation
  }
}