-- CreateEnum
CREATE TYPE "TransparencyReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "ReportFrequency" AS ENUM ('QUARTERLY', 'ANNUAL');
CREATE TYPE "FocusArea" AS ENUM ('EDUCATION', 'HEALTH', 'RELIEF', 'WOMEN', 'YOUTH', 'ENVIRONMENT', 'OTHER');
CREATE TYPE "ConfidenceLevel" AS ENUM ('EMERGING', 'TRUSTED', 'HIGHLY_TRUSTED');

-- Add PENDING_VERIFICATION enum value if it doesn't exist
-- Note: PostgreSQL requires enum additions to be committed before use
-- So we'll add it here, and handle data migration in application code or separate migration
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'PENDING_VERIFICATION' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'NGOStatus')
  ) THEN
    ALTER TYPE "NGOStatus" ADD VALUE 'PENDING_VERIFICATION';
  END IF;
END $$;

-- Note: We cannot update PENDING to PENDING_VERIFICATION in the same transaction
-- This will be handled by application code or a follow-up migration
-- For now, PENDING records will remain as PENDING until manually updated

-- AlterTable: Add new columns to ngo_profiles (nullable first, then update, then make required)
ALTER TABLE "ngo_profiles" ADD COLUMN IF NOT EXISTS "logo" TEXT;
ALTER TABLE "ngo_profiles" ADD COLUMN IF NOT EXISTS "missionStatement" TEXT;
ALTER TABLE "ngo_profiles" ADD COLUMN IF NOT EXISTS "focusAreas" "FocusArea"[] DEFAULT ARRAY[]::"FocusArea"[];
ALTER TABLE "ngo_profiles" ADD COLUMN IF NOT EXISTS "hasGovernmentRecognition" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ngo_profiles" ADD COLUMN IF NOT EXISTS "governmentRecognitionBadge" TEXT;
ALTER TABLE "ngo_profiles" ADD COLUMN IF NOT EXISTS "verifiedByUserId" TEXT;

-- Update existing records with default values for required fields that might be missing
UPDATE "ngo_profiles" 
SET 
  "country" = COALESCE("country", 'Unknown'),
  "city" = COALESCE("city", 'Unknown'),
  "address" = COALESCE("address", 'Not provided'),
  "organizationType" = COALESCE("organizationType"::text, 'OTHER')::"OrganizationType",
  "officialEmail" = COALESCE("officialEmail", "contactEmail", 'notprovided@example.com'),
  "officialPhone" = COALESCE("officialPhone", "contactPhone", '0000000000'),
  "contactName" = COALESCE("contactName", 'Contact Person'),
  "contactRole" = COALESCE("contactRole", 'Representative'),
  "contactEmail" = COALESCE("contactEmail", 'notprovided@example.com'),
  "contactPhone" = COALESCE("contactPhone", '0000000000')
WHERE 
  "country" IS NULL OR 
  "city" IS NULL OR 
  "address" IS NULL OR 
  "organizationType" IS NULL OR
  "officialEmail" IS NULL OR
  "officialPhone" IS NULL OR
  "contactName" IS NULL OR
  "contactRole" IS NULL OR
  "contactEmail" IS NULL OR
  "contactPhone" IS NULL;

-- Now make columns required (if they weren't already)
ALTER TABLE "ngo_profiles" ALTER COLUMN "country" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "city" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "address" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "organizationType" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "officialEmail" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "officialPhone" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "contactName" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "contactRole" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "contactEmail" SET NOT NULL;
ALTER TABLE "ngo_profiles" ALTER COLUMN "contactPhone" SET NOT NULL;

-- CreateTable: NGOTransparencyReport
CREATE TABLE "ngo_transparency_reports" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "reportFrequency" "ReportFrequency" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "campaignCount" INTEGER NOT NULL DEFAULT 0,
    "itemsDistributed" INTEGER NOT NULL DEFAULT 0,
    "locationsServed" TEXT[],
    "fundsReceivedMin" DOUBLE PRECISION,
    "fundsReceivedMax" DOUBLE PRECISION,
    "fundsUtilized" JSONB,
    "beneficiariesReached" INTEGER NOT NULL DEFAULT 0,
    "successStories" JSONB,
    "challenges" TEXT,
    "lessonsLearned" TEXT,
    "supportingDocuments" TEXT[],
    "status" "TransparencyReportStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_transparency_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable: NGOConfidenceScore
CREATE TABLE "ngo_confidence_scores" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "verificationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transparencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedbackScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hasGovernmentRecognition" BOOLEAN NOT NULL DEFAULT false,
    "adminTrustFlags" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceLevel" "ConfidenceLevel" NOT NULL DEFAULT 'EMERGING',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "factorsBreakdown" JSONB,

    CONSTRAINT "ngo_confidence_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable: NGOFeedback
CREATE TABLE "ngo_feedback" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "isPositive" BOOLEAN NOT NULL DEFAULT true,
    "relatedGiveawayId" TEXT,
    "relatedCampaignId" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ngo_transparency_reports_ngoProfileId_idx" ON "ngo_transparency_reports"("ngoProfileId");
CREATE INDEX "ngo_transparency_reports_status_idx" ON "ngo_transparency_reports"("status");
CREATE INDEX "ngo_transparency_reports_periodStart_periodEnd_idx" ON "ngo_transparency_reports"("periodStart", "periodEnd");
CREATE INDEX "ngo_confidence_scores_ngoProfileId_idx" ON "ngo_confidence_scores"("ngoProfileId");
CREATE INDEX "ngo_confidence_scores_calculatedAt_idx" ON "ngo_confidence_scores"("calculatedAt");
CREATE INDEX "ngo_confidence_scores_totalScore_idx" ON "ngo_confidence_scores"("totalScore");
CREATE INDEX "ngo_feedback_ngoProfileId_idx" ON "ngo_feedback"("ngoProfileId");
CREATE INDEX "ngo_feedback_userId_idx" ON "ngo_feedback"("userId");
CREATE INDEX "ngo_feedback_isApproved_idx" ON "ngo_feedback"("isApproved");

-- AddForeignKey
ALTER TABLE "ngo_profiles" ADD CONSTRAINT "ngo_profiles_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ngo_transparency_reports" ADD CONSTRAINT "ngo_transparency_reports_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ngo_confidence_scores" ADD CONSTRAINT "ngo_confidence_scores_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ngo_feedback" ADD CONSTRAINT "ngo_feedback_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ngo_feedback" ADD CONSTRAINT "ngo_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

