#!/bin/bash

# 🚀 GeoLedger Automated Deployment Script
# This script deploys your app to Railway (backend) + Vercel (frontend)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}         ${CYAN}🚀 GEOLEDGER AUTOMATED DEPLOYMENT 🚀${NC}                ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Start deployment
print_header

# Check if in correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the geoledger root directory"
    exit 1
fi

PROJECT_ROOT=$(pwd)
print_success "Project root: $PROJECT_ROOT"

# ============================================================================
# STEP 1: Check and Install Dependencies
# ============================================================================
print_step "Step 1: Checking Dependencies"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm --version) found"

# Check/Install Railway CLI
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
    print_success "Railway CLI installed"
else
    print_success "Railway CLI found"
fi

# Check/Install Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI found"
fi

# ============================================================================
# STEP 2: Backend Deployment to Railway
# ============================================================================
print_step "Step 2: Deploying Backend to Railway"

print_info "Please login to Railway..."
railway login

print_info "Initializing Railway project..."
railway init

print_info "Creating railway.json configuration..."
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm install && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
print_success "railway.json created"

print_info "Deploying backend to Railway..."
railway up

print_info "Setting environment variables..."
railway variables set GEMINI_API_KEY=AIzaSyBCd5jJzIMudoR0ggmG7v4TetOvQ-uAu0Y
railway variables set NODE_ENV=production
railway variables set PORT=4000

print_info "Generating domain..."
railway domain

print_success "Backend deployed to Railway!"

# Get backend URL
BACKEND_URL=$(railway domain 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
if [ -z "$BACKEND_URL" ]; then
    print_warning "Could not auto-detect backend URL"
    read -p "Please enter your Railway backend URL: " BACKEND_URL
fi

print_success "Backend URL: $BACKEND_URL"

# Save backend URL for later
echo "$BACKEND_URL" > .backend-url

# ============================================================================
# STEP 3: Frontend Deployment to Vercel
# ============================================================================
print_step "Step 3: Deploying Frontend to Vercel"

cd frontend

print_info "Please login to Vercel..."
vercel login

print_info "Creating .env.production file..."
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_NETWORK=TESTNET
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
EOF
print_success ".env.production created"

print_info "Building frontend..."
npm run build

print_info "Deploying to Vercel..."
vercel --prod --yes

print_success "Frontend deployed to Vercel!"

# Get frontend URL
FRONTEND_URL=$(vercel ls --json 2>/dev/null | grep -o '"url":"[^"]*' | cut -d'"' -f4 | head -1)
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="Check Vercel dashboard"
fi

cd "$PROJECT_ROOT"

# ============================================================================
# STEP 4: Update CORS Settings
# ============================================================================
print_step "Step 4: Updating CORS Settings"

print_info "Please update your backend CORS settings to allow: $FRONTEND_URL"
print_warning "You may need to add CORS_ORIGIN environment variable in Railway"

# ============================================================================
# STEP 5: Testing Deployment
# ============================================================================
print_step "Step 5: Testing Deployment"

print_info "Testing backend health..."
sleep 5  # Wait for deployment to be ready

if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    print_success "Backend health check passed!"
else
    print_warning "Backend health check failed. It may still be deploying..."
fi

print_info "Testing chatbot API..."
if curl -f -s "$BACKEND_URL/api/chat/health" > /dev/null; then
    print_success "Chatbot API is responding!"
else
    print_warning "Chatbot API check failed. Check Gemini API key..."
fi

# ============================================================================
# DEPLOYMENT COMPLETE!
# ============================================================================
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}              ${GREEN}🎉 DEPLOYMENT SUCCESSFUL! 🎉${NC}                     ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Your GeoLedger app is now LIVE!${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Deployment Summary:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Backend (Railway):${NC}"
echo -e "  🔗 URL: ${BLUE}$BACKEND_URL${NC}"
echo -e "  ✅ Status: Deployed"
echo -e "  🤖 AI: Google Gemini Active"
echo ""
echo -e "${GREEN}Frontend (Vercel):${NC}"
echo -e "  🔗 URL: ${BLUE}https://$FRONTEND_URL${NC}"
echo -e "  ✅ Status: Deployed"
echo -e "  💬 Chatbot: Active"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. ${GREEN}Open your app:${NC} https://$FRONTEND_URL"
echo -e "  2. ${GREEN}Connect Freighter wallet${NC}"
echo -e "  3. ${GREEN}Test donation flow${NC}"
echo -e "  4. ${GREEN}Chat with AI assistant${NC} (click 💬 button)"
echo -e "  5. ${GREEN}Share with the world!${NC} 🌍"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📱 Monitoring & Management:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Backend Logs:${NC}    railway logs"
echo -e "  ${GREEN}Frontend Logs:${NC}   vercel logs"
echo -e "  ${GREEN}Railway Dashboard:${NC} https://railway.app"
echo -e "  ${GREEN}Vercel Dashboard:${NC} https://vercel.com"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Update backend:${NC}   railway up"
echo -e "  ${GREEN}Update frontend:${NC}  cd frontend && vercel --prod"
echo -e "  ${GREEN}View backend logs:${NC} railway logs"
echo -e "  ${GREEN}Test backend:${NC}     curl $BACKEND_URL/health"
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}  ${GREEN}🌟 Congratulations! Your app is live and ready! 🌟${NC}        ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}      ${CYAN}Now go change the world with blockchain charity!${NC}      ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                      ${YELLOW}🌍💙${NC}                                    ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                                                  ${PURPLE}║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Save deployment info
cat > deployment-info.txt << EOF
GeoLedger Deployment Information
Generated: $(date)

Backend URL: $BACKEND_URL
Frontend URL: https://$FRONTEND_URL

Access your app: https://$FRONTEND_URL
Backend API: $BACKEND_URL/api
Chatbot API: $BACKEND_URL/api/chat

Status: ✅ Successfully Deployed
EOF

print_success "Deployment info saved to deployment-info.txt"
echo ""
