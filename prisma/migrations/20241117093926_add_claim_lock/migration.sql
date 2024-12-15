-- CreateTable
CREATE TABLE "claim_lock" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "lastClaimTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_lock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claim_lock_address_key" ON "claim_lock"("address");

-- CreateIndex
CREATE INDEX "claim_lock_address_idx" ON "claim_lock"("address");

-- AddForeignKey
ALTER TABLE "claim_lock" ADD CONSTRAINT "claim_lock_address_fkey" FOREIGN KEY ("address") REFERENCES "Balance"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
