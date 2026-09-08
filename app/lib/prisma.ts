// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from 'dotenv';
import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

// Load .env.local
dotenv.config({ path: '.env.local' });

// Use DIRECT_URL for serverless environments (Vercel) - this is the direct connection on port 5432
// DATABASE_URL typically points to connection pooler on port 6543 which can cause pool exhaustion
const baseConnectionString =
  getOptionalEnv("DIRECT_URL") || getRequiredEnv("DATABASE_URL");

// Ensure connection pool settings for Vercel serverless environment
// connection_limit=60 allows more concurrent connections
// pool_timeout=10 closes idle connections quickly to prevent exhaustion
let connectionString = baseConnectionString;
if (!connectionString.includes("connection_limit")) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}connection_limit=60`;
}
if (!connectionString.includes("pool_timeout")) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}pool_timeout=10`;
}

console.log("[PRISMA] Using connection string with pool settings:", 
  connectionString.includes("connection_limit=60") && connectionString.includes("pool_timeout=10") ? "configured" : "missing");

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}