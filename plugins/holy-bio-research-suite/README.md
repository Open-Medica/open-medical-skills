# Holy Bio Bioinformatics Research Suite

A unified framework of 50+ specialized bioinformatics MCP functions for biomedical research. Born during Bio x AI Hackathon 2025, Holy Bio MCP brings together all your favorite agentic biotools under the same framework.

> **Original source:** [longevity-genie/holy-bio-mcp](https://github.com/longevity-genie/holy-bio-mcp)

## Mission

Holy Bio MCP aggregates several powerful, standalone MCP servers into a single, cohesive ecosystem for advanced bioinformatics and longevity research, including a native ElizaOS plugin for building autonomous research agents.

## Included MCP Servers

### Core Servers (via unified config)

| Server | Description | Install |
|--------|-------------|---------|
| **[gget-mcp](https://github.com/longevity-genie/gget-mcp)** | Bioinformatics toolkit for genomics queries (wraps gget library) | `uvx gget-mcp stdio` |
| **[opengenes-mcp](https://github.com/longevity-genie/opengenes-mcp)** | Aging/longevity research from OpenGenes project | `uvx opengenes-mcp` |
| **[synergy-age-mcp](https://github.com/longevity-genie/synergy-age-mcp)** | Synergistic genetic interactions in longevity from SynergyAge | `uvx synergy-age-mcp` |
| **[biothings-mcp](https://github.com/longevity-genie/biothings-mcp)** | BioThings.io APIs for gene, variant, chemical, taxonomic data | `uvx --from biothings-mcp stdio` |
| **[pharmacology-mcp](https://github.com/antonkulaga/pharmacology-mcp)** | Guide to PHARMACOLOGY database for drugs, targets, ligands | `uvx --from pharmacology-mcp stdio` |

### Extended Servers (post-hackathon additions)

- **[futurehouse-mcp](https://github.com/winternewt/futurehouse_mcp)** - Future-house prediction models
- **[addgene-mcp](https://github.com/longevity-genie/addgene-mcp)** - Plasmid search (alpha)
- **[boltz-mcp](https://github.com/longevity-genie/boltz-mcp)** - Boltz structure predictions (alpha)
- **[benchling-mcp](https://github.com/longevity-genie/benchling-mcp)** - Benchling API interaction (alpha)

## Quick Start

Use the unified MCP configuration file `mcp-config-stdio.json` to enable all core servers at once in your MCP-compatible client (Claude Desktop, Cursor, VS Code Copilot, etc.).

## What is MCP?

MCP (Model Context Protocol) is a protocol designed to bridge LLMs and specialized, domain-specific tools. It provides a standardized way for AI assistants to access complex functionalities through structured, type-safe interfaces.

## License

MIT License -- Copyright (c) 2025 Longevity Genie

## Full Source

For the complete source and documentation:
https://github.com/longevity-genie/holy-bio-mcp
