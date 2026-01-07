#!/bin/bash

# PEPO Database Backup Cron Setup
# This script sets up automated database backups

# Configuration
BACKUP_DIR="/var/backups/pepo-db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
CRON_LOG="/var/log/pepo-backup.log"

echo "Setting up PEPO database backup cron jobs..."

# Create backup directory
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Make scripts executable
chmod +x "$BACKUP_SCRIPT"
chmod +x "$SCRIPT_DIR/restore.sh"

# Load environment variables from .env file
if [ -f "$SCRIPT_DIR/../.env" ]; then
  export $(cat "$SCRIPT_DIR/../.env" | grep -v '#' | xargs)
fi

# Create cron job entries
# Daily backup at 2 AM
DAILY_CRON="0 2 * * * $BACKUP_SCRIPT full 30 >> $CRON_LOG 2>&1"

# Weekly full backup at Sunday 3 AM (with 60-day retention)
WEEKLY_CRON="0 3 * * 0 $BACKUP_SCRIPT full 60 >> $CRON_LOG 2>&1"

# Hourly backup during business hours (7 AM - 7 PM)
HOURLY_CRON="0 7-19 * * * $BACKUP_SCRIPT scheduled 7 >> $CRON_LOG 2>&1"

echo "Cron job configuration:"
echo ""
echo "1. Daily backup (2 AM, 30-day retention):"
echo "   $DAILY_CRON"
echo ""
echo "2. Weekly full backup (Sunday 3 AM, 60-day retention):"
echo "   $WEEKLY_CRON"
echo ""
echo "3. Hourly scheduled backups (7 AM - 7 PM, 7-day retention):"
echo "   $HOURLY_CRON"
echo ""

# Check if crontab exists and contains our jobs
if (crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"); then
  echo "Cron jobs already installed for PEPO backups"
else
  echo "Installing cron jobs..."
  (crontab -l 2>/dev/null; echo "$DAILY_CRON"; echo "$WEEKLY_CRON"; echo "$HOURLY_CRON") | crontab -
  echo "✓ Cron jobs installed successfully"
fi

echo ""
echo "Backup configuration complete!"
echo "Backup directory: $BACKUP_DIR"
echo "Log file: $CRON_LOG"
echo ""
echo "To view scheduled cron jobs:"
echo "  crontab -l | grep backup.sh"
echo ""
echo "To restore a backup:"
echo "  $SCRIPT_DIR/restore.sh /var/backups/pepo-db/pepo_YYYY-MM-DD_HH-MM-SS.sql.gz"
