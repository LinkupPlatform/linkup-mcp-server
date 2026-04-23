#!/bin/bash

set -euo pipefail

OUTPUT_FILE="$(pwd)/mcpb/linkup-mcp-server.mcpb"
BUNDLE_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$BUNDLE_DIR"
}

trap cleanup EXIT

echo "📦 Building Linkup MCP Server MCPB Bundle"
echo ""

echo "Installing MCPB CLI..."
npm install -g @anthropic-ai/mcpb

echo "Building MCP server..."
npm run build:stdio

echo "Preparing bundle directory..."
cp -R dist "$BUNDLE_DIR"/
cp -R bin "$BUNDLE_DIR"/
cp -R public "$BUNDLE_DIR"/
cp package.json "$BUNDLE_DIR"/
cp package-lock.json "$BUNDLE_DIR"/
cp mcpb/manifest.json "$BUNDLE_DIR"/manifest.json

pushd "$BUNDLE_DIR" > /dev/null

echo "Installing production dependencies into bundle..."
npm ci --omit=dev --ignore-scripts

echo "Validating MCPB manifest..."
mcpb validate manifest.json

echo "Packing MCPB bundle..."
mcpb pack . "$OUTPUT_FILE"

popd > /dev/null

echo ""
echo "✅ MCPB bundle created: mcpb/linkup-mcp-server.mcpb"
