import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client';
import type { Config } from '../index';

export function registerSearchTool(server: McpServer, config: Config) {
  server.registerTool(
    'linkup-search',
    {
      description:
        'Search the web in real time using Linkup to retrieve current information, facts, and news from trusted sources. Use this tool for: real-time data (weather, stocks, sports scores, events), breaking news, current events, recent research, product information, up-to-date prices, schedules, and any information not available in your knowledge base. Returns comprehensive content from the most relevant sources.',
      inputSchema: {
        depth: z
          .enum(['standard', 'deep'])
          .default('standard')
          .describe(
            'The search depth to perform. Use "standard" for queries with direct answers, "deep" for complex research requiring analysis across multiple sources.',
          ),
        query: z
          .string()
          .describe(
            'Natural language search query. Full questions work best, e.g., "How does the new EU AI Act affect startups?"',
          ),
      },
      title: 'Linkup web search',
    },
    async ({ query, depth }) => {
      return safeExecuteLinkupMethod(config.apiKey, async client => {
        const results = await client.search({
          depth,
          outputType: 'searchResults',
          query,
        });

        return {
          content: [
            {
              text: JSON.stringify(results, null, 2),
              type: 'text' as const,
            },
          ],
        };
      });
    },
  );
}
