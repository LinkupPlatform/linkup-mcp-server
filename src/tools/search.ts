import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client.js';

export function registerSearchTool(server: McpServer, apiKey: string) {
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
        excludeDomains: z
          .array(z.string())
          .optional()
          .describe(
            'A list of domains to exclude from search results, e.g. ["reddit.com", "quora.com"]. Results from these domains will be filtered out.',
          ),
        fromDate: z.iso
          .date()
          .optional()
          .describe(
            'Filter results to only include content published on or after this date. Format: YYYY-MM-DD.',
          ),
        includeDomains: z
          .array(z.string())
          .optional()
          .describe(
            'A list of domains to restrict search results to, e.g. ["bbc.com", "reuters.com"]. Only results from these domains will be returned. Max 100 domains.',
          ),
        includeImages: z
          .boolean()
          .default(false)
          .describe(
            'Allows you to receive image results alongside text results in your search responses. When set to true, Linkup will return relevant images related to your query, each with a URL and metadata.',
          ),
        maxResults: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Maximum number of results to return.'),
        query: z
          .string()
          .describe(
            'Natural language search query. Full questions work best, e.g., "How does the new EU AI Act affect startups?"',
          ),
        toDate: z.iso
          .date()
          .optional()
          .describe(
            'Filter results to only include content published on or before this date. Format: YYYY-MM-DD.',
          ),
      },
      title: 'Linkup web search',
    },
    async ({
      query,
      depth,
      includeImages,
      includeDomains,
      excludeDomains,
      fromDate,
      toDate,
      maxResults,
    }) => {
      return safeExecuteLinkupMethod(apiKey, async client => {
        const results = await client.search({
          depth,
          excludeDomains,
          fromDate: fromDate ? new Date(fromDate) : undefined,
          includeDomains,
          includeImages,
          maxResults,
          outputType: 'searchResults',
          query,
          toDate: toDate ? new Date(toDate) : undefined,
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
