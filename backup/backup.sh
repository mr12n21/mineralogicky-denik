#!/bin/bash

set -e

# Configuration from environment variables
DB_HOST="${DB_HOST:-postgres}"
DB_NAME="${DB_NAME:-mineralogy_db}"
DB_USER="${DB_USER:-mineralogy}"
DB_PASSWORD="${DB_PASSWORD:-changeme123}"
NAS_PATH="${NAS_PATH:-/mnt/nas/backups}"
BACKUP_DIR="/backup"

# Timestamp for backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "[$BACKUP_DATE] Starting backup..."

# Create backup directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$NAS_PATH"

# Database backup
echo "[$BACKUP_DATE] Backing up database..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  -F c -b -v -f "$BACKUP_DIR/db_backup_$TIMESTAMP.dump"

if [ $? -eq 0 ]; then
    echo "[$BACKUP_DATE] Database backup completed successfully"
else
    echo "[$BACKUP_DATE] Database backup failed!"
    exit 1
fi

# Upload files backup
echo "[$BACKUP_DATE] Backing up upload files..."
if [ -d "/data/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" -C /data uploads
    echo "[$BACKUP_DATE] Upload files backup completed"
else
    echo "[$BACKUP_DATE] No upload directory found, skipping..."
fi

# Sync to NAS
echo "[$BACKUP_DATE] Syncing backups to NAS..."
rsync -av --delete "$BACKUP_DIR/" "$NAS_PATH/"

if [ $? -eq 0 ]; then
    echo "[$BACKUP_DATE] Backup synced to NAS successfully"
else
    echo "[$BACKUP_DATE] Failed to sync to NAS!"
    exit 1
fi

# Clean up old backups (keep last 7 days)
echo "[$BACKUP_DATE] Cleaning up old backups..."
find "$BACKUP_DIR" -name "db_backup_*.dump" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +7 -delete
find "$NAS_PATH" -name "db_backup_*.dump" -mtime +7 -delete
find "$NAS_PATH" -name "uploads_backup_*.tar.gz" -mtime +7 -delete

echo "[$BACKUP_DATE] Backup process completed!"
echo "----------------------------------------"
