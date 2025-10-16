import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LinkupClient } from 'linkup-sdk';
import { z } from 'zod';
import type { Config } from '../index';

export function registerSearchTool(server: McpServer, config: Config) {
  server.registerTool(
    'linkup-search',
    {
      description:
        'Search the web in real time using Linkup. Use this tool whenever the user needs trusted facts, news, source-backed information or any other information that is not available in the knowledge base. Returns comprehensive content from the most relevant sources.',
      inputSchema: {
        depth: z
          .enum(['standard', 'deep'])
          .default('standard')
          .describe(
            'The search depth to perform. Use "standard" for queries with likely direct answers. Use "deep" for complex queries requiring comprehensive analysis or multi-hop questions',
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
      try {
        const linkupClient = new LinkupClient({
          apiKey: config.apiKey,
          baseUrl: process.env.LINKUP_BASE_URL,
        });
        const results = await linkupClient.search({
          depth,
          outputType: 'searchResults',
          query,
        });

        return {
          content: [
            {
              text: JSON.stringify(results, null, 2),
              type: 'text',
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
          content: [
            { text: `An error occured while performing the search: ${errorMessage}`, type: 'text' },
          ],
          isError: true,
        };
      }
    },
  );
}
