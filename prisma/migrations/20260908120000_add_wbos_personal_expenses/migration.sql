-- CreateTable
CREATE TABLE "wbos_personal_expenses" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wbos_personal_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wbos_personal_expenses_businessId_expenseDate_idx" ON "wbos_personal_expenses"("businessId", "expenseDate");
CREATE INDEX "wbos_personal_expenses_userId_expenseDate_idx" ON "wbos_personal_expenses"("userId", "expenseDate");

-- AddForeignKey
ALTER TABLE "wbos_personal_expenses" ADD CONSTRAINT "wbos_personal_expenses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "wbos_businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wbos_personal_expenses" ADD CONSTRAINT "wbos_personal_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "wbos_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

