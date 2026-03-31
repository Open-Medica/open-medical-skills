#!/bin/bash
# Setup script for D1 database and Vectorize index

set -e

echo "Setting up D1 database..."

# Create D1 database
wrangler d1 create openmedicalskills

echo ""
echo "IMPORTANT: Add the returned database_id to wrangler.toml and secrets"
echo ""
echo "Then run migrations:"
echo "wrangler d1 migrations apply openmedicalskills --local"
echo "wrangler d1 migrations apply openmedicalskills --remote"
echo ""
echo "And seed the database:"
echo "wrangler d1 execute openmedicalskills --file=./migrations/0002_seed.sql --remote"
echo ""

echo "Setting up Vectorize index..."
# Create Vectorize index with 768 dimensions (compatible with many embedding models)
wrangler vectorize create openmedicalskills-skills --dimensions=768 --metric=cosine

echo ""
echo "IMPORTANT: Add the vectorize configuration to wrangler.toml"
