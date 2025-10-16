import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().describe('API key for the Linkup API'),
});

export type Config = z.infer<typeof configSchema>;
