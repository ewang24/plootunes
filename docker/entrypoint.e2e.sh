#!/bin/sh
set -e

MEDIA_ROOT="${MEDIA_ROOT:-/app/media}"
COVERS_DIR="${COVERS_DIR:-/app/covers}"
mkdir -p "$MEDIA_ROOT" "$COVERS_DIR"

# Covers are pre-generated (e2e/tools/generateCatalog.mjs --covers-out) and seeded
# into album.cover_image, rather than produced at boot. `cp -a` below preserves
# mtime, so the scan matches every seeded row on path+mtime and skips it — meaning
# its writeCover() never runs and nothing else would populate this directory.
stage_assets() {
  if [ -d "$1/media" ]; then cp -a "$1/media/." "$MEDIA_ROOT/"; fi
  if [ -d "$1/covers" ]; then cp -a "$1/covers/." "$COVERS_DIR/"; fi
}

node --experimental-strip-types packages/server/dist/db/migrate.js

if [ "$E2E_SKIP_SEED" != "true" ]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /app/e2e/baseline/seed.sql
fi

stage_assets /app/e2e/baseline/assets

if [ -n "$SCENARIO" ]; then
  scenario_dir="/app/e2e/scenarios/$SCENARIO"
  if [ ! -d "$scenario_dir" ]; then
    echo "ERROR: scenario '$SCENARIO' not found at $scenario_dir"
    exit 1
  fi
  for sql_file in "$scenario_dir"/*.sql; do
    [ -f "$sql_file" ] || continue
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$sql_file"
  done
  stage_assets "$scenario_dir/assets"
fi

exec node --experimental-strip-types packages/server/dist/index.js
