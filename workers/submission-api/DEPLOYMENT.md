# Deployment Guide - OMS Submission API

## Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **GitHub fine-grained token** with permissions:
   - Repository: `open-medical-skills/open-medical-skills`
   - Permissions:
     - Contents: Read & Write
     - Pull Requests: Read & Write
     - Metadata: Read
3. **Wrangler CLI** installed: `npm install -g wrangler`

## Initial Setup

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

### 2. Create KV Namespaces

```bash
# Production namespace
wrangler kv:namespace create RATE_LIMIT

# Preview namespace (for development)
wrangler kv:namespace create RATE_LIMIT --preview
```

This will output KV namespace IDs. Copy them to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your-production-namespace-id"
preview_id = "your-preview-namespace-id"
```

### 3. Set GitHub Token Secret

```bash
wrangler secret put GITHUB_TOKEN
# Paste your GitHub fine-grained token when prompted
```

### 4. Update Environment Variables

Edit `wrangler.toml` and update:

```toml
[vars]
GITHUB_OWNER = "your-github-org"
GITHUB_REPO = "your-repo-name"
ALLOWED_ORIGINS = "https://yoursite.com,https://www.yoursite.com"
```

## Deployment

### Production Deployment

```bash
cd workers/submission-api
npm install
npm run deploy
```

The Worker will be deployed to: `https://oms-submission-api.your-subdomain.workers.dev`

### Development Deployment

```bash
wrangler deploy --env dev
```

This deploys to a separate dev environment with relaxed CORS (`ALLOWED_ORIGINS = "*"`).

## Custom Domain (Recommended)

1. Go to Cloudflare Dashboard → Workers & Pages → oms-submission-api
2. Click "Triggers" → "Add Custom Domain"
3. Add: `api.openmedica.us` (or your preferred subdomain)
4. DNS records will be created automatically

Update your frontend to call: `https://api.openmedica.us/api/submit`

## Monitoring

### View Live Logs

```bash
wrangler tail
```

### Check KV Rate Limit Data

```bash
wrangler kv:key list --binding RATE_LIMIT
wrangler kv:key get "ratelimit:1.2.3.4" --binding RATE_LIMIT
```

### Analytics

View in Cloudflare Dashboard:
- Workers & Pages → oms-submission-api → Metrics
- Shows request count, errors, CPU time

## Testing

### Local Development

```bash
npm run dev
```

Worker runs at: `http://localhost:8787`

### Test Submission

```bash
curl -X POST http://localhost:8787/api/submit \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "name": "test-skill",
    "display_name": "Test Skill",
    "description": "A test medical skill",
    "author": "Dr. Test",
    "repository": "https://github.com/test/test-skill",
    "category": "education"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Submission received successfully",
  "pr_url": "https://github.com/open-medical-skills/open-medical-skills/pull/123"
}
```

## GitHub Actions Integration

Update your GitHub Actions workflow to set Cloudflare secrets:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: open-medical-skills
          directory: dist
```

### Required GitHub Secrets

Go to: Repository → Settings → Secrets and Variables → Actions

Add:
- `CLOUDFLARE_API_TOKEN` - From Cloudflare Dashboard → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID` - From Cloudflare Dashboard URL

## Troubleshooting

### "Rate limit exceeded" errors

Clear rate limits for testing:

```bash
wrangler kv:key delete "ratelimit:YOUR_IP" --binding RATE_LIMIT
```

### CORS errors in browser

Check that your frontend origin is in `ALLOWED_ORIGINS`:

```toml
ALLOWED_ORIGINS = "https://yoursite.com,http://localhost:3000"
```

Redeploy after changes:

```bash
wrangler deploy
```

### GitHub API errors

Verify token permissions:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO
```

### Worker not found

Ensure deployment succeeded:

```bash
wrangler deployments list
```

## Rollback

View deployment history:

```bash
wrangler deployments list
```

Rollback to previous version:

```bash
wrangler rollback --message "Rolling back due to issue"
```

## Cost Estimates

Cloudflare Workers Free Tier:
- 100,000 requests/day
- 10ms CPU time/request

At 5 submissions/hour/IP with rate limiting:
- ~120 submissions/day typical
- Well within free tier

KV Free Tier:
- 100,000 reads/day
- 1,000 writes/day
- Easily sufficient for rate limiting

**Expected cost: $0/month** for typical usage.

## Security Checklist

- [ ] GitHub token is stored as Worker secret (not in code)
- [ ] CORS `ALLOWED_ORIGINS` is restrictive (not `*` in production)
- [ ] Rate limiting is enabled via KV
- [ ] Input validation prevents XSS in YAML
- [ ] Worker has no access to other repositories
- [ ] Custom domain uses HTTPS
- [ ] GitHub token has minimal required permissions

## Production Readiness

Before going live:

1. Test with 10+ sample submissions
2. Verify PRs are created correctly in GitHub
3. Test rate limiting by submitting 6+ times rapidly
4. Test CORS from actual frontend domain
5. Review GitHub Actions validation workflow
6. Set up monitoring alerts in Cloudflare
7. Document submission process for users

## Support

- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- GitHub API docs: https://docs.github.com/en/rest
- Wrangler CLI docs: https://developers.cloudflare.com/workers/wrangler/
