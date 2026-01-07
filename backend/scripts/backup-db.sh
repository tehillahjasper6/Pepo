#!/bin/bash

# PEPO Database Backup Script
# Performs automated PostgreSQL database backups with retention policy

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-pepo}"
DB_USER="${DB_USER:-visionalventure}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pepo_backup_${TIMESTAMP}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] Starting database backup...${NC}"

# Perform backup
if PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -p "${DB_PORT}" \
  -v \
  | gzip > "${BACKUP_FILE}"; then
  
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed successfully!${NC}"
  echo -e "${GREEN}File: ${BACKUP_FILE}${NC}"
  echo -e "${GREEN}Size: ${BACKUP_SIZE}${NC}"
else
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] Backup failed!${NC}"
  exit 1
fi

# Remove old backups (retention policy)
echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"

find "${BACKUP_DIR}" -name "pepo_backup_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

# List all backups
echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] Current backups:${NC}"
ls -lh "${BACKUP_DIR}"/pepo_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] Backup process completed!${NC}"
