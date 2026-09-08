// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// ✅ Set the database URL via environment variable (simplest approach)
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Set the environment variable for Prisma to use
process.env.DATABASE_URL = dbUrl;

console.log(`[PRISMA] Using database URL: ${dbUrl?.includes("6543") ? "POOLED (6543) ❌" : "DIRECT (5432) ✅"}`);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
