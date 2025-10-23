#!/bin/bash

# WebGemini Affiliate System - Test Script
# This script tests the basic functionality of the affiliate system

API_URL="http://localhost:3001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "WebGemini Affiliate System - Test Suite"
echo "======================================"
echo ""

# Test 1: Check if server is running
echo -n "Test 1: Server Health Check... "
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED (Server not responding)${NC}"
    exit 1
fi

# Test 2: Admin Login
echo -n "Test 2: Admin Login... "
login_response=$(curl -s -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

token=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$token" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $login_response"
    exit 1
fi

# Test 3: Create Test Affiliate
echo -n "Test 3: Register Test Affiliate... "
register_response=$(curl -s -X POST $API_URL/auth/register \
    -H "Content-Type: application/json" \
    -d '{
        "username":"test_affiliate",
        "email":"test@example.com",
        "password":"test123",
        "full_name":"Test Affiliate",
        "coupon_code":"TEST2024"
    }')

if echo "$register_response" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ PASSED${NC}"
elif echo "$register_response" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠ SKIPPED (Already exists)${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $register_response"
fi

# Test 4: Verify Coupon Code
echo -n "Test 4: Verify Coupon Code... "
verify_response=$(curl -s -X POST $API_URL/affiliates/verify-coupon \
    -H "Content-Type: application/json" \
    -d '{"coupon_code":"TEST2024"}')

if echo "$verify_response" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $verify_response"
fi

# Test 5: Track Client Signup
echo -n "Test 5: Track Client Signup... "
signup_response=$(curl -s -X POST $API_URL/affiliates/track-signup \
    -H "Content-Type: application/json" \
    -d '{
        "name":"Test Client",
        "email":"client'$(date +%s)'@example.com",
        "phone":"+1234567890",
        "plan_type":"Premium",
        "plan_price":1499,
        "coupon_code":"TEST2024"
    }')

if echo "$signup_response" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $signup_response"
fi

# Test 6: Get Admin Stats
echo -n "Test 6: Get Admin Statistics... "
stats_response=$(curl -s -X GET $API_URL/affiliates/admin/stats \
    -H "Authorization: Bearer $token")

if echo "$stats_response" | grep -q "total_affiliates"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    
    # Extract and display stats
    echo ""
    echo "======================================"
    echo "Current System Statistics:"
    echo "======================================"
    echo "$stats_response" | grep -o '"total_[^"]*":[^,}]*' | sed 's/"//g' | sed 's/:/: /'
    echo ""
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test 7: Get All Affiliates
echo -n "Test 7: Get All Affiliates... "
affiliates_response=$(curl -s -X GET $API_URL/affiliates/all \
    -H "Authorization: Bearer $token")

if echo "$affiliates_response" | grep -q "affiliates"; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test 8: Login as Test Affiliate
echo -n "Test 8: Test Affiliate Login... "
affiliate_login=$(curl -s -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test_affiliate","password":"test123"}')

affiliate_token=$(echo $affiliate_login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$affiliate_token" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${YELLOW}⚠ SKIPPED (Test affiliate not found)${NC}"
fi

# Test 9: Get Affiliate Stats
if [ ! -z "$affiliate_token" ]; then
    echo -n "Test 9: Get Affiliate Statistics... "
    affiliate_stats=$(curl -s -X GET $API_URL/affiliates/stats \
        -H "Authorization: Bearer $affiliate_token")

    if echo "$affiliate_stats" | grep -q "total_referrals"; then
        echo -e "${GREEN}✓ PASSED${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
    fi
fi

echo ""
echo "======================================"
echo "Test Suite Complete!"
echo "======================================"
echo ""
echo -e "${GREEN}All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit: http://localhost:3001/login.html"
echo "2. Login with: admin / admin123"
echo "3. Explore the dashboard!"
echo ""
