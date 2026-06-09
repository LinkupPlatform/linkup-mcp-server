import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client.js';

export function registerResearchTool(server: McpServer, apiKey: string) {
  server.registerTool(
    'linkup-research',
    {
      description:
        'Submits an autonomous Linkup research task: an agent that investigates the web to answer questions a single search query cannot resolve, returning a synthesized, cited answer. Use for verified answers to precise questions, focused investigations of a defined subject, or broad multi-angle reports. This is async and long-running (can take several minutes): it does not return the final result. It returns immediately with a task "id" and a "status" of "pending". Poll "linkup-get-research" with that id until the status is "completed" (result in "output") or "failed" (reason in "error"). For quick, direct answers prefer "linkup-search" instead.',
      inputSchema: {
        excludeDomains: z
          .array(z.string())
          .optional()
          .describe(
            'A list of domains to exclude from research results, e.g. ["reddit.com", "quora.com"]. Results from these domains will be filtered out.',
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
            'Controls the type of investigation; setting it explicitly is recommended. Use "answer" for a precise, evidence-backed answer, "investigate" for a focused report on one subject, or "research" for a structured report across many topics. Omit to let Linkup classify the question.',
          ),
        query: z
          .string()
          .min(1)
          .describe(
            'Natural language research question. Detailed, full questions work best, e.g., "Compare the 2024 cloud revenue growth of Microsoft, Amazon, and Google."',
          ),
        reasoningDepth: z
          .enum(['S', 'M', 'L', 'XL'])
          .optional()
          .describe(
            'How much reasoning effort the task spends, trading latency for coverage. Use "S" for light coverage, "M" for balanced, "L" (default) for thorough, or "XL" for exhaustive.',
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
        'Retrieve the current state of a Linkup research task previously started with "linkup-research". Returns the task object with its "status". While the status is "pending" or "processing", keep polling every few seconds until it reaches a terminal state; polling faster than once per second is rate-limited. When "completed", the result is in the "output" field; when "failed", the reason is in the "error" field.',
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
