import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client.js';

export function registerResearchTool(server: McpServer, apiKey: string) {
  server.registerTool(
    'linkup-research',
    {
      description:
        'Start a Linkup deep research task for complex, multi-source investigations that require analysis and synthesis across many sources. This is a long-running operation: it does NOT return the final result. It immediately returns a task object with an "id" and a "status". Poll "linkup-get-research" with that id until the status becomes "completed" or "failed". When "completed", the result is in "output"; when "failed", the reason is in "error". For quick, direct answers prefer "linkup-search" instead.',
      inputSchema: {
        excludeDomains: z
          .array(z.string())
          .optional()
          .describe(
            'A list of domains to exclude from research results, e.g. ["reddit.com", "quora.com"].',
          ),
        fromDate: z.iso
          .date()
          .optional()
          .describe(
            'Filter sources to only include content published on or after this date. Format: YYYY-MM-DD.',
          ),
        includeDomains: z
          .array(z.string())
          .optional()
          .describe(
            'A list of domains to restrict research results to, e.g. ["bbc.com", "reuters.com"]. Only results from these domains will be used. Max 100 domains.',
          ),
        mode: z
          .enum(['answer', 'investigate', 'research'])
          .optional()
          .describe(
            'Controls the type of investigation. Use "answer" for a precise, evidence-backed answer; "investigate" for a focused report on one subject; "research" for a structured report across many topics. Omit this to let Linkup classify the question.',
          ),
        query: z
          .string()
          .min(1)
          .describe(
            'Natural language research question. Detailed, full questions work best, e.g., "Research the current state of the semiconductor market, covering key dynamics, major players, recent analyst sentiment, and the bull and bear cases."',
          ),
        reasoningDepth: z
          .enum(['S', 'M', 'L', 'XL'])
          .optional()
          .describe(
            'How much reasoning effort the task should spend. Defaults to "L" when omitted; larger values increase source coverage, cross-checking, output length, and runtime.',
          ),
        toDate: z.iso
          .date()
          .optional()
          .describe(
            'Filter sources to only include content published on or before this date. Format: YYYY-MM-DD.',
          ),
      },
      title: 'Linkup deep research (start task)',
    },
    async ({ query, includeDomains, excludeDomains, fromDate, toDate, mode, reasoningDepth }) => {
      return safeExecuteLinkupMethod(apiKey, async client => {
        const task = await client.research({
          excludeDomains,
          fromDate: fromDate ? new Date(fromDate) : undefined,
          includeDomains,
          mode,
          outputType: 'sourcedAnswer',
          query,
          reasoningDepth,
          toDate: toDate ? new Date(toDate) : undefined,
        });

        return {
          content: [
            {
              text: JSON.stringify(task, null, 2),
              type: 'text' as const,
            },
          ],
        };
      });
    },
  );
}

export function registerGetResearchTool(server: McpServer, apiKey: string) {
  server.registerTool(
    'linkup-get-research',
    {
      description:
        'Retrieve the current state of a Linkup research task previously started with "linkup-research". Returns the task object with its "status". While the status is "pending" or "processing", keep polling until it reaches a terminal state, waiting 5-10 seconds between calls (polling faster than once per second is rate-limited). When "completed", the result is in the "output" field; when "failed", the reason is in the "error" field.',
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe('The research task id returned by the "linkup-research" tool.'),
      },
      title: 'Linkup research result (poll)',
    },
    async ({ id }) => {
      return safeExecuteLinkupMethod(apiKey, async client => {
        const task = await client.getResearch(id);

        return {
          content: [
            {
              text: JSON.stringify(task, null, 2),
              type: 'text' as const,
            },
          ],
        };
      });
    },
  );
}
