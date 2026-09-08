// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// ✅ Use DIRECT_URL (port 5432) for all queries to bypass the 15-connection pool limit
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log(`[PRISMA] Using database URL: ${dbUrl?.includes("6543") ? "POOLED (6543) ❌" : "DIRECT (5432) ✅"}`);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
