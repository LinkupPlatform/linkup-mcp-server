import { LinkupClient } from 'linkup-sdk';

export async function safeExecuteLinkupMethod<T>(
  apiKey: string,
  fn: (client: LinkupClient) => Promise<T>,
): Promise<T | ErrorResponse> {
  try {
    const client = getLinkupClient(apiKey);

    return await fn(client);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createErrorResponse(errorMessage);
  }
}

function getLinkupClient(apiKey: string) {
  return new LinkupClient({
    apiKey,
    baseUrl: process.env.LINKUP_BASE_URL,
  });
}

type ErrorResponse = {
  content: Array<{ text: string; type: 'text' }>;
  isError: true;
};

function createErrorResponse(message: string): ErrorResponse {
  return {
    content: [
      {
        text: `An error occurred while executing Linkup client: ${message}`,
        type: 'text',
      },
    ],
    isError: true,
  };
}
