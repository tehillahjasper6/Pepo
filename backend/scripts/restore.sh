#!/bin/bash

# PEPO Database Restore Script
# Restores PostgreSQL database from backup
# Usage: ./restore.sh <backup-file> [database-name]

set -e

# Configuration
BACKUP_FILE=$1
DB_NAME=${2:-"pepo"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-"visionalventure"}
LOG_FILE="/var/backups/pepo-db/restore.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "[${timestamp}] [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Error handler
on_error() {
  local line_no=$1
  log "ERROR" "Restore failed at line ${line_no}"
  exit 1
}

trap 'on_error $LINENO' ERR

# Validate arguments
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not specified${NC}"
  echo "Usage: $0 <backup-file> [database-name]"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

log "INFO" "Starting database restore from: $BACKUP_FILE"

# Check if backup file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  log "INFO" "Backup file is compressed. Decompressing..."
  TEMP_FILE="/tmp/pepo_restore_temp.sql"
  gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
  RESTORE_FILE="$TEMP_FILE"
else
  RESTORE_FILE="$BACKUP_FILE"
fi

# Prompt for confirmation
echo -e "${YELLOW}WARNING: This will DROP and recreate the database '${DB_NAME}'${NC}"
read -p "Are you sure you want to continue? (yes/no): " -r CONFIRM

if [[ ! $CONFIRM =~ ^[Yy][Ee][Ss]$ ]]; then
  log "INFO" "Restore cancelled by user"
  exit 0
fi

log "INFO" "Dropping existing database (if exists)..."
PGPASSWORD="$DB_PASSWORD" psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  -tc "DROP DATABASE IF EXISTS \"$DB_NAME\";" || true

log "INFO" "Creating new database..."
PGPASSWORD="$DB_PASSWORD" psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  -tc "CREATE DATABASE \"$DB_NAME\";"

log "INFO" "Restoring database from backup..."
PGPASSWORD="$DB_PASSWORD" psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  < "$RESTORE_FILE"

# Cleanup temp file if created
if [ "$RESTORE_FILE" != "$BACKUP_FILE" ]; then
  rm -f "$RESTORE_FILE"
fi

log "INFO" "Database restore completed successfully"
echo -e "${GREEN}✓ Database restore completed successfully${NC}"
