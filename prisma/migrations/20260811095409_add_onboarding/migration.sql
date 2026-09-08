-- CreateTable
CREATE TABLE "onboarding_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_steps" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_onboardings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not-started',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_onboarding_steps" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_onboarding_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "onboarding_templates_serviceType_idx" ON "onboarding_templates"("serviceType");

-- CreateIndex
CREATE INDEX "onboarding_steps_templateId_idx" ON "onboarding_steps"("templateId");

-- CreateIndex
CREATE INDEX "onboarding_steps_stepNumber_idx" ON "onboarding_steps"("stepNumber");

-- CreateIndex
CREATE INDEX "client_onboardings_clientId_idx" ON "client_onboardings"("clientId");

-- CreateIndex
CREATE INDEX "client_onboardings_status_idx" ON "client_onboardings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "client_onboardings_clientId_key" ON "client_onboardings"("clientId");

-- CreateIndex
CREATE INDEX "client_onboarding_steps_onboardingId_idx" ON "client_onboarding_steps"("onboardingId");

-- CreateIndex
CREATE INDEX "client_onboarding_steps_status_idx" ON "client_onboarding_steps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "client_onboarding_steps_onboardingId_stepId_key" ON "client_onboarding_steps"("onboardingId", "stepId");

-- AddForeignKey
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "onboarding_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboardings" ADD CONSTRAINT "client_onboardings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboardings" ADD CONSTRAINT "client_onboardings_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "onboarding_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboarding_steps" ADD CONSTRAINT "client_onboarding_steps_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "client_onboardings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboarding_steps" ADD CONSTRAINT "client_onboarding_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "onboarding_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
