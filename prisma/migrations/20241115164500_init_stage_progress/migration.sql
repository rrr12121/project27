-- CreateTable
CREATE TABLE IF NOT EXISTS "stage_progress" (
    "id" SERIAL NOT NULL,
    "amountRaised" BIGINT NOT NULL DEFAULT 0,
    "targetAmount" BIGINT NOT NULL DEFAULT 10000000,
    "currentStage" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stage_progress_pkey" PRIMARY KEY ("id")
);

-- Insert initial record if it doesn't exist
INSERT INTO "stage_progress" ("id", "amountRaised", "targetAmount", "currentStage", "updatedAt")
SELECT 1, 0, 10000000, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "stage_progress" WHERE id = 1);

-- Update existing record if it exists with wrong target amount
UPDATE "stage_progress"
SET "targetAmount" = 10000000
WHERE "id" = 1 AND "targetAmount" != 10000000;
