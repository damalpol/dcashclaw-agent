#!/bin/bash
# CashClaw Multi-Agent Launcher
# Runs 3 most profitable agents simultaneously

echo "=========================================="
echo "  CashClaw Crypto Revenue Agents"
echo "  Payment: USDC on Base Network"
echo "=========================================="
echo ""

# Set working directory
cd "C:\Users\Damian\.openclaw\workspace\cashclaw-modified"

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting Agent 1: SEO Auditor"
echo "  Service: Technical SEO audits"
echo "  Pricing: $9 (Basic) | $29 (Standard) | $59 (Pro)"
echo "  Payment: USDC on Base"
echo ""

# Run SEO Auditor in background
node src/agents/seo-auditor-agent.js &
SEO_PID=$!

echo "Starting Agent 2: Lead Generator"
echo "  Service: B2B lead research & qualification"
echo "  Pricing: $9 (25 leads) | $15 (50 leads) | $25 (100 leads)"
echo "  Payment: USDC on Base"
echo ""

# Run Lead Generator in background
node src/agents/lead-generator-agent.js &
LEAD_PID=$!

echo "Starting Agent 3: Social Media Manager"
echo "  Service: Content calendars & social management"
echo "  Pricing: $9/week (1 platform) | $19/week (3 platforms) | $49/month (full)"
echo "  Payment: USDC on Base"
echo ""

# Run Social Media Manager in background
node src/agents/social-media-agent.js &
SOCIAL_PID=$!

echo "=========================================="
echo "  All 3 Agents Running!"
echo "=========================================="
echo ""
echo "Payment Address: 0x6a649D1D089963AAD808a5Ba9ff9EbF9E48a8268"
echo "Network: Base (Chain ID: 8453)"
echo "Token: USDC"
echo ""
echo "Press Ctrl+C to stop all agents"
echo ""

# Wait for all processes
wait $SEO_PID $LEAD_PID $SOCIAL_PID
