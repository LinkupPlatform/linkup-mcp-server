import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFetchTool } from './tools/fetch.js';
import { registerSearchTool } from './tools/search.js';

export const getServer = (apiKey: string): McpServer => {
  const server = new McpServer(
    {
      name: 'linkup-mcp-server',
      title: 'Linkup',
      version: '1.0.0',
    },
    {
      capabilities: {},
      instructions: 'Use this server when you need to search the web for information',
    },
  );

  registerSearchTool(server, apiKey);
  registerFetchTool(server, apiKey);
  return server;
};
