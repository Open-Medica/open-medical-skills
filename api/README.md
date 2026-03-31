# Open Medical Skills API

REST API for the Open Medical Skills registry.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/api/health` | Health check |
| GET | `/api/skills` | List all skills |
| GET | `/api/skills/:name` | Get skill details |
| GET | `/api/skills/search?q=` | Search skills |
| GET | `/api/skills/search/vector?q=` | Semantic search |
| GET | `/api/categories` | List categories |
| GET | `/api/stats` | Statistics |

## Setup

```bash
# Install dependencies
npm install

# Create D1 database
wrangler d1 create openmedica-skills

# Update wrangler.toml with database_id

# Run migrations
wrangler d1 migrations apply openmedica-skills --local
wrangler d1 migrations apply openmedica-skills --remote

# Seed data
wrangler d1 execute openmedica-skills --file=./migrations/0002_seed.sql --remote

# Create Vectorize index
wrangler vectorize create openmedica-skills-vectors --dimensions=768 --metric=cosine
```

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_D1_DATABASE_ID` | D1 database ID |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |

## GitHub Secrets

Configure these in GitHub Settings > Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
