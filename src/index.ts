import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type Request, type Response } from 'express';
import { getServer } from './server.js';

type ApiKeyResolution =
  | { apiKey: string; errorMessage?: never }
  | { apiKey?: never; errorMessage: string };

const PORT = Number(process.env.PORT ?? 2121);
const app = express();

app.use(express.json());

function resolveApiKey(req: Request): ApiKeyResolution {
  const authorization = req.headers.authorization;

  if (authorization) {
    const [scheme, token, ...rest] = authorization.trim().split(/\s+/);

    if (scheme !== 'Bearer' || !token || rest.length > 0) {
      return {
        errorMessage: 'Authorization header must use the Bearer scheme.',
      };
    }

    return { apiKey: token };
  }
  const apiKey = req.query.apiKey;

  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return { errorMessage: 'API key is required.' };
  }

  return { apiKey };
}

app.post('/mcp', async (req: Request, res: Response) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      transport.close();
    });
    const apiKeyResolution = resolveApiKey(req);

    if (!apiKeyResolution.apiKey) {
      return res.status(401).json({
        error: {
          code: -32000,
          message: apiKeyResolution.errorMessage,
        },
        id: null,
        jsonrpc: '2.0',
      });
    }

    const server = getServer(apiKeyResolution.apiKey);

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
        jsonrpc: '2.0',
      });
    }
  }
});

app.get('/mcp', async (_req: Request, res: Response) => {
  res.writeHead(405).end(
    JSON.stringify({
      error: {
        code: -32000,
        message: 'Method not allowed.',
      },
      id: null,
      jsonrpc: '2.0',
    }),
  );
});

app.delete('/mcp', async (_req: Request, res: Response) => {
  res.writeHead(405).end(
    JSON.stringify({
      error: {
        code: -32000,
        message: 'Method not allowed.',
      },
      id: null,
      jsonrpc: '2.0',
    }),
  );
});

app.listen(PORT, error => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Server shutdown complete');
  process.exit(0);
});
