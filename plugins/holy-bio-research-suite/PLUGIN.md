# Holy Bio Bioinformatics Research Suite

Unified framework of 50+ specialized bioinformatics MCP functions for biomedical research. Includes pharmacology (Guide to PHARMACOLOGY), aging/longevity research (opengenes), gene/variant/chemical data (biothings), genomics toolkit (gget), and genetic interactions (synergy-age). Single unified configuration enables all servers at once.

## Plugin Type

mcp-server-suite

## Category

research

## Specialty

bioinformatics, genomics, pharmacology

## Tags

mcp-plugin, bioinformatics, genomics, pharmacology, longevity, research-suite

## Safety Classification

Safe

## Evidence Level

High

## Tools

- pharmacology-mcp (Guide to PHARMACOLOGY)
- opengenes-mcp (aging/longevity research)
- biothings-mcp (gene, variant, chemical, taxonomic data)
- gget-mcp (bioinformatics toolkit for genomics queries)
- synergy-age-mcp (genetic interactions in longevity)

## Author

Longevity Genie (Bio x AI Hackathon 2025)

## Version

1.0.0

## License

MIT

## Original Repository

https://github.com/longevity-genie/holy-bio-mcp

## Installation

**Use the unified MCP configuration** (`mcp-config-stdio.json`) to enable all servers:

```json
{
  "mcpServers": {
    "biothings-mcp": { "command": "uvx", "args": ["--from", "biothings-mcp", "stdio"] },
    "gget-mcp": { "command": "uvx", "args": ["gget-mcp", "stdio"] },
    "synergy-age-mcp": { "command": "uvx", "args": ["synergy-age-mcp"], "env": { "MCP_TRANSPORT": "stdio" } },
    "opengenes-mcp": { "command": "uvx", "args": ["opengenes-mcp"], "env": { "MCP_TRANSPORT": "stdio" } },
    "pharmacology-mcp": { "command": "uvx", "args": ["--from", "pharmacology-mcp", "stdio"] }
  }
}
```

**Individual servers via uvx:**
```bash
uvx gget-mcp stdio
uvx opengenes-mcp
uvx synergy-age-mcp
uvx --from biothings-mcp stdio
uvx --from pharmacology-mcp stdio
```

---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
