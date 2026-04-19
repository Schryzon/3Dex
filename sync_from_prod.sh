#!/bin/bash
# Bash script to sync Prod DB and MinIO down to Local environment

set -e

ENV_FILE="$(dirname "$0")/apps/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "\033[0;31mError: apps/backend/.env file not found.\033[0m"
    exit 1
fi

echo "Loading credentials from $ENV_FILE..."
# Export non-comment lines
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Construct Production specific URLs
PROD_DB_URL="postgresql://${DB_USER}:${DB_PASS}@${REMOTE_DB_HOST}:5432/${DB_NAME}"
PROD_MINIO_URL="${STORAGE_ENDPOINT}"
PROD_MINIO_ACCESS="${STORAGE_ACCESS_KEY}"
PROD_MINIO_SECRET="${STORAGE_SECRET_KEY}"

# Construct Local specific URLs
LOCAL_DB_URL="${DATABASE_URL}"
BUCKET_NAME="${STORAGE_BUCKET}"
LOCAL_MINIO_URL="http://localhost:9000"
LOCAL_MINIO_ACCESS="${LOCAL_STORAGE_ACCESS_KEY:-minioadmin}"
LOCAL_MINIO_SECRET="${LOCAL_STORAGE_SECRET_KEY:-minioadmin}"

echo -e "\033[0;36mTarget Prod DB: ${REMOTE_DB_HOST}\033[0m"
echo -e "\033[0;36mTarget Prod MinIO: ${PROD_MINIO_URL}\033[0m"

echo -e "\033[0;33mWARNING: THIS WILL OVERWRITE ALL LOCAL DATA WITH PRODUCTION DATA.\033[0m"
read -p "Are you sure you want to overwrite your LOCAL database and MinIO? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo -e "\n\033[0;36m1. Syncing Database (Prod -> Local)...\033[0m"
echo "> Dumping PROD database..."
pg_dump -Fc -d "$PROD_DB_URL" -f "prod_db_dump.custom"

echo "> Restoring to LOCAL database..."
# -c drops objects before recreating
pg_restore -c -d "$LOCAL_DB_URL" "prod_db_dump.custom" || true

rm "prod_db_dump.custom"
echo -e "\033[0;32mDatabase sync complete.\033[0m"

echo -e "\n\033[0;36m2. Syncing MinIO Storage (Prod -> Local)...\033[0m"

if ! command -v mc &> /dev/null; then
    echo "Warning: MinIO Client (mc) is not installed. Skipping storage sync."
else
    echo "> Setting up MinIO aliases..."
    mc alias set prodminio "$PROD_MINIO_URL" "$PROD_MINIO_ACCESS" "$PROD_MINIO_SECRET" > /dev/null
    mc alias set localminio "$LOCAL_MINIO_URL" "$LOCAL_MINIO_ACCESS" "$LOCAL_MINIO_SECRET" > /dev/null
    
    echo "> Mirroring bucket: $BUCKET_NAME"
    # Mirror with overwrite and remove extra files (from prod to local)
    mc mirror --overwrite --remove "prodminio/$BUCKET_NAME" "localminio/$BUCKET_NAME"
    echo -e "\033[0;32mStorage sync complete.\033[0m"
fi

echo -e "\n\033[0;32mLocal Environment Successfully Synced with Production!\033[0m"
