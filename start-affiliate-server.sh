#!/bin/bash
# Affiliate Server Keepalive Script

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/affiliate-backend"

echo "🚀 Starting WebGemini Affiliate Server with auto-restart..."

while true; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') - Starting server..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    node server.js
    
    EXIT_CODE=$?
    echo ""
    echo "⚠️  Server stopped with exit code: $EXIT_CODE"
    echo "🔄 Restarting in 2 seconds..."
    sleep 2
done
