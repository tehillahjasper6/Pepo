# Multi-stage build for Admin Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN npm run build --workspace=@pepo/admin

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/public ./public
COPY --from=builder /app/apps/admin/.next/static ./.next/static

EXPOSE 3001

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]
