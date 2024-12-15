-- CreateTable
CREATE TABLE "reward_balance" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_balance_address_key" ON "reward_balance"("address");

-- CreateIndex
CREATE INDEX "reward_balance_address_idx" ON "reward_balance"("address");

-- AddForeignKey
ALTER TABLE "reward_balance" ADD CONSTRAINT "reward_balance_address_fkey" FOREIGN KEY ("address") REFERENCES "Balance"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
