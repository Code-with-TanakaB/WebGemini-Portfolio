#!/bin/bash

# WebGemini Affiliate System - Installation Verification Script
# Run this after installation to verify everything is set up correctly

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  WebGemini Affiliate System - Installation Checker       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Not found"
    echo "  Please install Node.js from https://nodejs.org"
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} Found: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} Not found"
fi

# Check MySQL
echo -n "Checking MySQL... "
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | awk '{print $5}' | sed 's/,//')
    echo -e "${GREEN}✓${NC} Found: $MYSQL_VERSION"
else
    echo -e "${RED}✗${NC} Not found"
    echo "  Please install MySQL from https://dev.mysql.com/downloads/"
fi

# Check if we're in the right directory
echo ""
echo -n "Checking project structure... "
if [ -f "package.json" ] && [ -f "server.js" ]; then
    echo -e "${GREEN}✓${NC} Correct directory"
else
    echo -e "${RED}✗${NC} Wrong directory"
    echo "  Please run this script from the affiliate-system directory"
    exit 1
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo "  Run: npm install"
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check critical env variables
    echo -n "  Checking DB_PASSWORD... "
    if grep -q "^DB_PASSWORD=.\+$" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC} Not set"
    fi
    
    echo -n "  Checking JWT_SECRET... "
    if grep -q "^JWT_SECRET=.\+$" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC} Not set"
    fi
else
    echo -e "${YELLOW}⚠${NC} Not found"
    echo "  Copy .env.example to .env and configure it"
fi

# Check database
echo ""
echo "Database Check:"
echo -n "  Enter MySQL username (default: root): "
read MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

echo -n "  Enter MySQL password: "
read -s MYSQL_PASS
echo ""

if mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" -e "USE webgemini_affiliates;" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Database 'webgemini_affiliates' exists"
    
    # Check tables
    echo -n "  Checking tables... "
    TABLE_COUNT=$(mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" -D webgemini_affiliates -e "SHOW TABLES;" 2>/dev/null | wc -l)
    TABLE_COUNT=$((TABLE_COUNT - 1)) # Subtract header row
    
    if [ $TABLE_COUNT -ge 7 ]; then
        echo -e "${GREEN}✓${NC} Found $TABLE_COUNT tables"
    else
        echo -e "${YELLOW}⚠${NC} Only $TABLE_COUNT tables found (expected 7)"
        echo "  Import schema: mysql -u $MYSQL_USER -p webgemini_affiliates < database/schema.sql"
    fi
else
    echo -e "  ${RED}✗${NC} Database 'webgemini_affiliates' not found"
    echo "  Create database: mysql -u $MYSQL_USER -p < database/schema.sql"
fi

# Check if server is running
echo ""
echo -n "Checking if server is running... "
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Server is running"
else
    echo -e "${YELLOW}⚠${NC} Server is not running"
    echo "  Start server: npm run dev"
fi

# Summary
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Verification Complete                                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Fix any issues marked with ${RED}✗${NC} or ${YELLOW}⚠${NC}"
echo "  2. Start the server: npm run dev"
echo "  3. Open admin dashboard: http://localhost:3000/admin-dashboard.html"
echo "  4. Login with: admin / admin123 (change password!)"
echo ""
echo "Documentation:"
echo "  Quick Start: cat QUICKSTART.md"
echo "  Full Guide:  cat README.md"
echo ""
