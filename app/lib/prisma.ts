// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ✅ Use DIRECT_URL (port 5432) for all queries – bypasses the 15‑connection limit
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Safe logging: Only log host/port structure, never credentials
if (connectionString) {
  try {
    const url = new URL(connectionString);
    console.log(`[Prisma] Initializing pool for host: ${url.hostname}, port: ${url.port}`);
  } catch (e) {
    console.log('[Prisma] Initializing pool (URL parsing skipped for safety)');
  }
}

// Create a single pool instance per warm runtime
const globalForPrisma = globalThis as unknown as {
  _prismaClient: PrismaClient | undefined;
  _pool: Pool | undefined;
};

const getPool = () => {
  if (!globalForPrisma._pool) {
    globalForPrisma._pool = new Pool({
      connectionString,
      max: 4, // Conservative limit: 4 connections per Vercel instance
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return globalForPrisma._pool;
};

const getPrismaClient = () => {
  if (!globalForPrisma._prismaClient) {
    const pool = getPool();
    const adapter = new PrismaPg(pool);
    globalForPrisma._prismaClient = new PrismaClient({ 
      adapter,
      log: ["error", "warn"],
    });
  }
  return globalForPrisma._prismaClient;
};

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._prismaClient = prisma;
  globalForPrisma._pool = getPool();
}
