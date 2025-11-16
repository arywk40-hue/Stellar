#!/bin/bash

echo "🎭 TESTING DEMO WORKFLOW"
echo "========================"
echo ""

echo "✅ Test 1: Demo Status"
curl -s http://localhost:4000/api/demo/status | python3 -m json.tool
echo ""
echo ""

echo "✅ Test 2: All Demo Accounts"
curl -s http://localhost:4000/api/demo/accounts
echo ""
echo ""

echo "✅ Test 3: Alex Chen's Balance (Donor #1)"
curl -s http://localhost:4000/api/demo/balance/GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
echo ""
echo ""

echo "✅ Test 4: Save The Ocean Balance (NGO)"
curl -s http://localhost:4000/api/demo/balance/GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
echo ""
echo ""

echo "✅ Test 5: Make Demo Donation (500 XLM)"
curl -s -X POST http://localhost:4000/api/demo/donate \
  -H "Content-Type: application/json" \
  -d '{
    "donor_wallet": "GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "ngo_wallet": "GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "amount": "500",
    "message": "Keep up the great work!",
    "location": {"lat": 19.0760, "lng": 72.8777}
  }'
echo ""
echo ""

echo "✅ Test 6: Check Balances After Donation"
echo "Donor (should be 9500):"
curl -s http://localhost:4000/api/demo/balance/GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
echo ""
echo "NGO (should be 3000):"
curl -s http://localhost:4000/api/demo/balance/GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
echo ""
echo ""

echo "🎉 Demo Workflow Tests Complete!"
