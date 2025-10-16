import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Config } from './config';
import { registerSearchTool } from './tools/search';

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
