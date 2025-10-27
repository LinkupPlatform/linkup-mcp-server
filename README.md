# Linkup MCP Server

[![smithery badge](https://smithery.ai/badge/@LinkupPlatform/linkup-mcp-server)](https://smithery.ai/server/@LinkupPlatform/linkup-mcp-server)

A Model Context Protocol (MCP) server that provides web search and page fetching capabilities through [Linkup's](https://www.linkup.so/) advanced API. This server enables AI assistants like Claude to perform intelligent web searches with natural language queries and fetch content from any webpage, accessing real-time information from trusted sources across the web.

## Features

- 🔍 **Real-time Web Search**: Search the web for current information, news, and data
- 🌐 **Page Fetching**: Fetch and extract content from any webpage
- 🎯 **Natural Language Queries**: Use full questions for best results
- 📊 **Flexible Search Depth**:
  - `standard` - For queries with direct answers
  - `deep` - For complex research requiring analysis across multiple sources
- 🖥️ **JavaScript Rendering**: Optional JS rendering for dynamic content
- ⚡ **Fast**: Powered by Linkup's optimized infrastructure

## Installation

- Cursor, VSCode, Claude Code, or another MCP compatible client
- Linkup API key

### Getting Your API Key

1. Create a Linkup account for free at [app.linkup.so](https://app.linkup.so/)
2. Copy the API key from your dashboard

### Remote MCP Server (recommended)

You can access the MCP server directly through [Smithery](https://smithery.ai/server/@LinkupPlatform/linkup-mcp-server). From there, you'll be able to install the server into your favorite MCP compatible client. The remote MCP server is using the Streamable HTTP transport.

You can also use the Smithery CLI to install the server into your favorite MCP compatible client.
```bash
npx @smithery/cli login # If you haven't already
npx -y @smithery/cli@latest install linkup-mcp-server --client <CLIENT_NAME> --config '{"apiKey":<LINKUP_API_KEY>}'
```

**Finally, if your client supports OAuth protocol, you can reference directly the remote MCP server URL. See examples below:**

#### Cursor
[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=linkup&config=eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vbWNwLmxpbmt1cC5zby9tY3A%2FYXBpS2V5PVlPVVJfQVBJX0tFWSJ9)


In your `~/.cursor/mcp.json` file, add the following:
```json
{
  "mcpServers": {
    // ... other MCP servers
    "linkup": {
      "type": "http",
      "url": "https://mcp.linkup.so/mcp?apiKey=LINKUP_API_KEY"
    }
  }
}
```

#### VSCode
Add this to your VS Code MCP config file. See [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for more info.

```json
{
  "servers": {
    // ... other MCP servers
    "linkup": {
      "url": "https://mcp.linkup.so/mcp?apiKey=LINKUP_API_KEY",
      "type": "http"
    }
  }
}
```

### MCP Bundle (recommanded for Claude Desktop)

Download the pre-built MCP bundle, a self-contained package that works across compatible MCP clients (like Claude Desktop for example). MCP Bundles are developed by Anthropics see [here](https://github.com/anthropics/mcpb?tab=readme-ov-file#mcp-bundles-mcpb) for more info.

**Quick Download:**
```bash
curl -L -o linkup-mcp-server.mcpb https://github.com/LinkupPlatform/linkup-mcp-server/releases/latest/download/linkup-mcp-server.mcpb
```

**Installation:**
1. Download `linkup-mcp-server.mcpb` from releases (or use the curl command above)
2. Click on the file to install
3. Configure your API key when prompted

### Local MCP Server

You can also run the MCP server locally through the stdio transport.

#### Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=linkup&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImxpbmt1cC1tY3Atc2VydmVyIiwiYXBpS2V5PVlPVVJfTElOS1VQX0FQSV9LRVkiXX0%3D)

```json
{
  "mcpServers": {
    // ... other MCP servers
    "linkup": {
      "command": "npx",
      "args": [
        "-y",
        "linkup-mcp-server",
        "apiKey=LINKUP_API_KEY"
      ]
    }
  }
}
```

#### VSCode

```json
{
  "servers": {
    // ... other MCP servers
    "linkup": {
      "command": "npx",
      "type": "stdio",
      "args": [
        "-y",
        "linkup-mcp-server",
        "apiKey=LINKUP_API_KEY"
      ]
    }
  }
}
```

## Usage

Once configured, you can ask your AI agent to search the web or fetch webpage content:

**Search Examples:**
- "Search the web for the latest news about AI developments"
- "What's the current weather in Tokyo?"
- "Find information about the new EU AI Act and how it affects startups"
- "Search for the latest stock price of NVIDIA"

**Fetch Examples:**
- "Fetch the content from https://example.com/article"
- "Get the content of this blog post: https://blog.example.com/post and make a summary of it"
- "Fetch https://example.com with JavaScript rendering enabled"

### Search Depths

- **Standard Search**: Best for queries with direct answers (weather, stock prices, simple facts)
- **Deep Search**: Best for complex research requiring analysis across multiple sources (comprehensive guides, comparative analysis, in-depth research)

## Tools Available

### `linkup-search`

Search the web in real time using Linkup to retrieve current information, facts, and news from trusted sources.

**Parameters:**
- `query` (required): Natural language search query. Full questions work best.
- `depth` (optional): Search depth - "standard" (default) or "deep"

**Use cases:**
- Real-time data (weather, stocks, sports scores, events)
- Breaking news and current events
- Recent research and publications
- Product information and up-to-date prices
- Schedules and availability
- Any information not available in the AI's knowledge base

### `linkup-fetch`

Fetch and extract content from any webpage URL.

**Parameters:**
- `url` (required): The URL to fetch content from.
- `renderJs` (optional): Whether to render JavaScript content (default: false). Enable this for dynamic pages that load content via JavaScript. Note: This makes the request slower.

**Use cases:**
- Retrieve page content for analysis or summarization
- Extract article content from news sites
- Get documentation from technical websites
- Fetch blog posts and written content

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm

### Setup

```bash
# Install dependencies
npm install
```

### Running with Smithery

```bash
npm run dev
```

### Running with stdio transport
```bash
npm run build:stdio
npm run start:stdio apiKey=YOUR_API_KEY
```

### Testing with MCP Inspector

```bash
npm run build:stdio
npm run inspector apiKey=YOUR_API_KEY
```

This will open the MCP Inspector in your browser where you can test the search tool interactively.

## License

MIT

## Links

- [Linkup Website](https://www.linkup.so/)
- [Linkup Documentation](https://docs.linkup.so/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Support

If you have issues, contact us via email at [support@linkup.so](mailto:support@linkup.so) or join our [Discord server](https://discord.com/invite/9q9mCYJa86).
