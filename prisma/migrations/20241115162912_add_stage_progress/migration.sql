-- CreateTable
CREATE TABLE "stage_progress" (
    "id" SERIAL NOT NULL,
    "amountRaised" BIGINT NOT NULL DEFAULT 0,
    "targetAmount" BIGINT NOT NULL DEFAULT 10000000000,
    "currentStage" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stage_progress_pkey" PRIMARY KEY ("id")
);
