// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ✅ Use DIRECT_URL (port 5432) for all queries – bypasses the 15‑connection limit
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log(`[PRISMA] Using database URL: ${connectionString?.includes("6543") ? "POOLED (6543) ❌" : "DIRECT (5432) ✅"}`);

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
