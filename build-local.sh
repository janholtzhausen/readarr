#!/usr/bin/env bash
set -euo pipefail

REGISTRY="192.168.1.5:15000"
IMAGE="$REGISTRY/readarr:latest"
SERVER="192.168.1.4"
SERVICE="readarr"

# ── 1. Build backend + frontend ───────────────────────────────────────────────
echo "==> Building backend..."
./build.sh --backend
echo "==> Building frontend..."
./build.sh --frontend
echo "==> Build complete."

# ── 3. Build Docker image ─────────────────────────────────────────────────────
echo "==> Building Docker image $IMAGE ..."
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
docker build \
  -f docker/Dockerfile.local \
  -t "$IMAGE" \
  --build-arg GIT_BRANCH=main \
  --build-arg COMMIT_HASH="$COMMIT" \
  --build-arg BUILD_DATE="$(date --rfc-3339=date)" \
  --build-arg METADATA_URL=https://hardcover.bookinfo.pro \
  --build-arg HARDCOVER=true \
  .
echo "==> Image built."

# ── 4. Push to local registry ─────────────────────────────────────────────────
echo "==> Pushing to $IMAGE ..."
docker push "$IMAGE"
echo "==> Pushed."

# ── 5. Deploy ────────────────────────────────────────────────────────────────
echo "==> Deploying on $SERVER ..."
ssh "janh@$SERVER" "cd /mnt/tank/media/multimedia && docker compose pull $SERVICE && docker compose up -d $SERVICE"
echo "==> Deployed. Done."
