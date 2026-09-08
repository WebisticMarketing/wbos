-- Add tracker membership without changing WBOS account access
ALTER TABLE "wbos_users" ADD COLUMN "personalExpenseEnabled" BOOLEAN NOT NULL DEFAULT false;