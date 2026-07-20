#!/bin/sh
set -e
echo "Running migrations..."
node --experimental-strip-types packages/server/dist/db/migrate.js
exec node --experimental-strip-types packages/server/dist/index.js
