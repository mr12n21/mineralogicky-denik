#!/bin/bash

# Jednoduchy manualni backup script
# Pouziti: ./manual-backup.sh

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"

echo "==> Zacinam zalohu $TIMESTAMP..."

# Vytvorit backup adresar
mkdir -p "$BACKUP_DIR"

# 1. Zaloha databaze
echo "==> Zalouhuji databazi..."
docker exec mineralogy-db pg_dump -U mineralogy -d mineralogy_db -F c > "$BACKUP_DIR/db_backup_$TIMESTAMP.dump"
echo "    Databaze ulozena: $BACKUP_DIR/db_backup_$TIMESTAMP.dump"

# 2. Zaloha fotografii
echo "==> Zalouhuji fotografie..."
docker run --rm \
  -v mineralogicky-denik_uploads_data:/data:ro \
  -v $(pwd)/backups:/backup \
  alpine tar -czf "/backup/uploads_backup_$TIMESTAMP.tar.gz" -C /data .
echo "    Fotografie ulozeny: $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"

# Velikost zaloh
echo ""
echo "==> Zaloha hotova!"
echo "Velikost zaloh:"
ls -lh "$BACKUP_DIR"/*$TIMESTAMP* | awk '{print "    " $9 " - " $5}'

echo ""
echo "Pro obnoveni:"
echo "  Databaze:   docker exec -i mineralogy-db pg_restore -U mineralogy -d mineralogy_db -c < $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
echo "  Fotografie: docker run --rm -v mineralogicky-denik_uploads_data:/data -v \$(pwd)/backups:/backup alpine tar -xzf /backup/uploads_backup_$TIMESTAMP.tar.gz -C /data"
