# Open Medical Skills MCP Server

Model Context Protocol server for AI agents to access medical skills.

## Tools

| Tool | Description |
|------|-------------|
| `list_skills` | List all available skills |
| `search_skills` | Search skills by keyword |
| `inspect_skill` | Get detailed skill information |
| `semantic_search` | AI-powered similarity search |
| `get_categories` | List all categories |
| `validate_skill` | Validate skill exists |
| `get_related_skills` | Find related skills |

## Setup

```bash
# Install dependencies
npm install
```

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openmedica": {
      "command": "npx",
      "args": ["-y", "@openmedica/mcp"]
    }
  }
}
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
