# Medikode AI Medical Coding Platform

Model Context Protocol (MCP) server for Medikode's AI-driven medical coding platform. This package enables AI assistants like Claude Desktop, Cursor, and ChatGPT to access Medikode's medical coding tools directly.

> **Original source:** [raelango/medikode-mcp-server](https://github.com/raelango/medikode-mcp-server)
> **npm:** [@medikode/mcp-server](https://www.npmjs.com/package/@medikode/mcp-server)

## Features

- **5 MCP Tools**: Validate codes, QA charts, parse EOBs, calculate RAF scores
- **AI Assistant Integration**: Works with Claude Desktop, Cursor, ChatGPT
- **Secure**: Uses Medikode API keys with existing security controls
- **Requires API key** from [medikode.ai](https://medikode.ai)

## Installation

```bash
npm install -g @medikode/mcp-server
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "medikode": {
      "command": "npx",
      "args": ["-y", "@medikode/mcp-server"],
      "env": {
        "MEDIKODE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `process_chart` | Process patient chart text and return ICD/CPT code suggestions |
| `validate_codes` | Validate CPT/ICD-10 codes against clinical documentation |
| `calculate_raf` | Calculate Risk Adjustment Factor (RAF) score and HCC capture |
| `qa_validate_codes` | Comprehensive QA validation of coded medical input |
| `parse_eob` | Parse Explanation of Benefits documents into structured data |

## Authentication

All tools require a valid Medikode API key. Obtain one at [medikode.ai](https://medikode.ai).

## License

ISC License -- Copyright (c) 2024, Medikode

## Full Source

For the complete source code:
https://github.com/raelango/medikode-mcp-server
