import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client';
import type { Config } from '../index';

export function registerFetchTool(server: McpServer, config: Config) {
  server.registerTool(
    'linkup-fetch',
    {
      description:
        'Fetch a URL and return the content of the page. If you are unable to fetch the page content, might be worth trying to render the JavaScript content.',
      inputSchema: {
        renderJs: z
          .boolean()
          .default(false)
          .describe(
            'Whether to render the JavaScript content. Only use this if explicitly asked to by the user or if the page content is not available. This will make the request slower.',
          ),
        url: z.string().url().describe('The URL to fetch.'),
      },
      title: 'Linkup page fetch',
    },
    async ({ url, renderJs }) => {
      return safeExecuteLinkupMethod(config.apiKey, async client => {
        const results = await client.fetch({
          renderJs,
          url,
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
