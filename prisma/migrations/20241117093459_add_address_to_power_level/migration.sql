-- First add the address column as nullable
ALTER TABLE "power_level" ADD COLUMN "address" TEXT;

-- Update existing records with a default address
-- We'll use the first balance address we find, or create a new one if none exists
DO $$
DECLARE
    default_address TEXT;
BEGIN
    -- Try to get an existing address from the Balance table
    SELECT address INTO default_address FROM "Balance" LIMIT 1;
    
    -- If no address exists, use a default one and create a Balance record
    IF default_address IS NULL THEN
        default_address := '0x0000000000000000000000000000000000000000';
        INSERT INTO "Balance" (address, amount, "createdAt", "updatedAt")
        VALUES (default_address, 0, NOW(), NOW());
    END IF;
    
    -- Update existing power_level records with the default address
    UPDATE "power_level" SET address = default_address WHERE address IS NULL;
END $$;

-- Now make the address column required
ALTER TABLE "power_level" ALTER COLUMN "address" SET NOT NULL;

-- Add unique constraint and index
CREATE UNIQUE INDEX "power_level_address_key" ON "power_level"("address");
CREATE INDEX "power_level_address_idx" ON "power_level"("address");

-- Add foreign key constraint
ALTER TABLE "power_level" ADD CONSTRAINT "power_level_address_fkey" 
FOREIGN KEY ("address") REFERENCES "Balance"("address") 
ON DELETE RESTRICT ON UPDATE CASCADE;
