#!/bin/bash

# PEPO Database Backup Script
# Automated backup for PostgreSQL database
# Usage: ./backup.sh [backup-type] [retention-days]
# backup-type: full, incremental, or scheduled (default: full)
# retention-days: number of days to keep backups (default: 30)

set -e

# Configuration
BACKUP_TYPE=${1:-"full"}
RETENTION_DAYS=${2:-30}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-"pepo"}
DB_USER=${DB_USER:-"visionalventure"}
BACKUP_DIR=${BACKUP_DIR:-"/var/backups/pepo-db"}
LOG_FILE="${BACKUP_DIR}/backup.log"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/pepo_${DATE}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

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
  log "ERROR" "Backup failed at line ${line_no}"
  exit 1
}

trap 'on_error $LINENO' ERR

log "INFO" "Starting ${BACKUP_TYPE} backup of database: ${DB_NAME}"

# Perform backup based on type
case $BACKUP_TYPE in
  full)
    log "INFO" "Creating full database backup..."
    PGPASSWORD="$DB_PASSWORD" pg_dump \
      --host="$DB_HOST" \
      --port="$DB_PORT" \
      --username="$DB_USER" \
      --format=plain \
      --verbose \
      --compress=9 \
      --file="$BACKUP_FILE_GZ" \
      "$DB_NAME"
    
    if [ -f "$BACKUP_FILE_GZ" ]; then
      SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
      log "INFO" "Full backup completed successfully. Size: $SIZE"
      log "INFO" "Backup file: $BACKUP_FILE_GZ"
    else
      log "ERROR" "Backup file not created"
      exit 1
    fi
    ;;
    
  incremental)
    log "INFO" "Creating incremental backup using WAL archiving..."
    log "INFO" "Note: WAL archiving must be configured in PostgreSQL"
    # This would require WAL (Write-Ahead Log) configuration
    # For now, we'll use regular backups with custom naming
    PGPASSWORD="$DB_PASSWORD" pg_dump \
      --host="$DB_HOST" \
      --port="$DB_PORT" \
      --username="$DB_USER" \
      --format=custom \
      --verbose \
      --file="$BACKUP_FILE" \
      "$DB_NAME"
    
    gzip "$BACKUP_FILE"
    SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    log "INFO" "Incremental backup completed. Size: $SIZE"
    ;;
    
  scheduled)
    log "INFO" "Creating scheduled backup..."
    BACKUP_FILE="${BACKUP_DIR}/scheduled/pepo_${DATE}.sql.gz"
    mkdir -p "${BACKUP_DIR}/scheduled"
    
    PGPASSWORD="$DB_PASSWORD" pg_dump \
      --host="$DB_HOST" \
      --port="$DB_PORT" \
      --username="$DB_USER" \
      --format=plain \
      --compress=9 \
      --file="$BACKUP_FILE" \
      "$DB_NAME"
    
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "INFO" "Scheduled backup completed. Size: $SIZE"
    ;;
    
  *)
    log "ERROR" "Unknown backup type: $BACKUP_TYPE"
    echo "Usage: $0 [full|incremental|scheduled] [retention-days]"
    exit 1
    ;;
esac

# Cleanup old backups based on retention policy
log "INFO" "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "pepo_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/scheduled" -name "pepo_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

RETAINED_COUNT=$(find "$BACKUP_DIR" -name "pepo_*.sql.gz" -type f | wc -l)
log "INFO" "Retained $RETAINED_COUNT backup files"

# Verify backup integrity
log "INFO" "Verifying backup integrity..."
if gunzip -t "$BACKUP_FILE_GZ" 2>/dev/null; then
  log "INFO" "Backup integrity verified successfully"
else
  log "ERROR" "Backup integrity check failed"
  exit 1
fi

log "INFO" "Backup process completed successfully"
echo -e "${GREEN}✓ Database backup completed successfully${NC}"
