import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getServer } from './server.js';

function resolveApiKey(argv: string[], env: NodeJS.ProcessEnv): string | null {
  const arg = argv.find(argument => {
    return argument.startsWith('apiKey=') || argument.startsWith('--apiKey=');
  });

  if (arg) {
    const [, value = ''] = arg.split('=', 2);

    if (value.length > 0) {
      return value;
    }
  }
  const apiKey = env.LINKUP_API_KEY;

  if (typeof apiKey === 'string' && apiKey.length > 0) {
    return apiKey;
  }

  return null;
}

async function main() {
  const apiKey = resolveApiKey(process.argv.slice(2), process.env);

  if (!apiKey) {
    console.error(
      'API key is required. Pass apiKey=YOUR_API_KEY, --apiKey=YOUR_API_KEY, or set LINKUP_API_KEY.',
    );
    process.exit(1);
  }

  const server = getServer(apiKey);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch(error => {
  console.error('Failed to start stdio server:', error);
  process.exit(1);
});
