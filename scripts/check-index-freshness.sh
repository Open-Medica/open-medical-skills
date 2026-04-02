#!/usr/bin/env bash
set -euo pipefail

echo "Checking index freshness..."

cp cli/data/skills-index.json /tmp/oms-committed-index.json
cp api/migrations/0002_seed.sql /tmp/oms-committed-seed.sql 2>/dev/null || true

node scripts/generate-cli-index.js > /dev/null
node scripts/generate-sql-seed.js > /dev/null

if ! diff -q cli/data/skills-index.json /tmp/oms-committed-index.json > /dev/null 2>&1; then
  echo "STALE: cli/data/skills-index.json needs regeneration"
  cp /tmp/oms-committed-index.json cli/data/skills-index.json
  exit 1
fi

if [ -f /tmp/oms-committed-seed.sql ]; then
  sed '/^-- Generated:/d' api/migrations/0002_seed.sql > /tmp/oms-new-seed.sql
  sed '/^-- Generated:/d' /tmp/oms-committed-seed.sql > /tmp/oms-old-seed.sql
  if ! diff -q /tmp/oms-new-seed.sql /tmp/oms-old-seed.sql > /dev/null 2>&1; then
    echo "STALE: api/migrations/0002_seed.sql needs regeneration"
    cp /tmp/oms-committed-seed.sql api/migrations/0002_seed.sql
    exit 1
  fi
fi

echo "All generated files are fresh."
