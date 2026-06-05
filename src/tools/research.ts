import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ResearchParams } from 'linkup-sdk';
import { z } from 'zod';
import { safeExecuteLinkupMethod } from '../client.js';

export function registerResearchTool(server: McpServer, apiKey: string) {
  server.registerTool(
    'linkup-research',
    {
      description:
        'Start a Linkup deep research task for complex, multi-source investigations that require analysis and synthesis across many sources. This is a long-running operation (typically 5-20 minutes): it does NOT return the final result. It immediately returns a task object with an "id" and a "status" (pending/processing). You MUST then call "linkup-get-research" with that id, polling roughly every 15-30 seconds, until the status becomes "completed" (read "output") or "failed" (read "error"). For quick, direct answers prefer "linkup-search" instead.',
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
            'A list of domains to restrict research results to, e.g. ["bbc.com", "reuters.com"]. Only results from these domains will be used.',
          ),
        mode: z
          .enum(['answer', 'auto', 'investigate', 'research'])
          .optional()
          .describe(
            'Controls how the research task operates. Use "research" for the most thorough multi-source investigation; "auto" lets Linkup decide.',
          ),
        outputType: z
          .enum(['sourcedAnswer', 'structured'])
          .default('sourcedAnswer')
          .describe(
            'The shape of the eventual result. "sourcedAnswer" returns an answer with sources. "structured" returns data matching the provided structuredOutputSchema.',
          ),
        query: z
          .string()
          .describe(
            'Natural language research question. Detailed, full questions work best, e.g., "Research the current state of the semiconductor market, covering key dynamics, major players, recent analyst sentiment, and the bull and bear cases."',
          ),
        reasoningDepth: z
          .enum(['S', 'M', 'L', 'XL'])
          .optional()
          .describe(
            'How much reasoning effort the task should spend. Larger values ("L", "XL") increase depth and runtime.',
          ),
        structuredOutputSchema: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            'A JSON Schema object describing the desired structured output. Required when outputType is "structured".',
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
    async ({
      query,
      outputType,
      structuredOutputSchema,
      includeDomains,
      excludeDomains,
      fromDate,
      toDate,
      mode,
      reasoningDepth,
    }) => {
      if (outputType === 'structured' && !structuredOutputSchema) {
        return {
          content: [
            {
              text: 'structuredOutputSchema is required when outputType is "structured".',
              type: 'text' as const,
            },
          ],
          isError: true as const,
        };
      }

      return safeExecuteLinkupMethod(apiKey, async client => {
        const base = {
          excludeDomains,
          fromDate: fromDate ? new Date(fromDate) : undefined,
          includeDomains,
          mode,
          query,
          reasoningDepth,
          toDate: toDate ? new Date(toDate) : undefined,
        };

        const params: ResearchParams =
          outputType === 'structured'
            ? { ...base, outputType, structuredOutputSchema: structuredOutputSchema ?? {} }
            : { ...base, outputType };

        const task = await client.research(params);

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
        'Retrieve the current state of a Linkup research task previously started with "linkup-research". Returns the task object with its "status" (pending, processing, completed, failed). While the status is "pending" or "processing", keep polling (roughly every 15-30 seconds) until it reaches a terminal state. When "completed", the result is in the "output" field; when "failed", the reason is in the "error" field.',
      inputSchema: {
        id: z.string().describe('The research task id returned by the "linkup-research" tool.'),
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
