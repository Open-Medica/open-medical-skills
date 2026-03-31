import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

type Env = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
};

const server = new McpServer({
  name: 'OpenMedica MCP',
  version: '1.0.0',
});

async function init() {
  server.addResource(
    {
      name: 'skills-index',
      uri: 'openmedica://skills',
      description: 'List of all available medical AI skills',
      mimeType: 'application/json',
    },
    async (uri) => {
      return {
        contents: [{
          uri: uri.href,
          text: 'Use tools to query skills data',
          mimeType: 'application/json',
        }],
      };
    }
  );

  server.setRequestHandler({ method: 'tools/list' }, async () => ({
    tools: [
      {
        name: 'list_skills',
        description: 'List all available medical AI skills. Returns skills organized by category with basic metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by medical category (e.g., emergency, research, education)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of skills to return',
              default: 20,
            },
          },
        },
      },
      {
        name: 'search_skills',
        description: 'Search medical AI skills by keyword. Searches name, description, and tags.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            category: {
              type: 'string',
              description: 'Filter by medical category',
            },
            limit: {
              type: 'number',
              description: 'Maximum results to return',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'inspect_skill',
        description: 'Get detailed information about a specific medical AI skill.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Skill name or display name',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'semantic_search',
        description: 'Find medical AI skills using semantic similarity search powered by AI embeddings.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language query describing the desired skill',
            },
            limit: {
              type: 'number',
              description: 'Number of similar skills to return',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_categories',
        description: 'Get all medical categories and the count of skills in each.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'validate_skill',
        description: 'Validate that a skill exists and has required fields populated.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Skill name',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_related_skills',
        description: 'Find skills related to a given skill by category and tags.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Skill name to find related skills for',
            },
            limit: {
              type: 'number',
              description: 'Maximum related skills to return',
              default: 5,
            },
          },
          required: ['name'],
        },
      },
    ],
  }));

  server.setRequestHandler(
    { method: 'tools/call' },
    async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
      const { name, arguments: args = {} } = request.params;

      try {
        const env = process.env as Env;
        
        switch (name) {
          case 'list_skills': {
            const category = args.category as string | undefined;
            const limit = (args.limit as number) || 20;
            
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({ 
                  message: 'Use list_skills with database access',
                  category,
                  limit 
                }, null, 2),
              }],
            };
          }

          case 'search_skills': {
            const query = args.query as string;
            if (!query) {
              throw new Error('Query parameter is required');
            }
            
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  message: 'Use search_skills with database access',
                  query,
                  category: args.category,
                  limit: args.limit
                }, null, 2),
              }],
            };
          }

          case 'inspect_skill': {
            const skillName = args.name as string;
            if (!skillName) {
              throw new Error('Skill name is required');
            }
            
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  message: 'Use inspect_skill with database access',
                  name: skillName
                }, null, 2),
              }],
            };
          }

          case 'semantic_search': {
            const query = args.query as string;
            if (!query) {
              throw new Error('Query parameter is required');
            }
            
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  message: 'Use semantic_search with Vectorize access',
                  query,
                  limit: args.limit || 5
                }, null, 2),
              }],
            };
          }

          case 'get_categories': {
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  message: 'Use get_categories with database access'
                }, null, 2),
              }],
            };
          }

          case 'validate_skill': {
            const skillName = args.name as string;
            if (!skillName) {
              throw new Error('Skill name is required');
            }
            
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  message: 'Use validate_skill with database access',
                  name: skillName
                }, null, 2),
              }],
            };
          }

          case 'get_related_skills': {
            const skillName = args.name as string;
            if (!skillName) {
              throw new Error('Skill name is required');
            }
            
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  message: 'Use get_related_skills with database access',
                  name: skillName,
                  limit: args.limit || 5
                }, null, 2),
              }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: (error as Error).message }, null, 2),
          }],
          isError: true,
        };
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

init().catch(console.error);
