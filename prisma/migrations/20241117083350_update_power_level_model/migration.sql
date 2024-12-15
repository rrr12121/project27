/*
  Warnings:

  - You are about to drop the `PowerLevel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PowerLevel" DROP CONSTRAINT "PowerLevel_address_fkey";

-- DropTable
DROP TABLE "PowerLevel";

-- CreateTable
CREATE TABLE "power_level" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "power_level_pkey" PRIMARY KEY ("id")
);
