-- CreateEnum
CREATE TYPE "VipStatus" AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');

-- AlterTable
ALTER TABLE "power_level" ADD COLUMN     "vipStatus" "VipStatus" NOT NULL DEFAULT 'Bronze';
