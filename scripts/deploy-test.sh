#!/bin/bash
# Vercel deployment test script

echo "Testing Vercel deployment environment..."

# Check Node.js version
echo "Node.js version:"
node --version

# Check npm version
echo "NPM version:"
npm --version

# Test npm install with all platform binaries
echo "Testing npm install with platform binaries..."
npm install --force

# Check if Rollup Linux binary is installed
echo "Checking for Rollup Linux binary..."
ls -la node_modules/@rollup/ | grep linux || echo "Linux binary not found"

# Test build process
echo "Testing build process..."
npm run build

echo "Deployment test completed!"
