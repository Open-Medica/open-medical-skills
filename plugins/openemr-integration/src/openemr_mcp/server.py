"""
OpenEMR MCP Server -- Model Context Protocol server for OpenEMR.

Registers 17 tools: patient search, appointments, medications, drug interactions,
provider search, FDA adverse events, FDA drug labels, symptom lookup, drug safety
flag CRUD, lab trends, vital trends, questionnaire trends, health trajectory,
and visit prep.

Full source at: https://github.com/shruti-jn/openemr-mcp

Run via:
    openemr-mcp                    # stdio transport (default)
    OPENEMR_DATA_SOURCE=mock openemr-mcp
"""

# This is a partial copy of the server entry point.
# For the complete source code with all 17 tools, tool modules, repositories,
# and services, please visit: https://github.com/shruti-jn/openemr-mcp
#
# Install directly via pip:
#   pip install openemr-mcp
