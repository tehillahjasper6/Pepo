-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NGO_NEW_POST';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "link" TEXT,
ADD COLUMN     "referenceId" TEXT;

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ngoId" TEXT,
    "type" "NotificationType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "follows_userId_idx" ON "follows"("userId");

-- CreateIndex
CREATE INDEX "follows_ngoId_idx" ON "follows"("ngoId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_userId_ngoId_key" ON "follows"("userId", "ngoId");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_ngoId_idx" ON "notification_preferences"("ngoId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_ngoId_type_key" ON "notification_preferences"("userId", "ngoId", "type");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
