-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "DigestChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('CAMPAIGN_LAUNCH_SOON', 'CAMPAIGN_ENDING', 'CAMPAIGN_LAUNCH_7DAYS', 'CAMPAIGN_LAUNCH_24HOURS', 'CAMPAIGN_LAUNCH_SAME_DAY');

-- CreateTable
CREATE TABLE "user_digest_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "frequency" "DigestFrequency" NOT NULL DEFAULT 'DAILY',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "channels" "DigestChannel"[] DEFAULT ARRAY['IN_APP']::"DigestChannel"[],
    "lastDigestSentAt" TIMESTAMP(3),
    "nextScheduledAt" TIMESTAMP(3),
    "includeNewPosts" BOOLEAN NOT NULL DEFAULT true,
    "includeCampaigns" BOOLEAN NOT NULL DEFAULT true,
    "includeCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_digest_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_reminder_settings" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sentAt" TIMESTAMP(3),
    "nextReminderAt" TIMESTAMP(3),
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_reminder_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_reminder_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_suggestions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suggestedNGOId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "reason" TEXT,
    "signalWeight" JSONB,
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "isFollowed" BOOLEAN NOT NULL DEFAULT false,
    "isIgnored" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "follow_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_digest_preferences_userId_idx" ON "user_digest_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_digest_preferences_nextScheduledAt_idx" ON "user_digest_preferences"("nextScheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_digest_preferences_userId_key" ON "user_digest_preferences"("userId");

-- CreateIndex
CREATE INDEX "campaign_reminder_settings_campaignId_idx" ON "campaign_reminder_settings"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_reminder_settings_nextReminderAt_idx" ON "campaign_reminder_settings"("nextReminderAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_reminder_settings_campaignId_reminderType_key" ON "campaign_reminder_settings"("campaignId", "reminderType");

-- CreateIndex
CREATE INDEX "campaign_reminder_logs_userId_idx" ON "campaign_reminder_logs"("userId");

-- CreateIndex
CREATE INDEX "campaign_reminder_logs_campaignId_idx" ON "campaign_reminder_logs"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_reminder_logs_sentAt_idx" ON "campaign_reminder_logs"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_reminder_logs_userId_campaignId_reminderType_key" ON "campaign_reminder_logs"("userId", "campaignId", "reminderType");

-- CreateIndex
CREATE INDEX "follow_suggestions_userId_idx" ON "follow_suggestions"("userId");

-- CreateIndex
CREATE INDEX "follow_suggestions_suggestedNGOId_idx" ON "follow_suggestions"("suggestedNGOId");

-- CreateIndex
CREATE INDEX "follow_suggestions_confidenceScore_createdAt_idx" ON "follow_suggestions"("confidenceScore", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "follow_suggestions_userId_suggestedNGOId_key" ON "follow_suggestions"("userId", "suggestedNGOId");

-- CreateIndex
CREATE INDEX "giveaways_userId_status_idx" ON "giveaways"("userId", "status");

-- CreateIndex
CREATE INDEX "giveaways_status_expiresAt_idx" ON "giveaways"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "giveaways_category_idx" ON "giveaways"("category");

-- CreateIndex
CREATE INDEX "giveaways_publishedAt_idx" ON "giveaways"("publishedAt");

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_receiverId_idx" ON "messages"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "participants_userId_idx" ON "participants"("userId");

-- CreateIndex
CREATE INDEX "participants_createdAt_idx" ON "participants"("createdAt");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_appleId_idx" ON "users"("appleId");

-- AddForeignKey
ALTER TABLE "user_digest_preferences" ADD CONSTRAINT "user_digest_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_reminder_settings" ADD CONSTRAINT "campaign_reminder_settings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_reminder_logs" ADD CONSTRAINT "campaign_reminder_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_reminder_logs" ADD CONSTRAINT "campaign_reminder_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_suggestions" ADD CONSTRAINT "follow_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_suggestions" ADD CONSTRAINT "follow_suggestions_suggestedNGOId_fkey" FOREIGN KEY ("suggestedNGOId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
