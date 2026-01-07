-- CreateTable
CREATE TABLE "neighborhood_circles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neighborhood_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_circle_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "neighborhood_circle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_circle_posts" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "neighborhood_circle_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "neighborhood_circles_city_idx" ON "neighborhood_circles"("city");

-- CreateIndex
CREATE INDEX "neighborhood_circles_neighborhood_idx" ON "neighborhood_circles"("neighborhood");

-- CreateIndex
CREATE UNIQUE INDEX "neighborhood_circles_city_neighborhood_name_key" ON "neighborhood_circles"("city", "neighborhood", "name");

-- CreateIndex
CREATE INDEX "neighborhood_circle_members_circleId_idx" ON "neighborhood_circle_members"("circleId");

-- CreateIndex
CREATE INDEX "neighborhood_circle_members_userId_idx" ON "neighborhood_circle_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "neighborhood_circle_members_userId_circleId_key" ON "neighborhood_circle_members"("userId", "circleId");

-- CreateIndex
CREATE INDEX "neighborhood_circle_posts_circleId_idx" ON "neighborhood_circle_posts"("circleId");

-- CreateIndex
CREATE INDEX "neighborhood_circle_posts_userId_idx" ON "neighborhood_circle_posts"("userId");

-- AddForeignKey
ALTER TABLE "neighborhood_circle_members" ADD CONSTRAINT "neighborhood_circle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood_circle_members" ADD CONSTRAINT "neighborhood_circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "neighborhood_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood_circle_posts" ADD CONSTRAINT "neighborhood_circle_posts_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "neighborhood_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood_circle_posts" ADD CONSTRAINT "neighborhood_circle_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
