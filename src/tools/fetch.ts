import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client.js';

export function registerFetchTool(server: McpServer, apiKey: string) {
  server.registerTool(
    'linkup-fetch',
    {
      description:
        'Fetch a URL and return the content of the page. If you are unable to fetch the page content, might be worth trying to render the JavaScript content.',
      inputSchema: {
        extractImages: z
          .boolean()
          .default(false)
          .describe(
            'Define if the images should be extracted from the page and returned in the response in a dedicated "images" field. This is useful when you need to have a list of all images found on the page for further processing or analysis.',
          ),
        includeRawHtml: z
          .boolean()
          .default(false)
          .describe(
            'Define if the raw HTML of the page should be included in the response in a dedicated "rawHtml" field. This is useful when you need to perform custom HTML parsing, preserve specific formatting, or access elements that might be filtered out during the standard content extraction process.',
          ),
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
    async ({ url, renderJs, includeRawHtml, extractImages }) => {
      return safeExecuteLinkupMethod(apiKey, async client => {
        const results = await client.fetch({
          extractImages,
          includeRawHtml,
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
