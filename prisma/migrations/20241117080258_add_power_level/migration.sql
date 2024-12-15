-- CreateTable
CREATE TABLE "PowerLevel" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PowerLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PowerLevel_address_key" ON "PowerLevel"("address");

-- CreateIndex
CREATE INDEX "PowerLevel_address_idx" ON "PowerLevel"("address");

-- AddForeignKey
ALTER TABLE "PowerLevel" ADD CONSTRAINT "PowerLevel_address_fkey" FOREIGN KEY ("address") REFERENCES "Balance"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
