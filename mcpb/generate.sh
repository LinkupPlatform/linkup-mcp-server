#!/bin/bash

set -e

echo "📦 Building Linkup MCP Server MCPB Bundle"
echo ""

echo "Installing MCPB CLI..."
npm install -g @anthropic-ai/mcpb

echo "Building MCP server..."
npm run build:stdio

echo "Copying MCPB files..."
cp mcpb/.mcpbignore .
cp mcpb/manifest.json .

echo "Validating MCPB manifest..."
mcpb validate manifest.json

echo "Packing MCPB bundle..."
mcpb pack . mcpb/linkup-mcp-server.mcpb

echo "Cleaning up temporary files..."
rm manifest.json
rm .mcpbignore

echo ""
echo "✅ MCPB bundle created: mcpb/linkup-mcp-server.mcpb"
