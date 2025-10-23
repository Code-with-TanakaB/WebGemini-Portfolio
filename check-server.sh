#!/bin/bash
# Check Affiliate Server Status

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 WebGemini Affiliate Server Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if server process is running
if ps aux | grep -q "[n]ode server.js"; then
    echo "✅ Server Status: RUNNING"
    echo "🔢 Process ID: $(pgrep -f 'node server.js')"
else
    echo "❌ Server Status: NOT RUNNING"
    echo ""
    echo "To start the server, run:"
    echo "  ./start-affiliate-server.sh &"
    exit 1
fi

# Check if keepalive script is running
if ps aux | grep -q "[s]tart-affiliate-server.sh"; then
    echo "🔄 Auto-restart: ENABLED"
else
    echo "⚠️  Auto-restart: DISABLED"
fi

echo ""

# Test API health
echo "Testing API..."
HEALTH_CHECK=$(curl -s http://localhost:3001/api/health)
if echo "$HEALTH_CHECK" | grep -q "success.*true"; then
    echo "✅ API Status: HEALTHY"
    echo "📍 Port: 3001"
else
    echo "❌ API Status: NOT RESPONDING"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Access URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Login:           http://localhost:3001/login.html"
echo "👤 Admin Dashboard: http://localhost:3001/admin-dashboard.html"
echo "💼 Affiliate Panel: http://localhost:3001/affiliate-dashboard.html"
echo "📝 Client Signup:   http://localhost:3001/client-signup.html"
echo ""
echo "Default Credentials: admin / admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
