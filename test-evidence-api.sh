#!/bin/bash

# Test Evidence System Backend API
# ================================

echo "🧪 Testing Evidence System Backend"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:4000"

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "GET $BASE_URL/api/evidence/health"
RESPONSE=$(curl -s "$BASE_URL/api/evidence/health")
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 2: Upload Test File
echo -e "${BLUE}Test 2: File Upload to IPFS${NC}"

# Create a test file
TEST_FILE="/tmp/test_evidence.txt"
echo "This is test evidence for blockchain verification" > "$TEST_FILE"
echo "Timestamp: $(date)" >> "$TEST_FILE"

echo "POST $BASE_URL/api/evidence/upload"
echo "File: $TEST_FILE"

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/evidence/upload" \
  -F "file=@$TEST_FILE")

if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"
  
  # Extract CID
  CID=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('cid', ''))" 2>/dev/null)
  
  if [ ! -z "$CID" ]; then
    echo ""
    echo -e "${BLUE}📦 Test 3: Retrieve File Info${NC}"
    echo "GET $BASE_URL/api/evidence/retrieve/$CID"
    
    RETRIEVE_RESPONSE=$(curl -s "$BASE_URL/api/evidence/retrieve/$CID")
    if echo "$RETRIEVE_RESPONSE" | grep -q '"success":true'; then
      echo -e "${GREEN}✅ PASSED${NC}"
      echo "$RETRIEVE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RETRIEVE_RESPONSE"
    else
      echo -e "${RED}❌ FAILED${NC}"
      echo "$RETRIEVE_RESPONSE"
    fi
  fi
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "$UPLOAD_RESPONSE"
  
  # Check if it's a configuration issue
  if echo "$UPLOAD_RESPONSE" | grep -q "Pinata"; then
    echo ""
    echo "⚠️  NOTE: Pinata API keys may not be configured"
    echo "Set PINATA_API_KEY and PINATA_SECRET_KEY in backend/.env"
  fi
fi

# Cleanup
rm -f "$TEST_FILE"

echo ""
echo "===================================="
echo "🎉 Test Complete"
echo ""
echo "Next Steps:"
echo "1. Configure Pinata API keys in backend/.env"
echo "2. Deploy Soroban evidence contract"
echo "3. Test complete workflow with frontend"
