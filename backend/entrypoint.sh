#!/bin/sh
set -eu
node /opt/migrations/node_modules/prisma/build/index.js migrate deploy
if [ "${SEED_ON_START:-false}" = "true" ]; then
  node prisma/seed.cjs
fi
exec node dist/main.js
