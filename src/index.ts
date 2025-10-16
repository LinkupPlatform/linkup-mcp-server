import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { registerSearchTool } from './tools/search';

export const configSchema = z.object({
  apiKey: z.string().describe('API key for the Linkup API'),
});

export type Config = z.infer<typeof configSchema>;

export default function createServer({ config }: { config: Config }) {
  const server = new McpServer(
    {
      name: 'linkup-mcp-server',
      title: 'Linkup',
      version: '1.0.0',
    },
    {
      instructions: 'Use this server when you need to search the web for information',
    },
  );

  registerSearchTool(server, config);

  return server.server;
}
