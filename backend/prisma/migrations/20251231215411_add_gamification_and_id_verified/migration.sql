-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'NGO', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "GiveawayStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EligibilityGender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'ALL');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INTERESTED', 'SELECTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WINNER_SELECTED', 'DRAW_CLOSED', 'NEW_MESSAGE', 'GIVEAWAY_REMINDER', 'NGO_VERIFIED', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "NGOStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('NGO', 'CHARITY', 'FOUNDATION', 'FAITH_BASED', 'COMMUNITY_ORG', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUEST_INFO');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "TransparencyReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportFrequency" AS ENUM ('QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "FocusArea" AS ENUM ('EDUCATION', 'HEALTH', 'RELIEF', 'WOMEN', 'YOUTH', 'ENVIRONMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('EMERGING', 'TRUSTED', 'HIGHLY_TRUSTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "gender" "Gender" NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "googleId" TEXT,
    "appleId" TEXT,
    "gamificationPoints" INTEGER NOT NULL DEFAULT 0,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngo_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "yearEstablished" INTEGER,
    "registrationNumber" TEXT NOT NULL,
    "taxExemptionId" TEXT,
    "website" TEXT,
    "officialEmail" TEXT NOT NULL,
    "officialPhone" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactNationalId" TEXT,
    "status" "NGOStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verifiedByUserId" TEXT,
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "totalGiveaways" INTEGER NOT NULL DEFAULT 0,
    "totalBeneficiaries" INTEGER NOT NULL DEFAULT 0,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "logo" TEXT,
    "missionStatement" TEXT,
    "focusAreas" "FocusArea"[],
    "hasGovernmentRecognition" BOOLEAN NOT NULL DEFAULT false,
    "governmentRecognitionBadge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngo_documents" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ngo_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngo_reviews" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "riskFlags" JSONB,
    "requestedInfo" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ngo_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_points" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactPhone" TEXT,
    "hours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "badge_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" JSONB,
    "icon" TEXT,
    "color" TEXT,
    "isNGO" BOOLEAN NOT NULL DEFAULT false,
    "isAutoAward" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_assignments" (
    "id" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "userId" TEXT,
    "ngoProfileId" TEXT,
    "giveawayId" TEXT,
    "awardedById" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "badge_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "givingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedbackScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trustLevel" TEXT NOT NULL DEFAULT 'NEW',
    "successfulGives" INTEGER NOT NULL DEFAULT 0,
    "successfulReceives" INTEGER NOT NULL DEFAULT 0,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "negativeReports" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_feedback" (
    "id" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "giveawayId" TEXT NOT NULL,
    "itemCondition" TEXT NOT NULL DEFAULT 'as-described',
    "communicationQuality" TEXT NOT NULL DEFAULT 'good',
    "wouldRecommend" BOOLEAN NOT NULL DEFAULT true,
    "comments" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_flags" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flagType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'none',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_impact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estimatedCO2Saved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedWasteDiverted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itemsCategoryBreakdown" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environmental_impact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_matching_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "giveawayId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proximity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categoryMatch" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeAvailability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trustAlignment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "pickups" (
    "id" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "pickupPointId" TEXT,
    "pickupCode" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImage" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringRule" JSONB,
    "totalGiveaways" INTEGER NOT NULL DEFAULT 0,
    "totalReached" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaways" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "category" TEXT,
    "location" TEXT NOT NULL,
    "eligibilityGender" "EligibilityGender" NOT NULL DEFAULT 'ALL',
    "eligibilityAgeMin" INTEGER,
    "eligibilityAgeMax" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "winnersCount" INTEGER NOT NULL DEFAULT 0,
    "status" "GiveawayStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "drawCompletedAt" TIMESTAMP(3),
    "drawLockKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "giveawayId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INTERESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" TEXT NOT NULL,
    "giveawayId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drawNumber" INTEGER NOT NULL DEFAULT 1,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "giveawayId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'web',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reportedUser" TEXT,
    "giveawayId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "otp_codes_userId_idx" ON "otp_codes"("userId");

-- CreateIndex
CREATE INDEX "otp_codes_code_idx" ON "otp_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_profiles_userId_key" ON "ngo_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_profiles_registrationNumber_key" ON "ngo_profiles"("registrationNumber");

-- CreateIndex
CREATE INDEX "ngo_profiles_status_idx" ON "ngo_profiles"("status");

-- CreateIndex
CREATE INDEX "ngo_profiles_registrationNumber_idx" ON "ngo_profiles"("registrationNumber");

-- CreateIndex
CREATE INDEX "ngo_profiles_country_idx" ON "ngo_profiles"("country");

-- CreateIndex
CREATE INDEX "ngo_documents_ngoProfileId_idx" ON "ngo_documents"("ngoProfileId");

-- CreateIndex
CREATE INDEX "ngo_documents_documentType_idx" ON "ngo_documents"("documentType");

-- CreateIndex
CREATE INDEX "ngo_reviews_ngoProfileId_idx" ON "ngo_reviews"("ngoProfileId");

-- CreateIndex
CREATE INDEX "ngo_reviews_reviewerId_idx" ON "ngo_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "ngo_reviews_status_idx" ON "ngo_reviews"("status");

-- CreateIndex
CREATE INDEX "pickup_points_ngoProfileId_idx" ON "pickup_points"("ngoProfileId");

-- CreateIndex
CREATE INDEX "pickup_points_isActive_idx" ON "pickup_points"("isActive");

-- CreateIndex
CREATE INDEX "ngo_transparency_reports_ngoProfileId_idx" ON "ngo_transparency_reports"("ngoProfileId");

-- CreateIndex
CREATE INDEX "ngo_transparency_reports_status_idx" ON "ngo_transparency_reports"("status");

-- CreateIndex
CREATE INDEX "ngo_transparency_reports_periodStart_periodEnd_idx" ON "ngo_transparency_reports"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "ngo_confidence_scores_ngoProfileId_idx" ON "ngo_confidence_scores"("ngoProfileId");

-- CreateIndex
CREATE INDEX "ngo_confidence_scores_calculatedAt_idx" ON "ngo_confidence_scores"("calculatedAt");

-- CreateIndex
CREATE INDEX "ngo_confidence_scores_totalScore_idx" ON "ngo_confidence_scores"("totalScore");

-- CreateIndex
CREATE UNIQUE INDEX "badge_definitions_code_key" ON "badge_definitions"("code");

-- CreateIndex
CREATE INDEX "badge_assignments_userId_idx" ON "badge_assignments"("userId");

-- CreateIndex
CREATE INDEX "badge_assignments_ngoProfileId_idx" ON "badge_assignments"("ngoProfileId");

-- CreateIndex
CREATE INDEX "badge_assignments_badgeId_idx" ON "badge_assignments"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "badge_assignments_badgeId_userId_key" ON "badge_assignments"("badgeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "badge_assignments_badgeId_ngoProfileId_key" ON "badge_assignments"("badgeId", "ngoProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "trust_scores_userId_key" ON "trust_scores"("userId");

-- CreateIndex
CREATE INDEX "trust_scores_userId_idx" ON "trust_scores"("userId");

-- CreateIndex
CREATE INDEX "trust_scores_totalScore_idx" ON "trust_scores"("totalScore");

-- CreateIndex
CREATE INDEX "trust_scores_trustLevel_idx" ON "trust_scores"("trustLevel");

-- CreateIndex
CREATE INDEX "transaction_feedback_giverId_idx" ON "transaction_feedback"("giverId");

-- CreateIndex
CREATE INDEX "transaction_feedback_receiverId_idx" ON "transaction_feedback"("receiverId");

-- CreateIndex
CREATE INDEX "transaction_feedback_giveawayId_idx" ON "transaction_feedback"("giveawayId");

-- CreateIndex
CREATE INDEX "transaction_feedback_flagged_idx" ON "transaction_feedback"("flagged");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_feedback_giverId_receiverId_giveawayId_key" ON "transaction_feedback"("giverId", "receiverId", "giveawayId");

-- CreateIndex
CREATE INDEX "fraud_flags_userId_idx" ON "fraud_flags"("userId");

-- CreateIndex
CREATE INDEX "fraud_flags_riskScore_idx" ON "fraud_flags"("riskScore");

-- CreateIndex
CREATE INDEX "fraud_flags_action_idx" ON "fraud_flags"("action");

-- CreateIndex
CREATE UNIQUE INDEX "environmental_impact_userId_key" ON "environmental_impact"("userId");

-- CreateIndex
CREATE INDEX "environmental_impact_userId_idx" ON "environmental_impact"("userId");

-- CreateIndex
CREATE INDEX "smart_matching_scores_userId_idx" ON "smart_matching_scores"("userId");

-- CreateIndex
CREATE INDEX "smart_matching_scores_giveawayId_idx" ON "smart_matching_scores"("giveawayId");

-- CreateIndex
CREATE INDEX "smart_matching_scores_matchScore_idx" ON "smart_matching_scores"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "smart_matching_scores_userId_giveawayId_key" ON "smart_matching_scores"("userId", "giveawayId");

-- CreateIndex
CREATE INDEX "ngo_feedback_ngoProfileId_idx" ON "ngo_feedback"("ngoProfileId");

-- CreateIndex
CREATE INDEX "ngo_feedback_userId_idx" ON "ngo_feedback"("userId");

-- CreateIndex
CREATE INDEX "ngo_feedback_isApproved_idx" ON "ngo_feedback"("isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "pickups_winnerId_key" ON "pickups"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "pickups_pickupCode_key" ON "pickups"("pickupCode");

-- CreateIndex
CREATE INDEX "pickups_pickupCode_idx" ON "pickups"("pickupCode");

-- CreateIndex
CREATE INDEX "pickups_pickupPointId_idx" ON "pickups"("pickupPointId");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaigns_ngoProfileId_idx" ON "campaigns"("ngoProfileId");

-- CreateIndex
CREATE INDEX "campaigns_slug_idx" ON "campaigns"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "giveaways_drawLockKey_key" ON "giveaways"("drawLockKey");

-- CreateIndex
CREATE INDEX "giveaways_userId_idx" ON "giveaways"("userId");

-- CreateIndex
CREATE INDEX "giveaways_status_idx" ON "giveaways"("status");

-- CreateIndex
CREATE INDEX "giveaways_campaignId_idx" ON "giveaways"("campaignId");

-- CreateIndex
CREATE INDEX "giveaways_closedAt_idx" ON "giveaways"("closedAt");

-- CreateIndex
CREATE INDEX "participants_giveawayId_idx" ON "participants"("giveawayId");

-- CreateIndex
CREATE INDEX "participants_status_idx" ON "participants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "participants_userId_giveawayId_key" ON "participants"("userId", "giveawayId");

-- CreateIndex
CREATE INDEX "winners_giveawayId_idx" ON "winners"("giveawayId");

-- CreateIndex
CREATE UNIQUE INDEX "winners_giveawayId_userId_drawNumber_key" ON "winners"("giveawayId", "userId", "drawNumber");

-- CreateIndex
CREATE INDEX "messages_giveawayId_idx" ON "messages"("giveawayId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "device_tokens_platform_idx" ON "device_tokens"("platform");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_reportedBy_idx" ON "reports"("reportedBy");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_profiles" ADD CONSTRAINT "ngo_profiles_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_profiles" ADD CONSTRAINT "ngo_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_documents" ADD CONSTRAINT "ngo_documents_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_reviews" ADD CONSTRAINT "ngo_reviews_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_reviews" ADD CONSTRAINT "ngo_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_points" ADD CONSTRAINT "pickup_points_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_transparency_reports" ADD CONSTRAINT "ngo_transparency_reports_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_confidence_scores" ADD CONSTRAINT "ngo_confidence_scores_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_assignments" ADD CONSTRAINT "badge_assignments_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badge_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_assignments" ADD CONSTRAINT "badge_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_assignments" ADD CONSTRAINT "badge_assignments_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_feedback" ADD CONSTRAINT "transaction_feedback_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_feedback" ADD CONSTRAINT "transaction_feedback_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_feedback" ADD CONSTRAINT "transaction_feedback_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_impact" ADD CONSTRAINT "environmental_impact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_matching_scores" ADD CONSTRAINT "smart_matching_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_matching_scores" ADD CONSTRAINT "smart_matching_scores_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_feedback" ADD CONSTRAINT "ngo_feedback_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_feedback" ADD CONSTRAINT "ngo_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "winners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaways" ADD CONSTRAINT "giveaways_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaways" ADD CONSTRAINT "giveaways_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedUser_fkey" FOREIGN KEY ("reportedUser") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
