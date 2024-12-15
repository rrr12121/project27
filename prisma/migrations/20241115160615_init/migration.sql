-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balance_address_key" ON "Balance"("address");

-- CreateIndex
CREATE INDEX "Balance_address_idx" ON "Balance"("address");

-- CreateIndex
CREATE INDEX "Transaction_address_idx" ON "Transaction"("address");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_address_fkey" FOREIGN KEY ("address") REFERENCES "Balance"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
