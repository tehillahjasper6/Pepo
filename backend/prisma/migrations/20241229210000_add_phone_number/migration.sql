-- Add phone number fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- Create unique index on phone (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone") WHERE "phone" IS NOT NULL;

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users"("phone") WHERE "phone" IS NOT NULL;



