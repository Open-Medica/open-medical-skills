# AWS HealthLake FHIR Platform

A Model Context Protocol (MCP) server for AWS HealthLake FHIR operations. Provides 11 tools for comprehensive FHIR resource management with automatic datastore discovery.

> **Original source:** [awslabs/mcp](https://github.com/awslabs/mcp) (subdirectory `src/healthlake-mcp-server`)

## Features

- **11 FHIR Tools**: Complete CRUD operations (6 read-only, 5 write), advanced search, patient-everything, job management
- **Read-Only Mode**: Security-focused mode that blocks all mutating operations
- **MCP Resources**: Automatic datastore discovery -- no manual datastore IDs needed
- **Advanced Search**: Chained parameters, includes, revIncludes, modifiers, pagination
- **AWS Integration**: SigV4 authentication with automatic credential handling
- **96% Test Coverage**: 235 tests ensuring reliability

## Installation

```bash
# Via uvx (recommended)
uvx awslabs.healthlake-mcp-server@latest

# Via uv install
uv tool install awslabs.healthlake-mcp-server

# Via Docker
docker build -t healthlake-mcp-server .
docker run -e AWS_ACCESS_KEY_ID=xxx -e AWS_SECRET_ACCESS_KEY=yyy healthlake-mcp-server
```

## Available Tools

| Category | Tool | Description |
|---|---|---|
| Datastore | `list_datastores` | List all HealthLake datastores |
| Datastore | `get_datastore_details` | Get detailed datastore info |
| CRUD | `create_fhir_resource` | Create new FHIR resources |
| CRUD | `read_fhir_resource` | Retrieve FHIR resources by ID |
| CRUD | `update_fhir_resource` | Update existing resources |
| CRUD | `delete_fhir_resource` | Delete resources |
| Search | `search_fhir_resources` | Advanced FHIR search |
| Search | `patient_everything` | Patient $everything operation |
| Jobs | `start_fhir_import_job` | Import from S3 |
| Jobs | `start_fhir_export_job` | Export to S3 |
| Jobs | `list_fhir_jobs` | Monitor import/export jobs |

## License

Apache License 2.0 -- Copyright Amazon.com, Inc. or its affiliates.

## Full Source

For the complete source code:
https://github.com/awslabs/mcp/tree/main/src/healthlake-mcp-server
