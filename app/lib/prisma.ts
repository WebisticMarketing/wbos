// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from 'dotenv';
import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

// Load .env.local
dotenv.config({ path: '.env.local' });

const connectionString =
  getOptionalEnv("DIRECT_URL") || getRequiredEnv("DATABASE_URL");

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