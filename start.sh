#!/bin/bash
# =============================================
#  Event Management System - Run Script
#  Works on Mac and Linux
# =============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   Event Management System - Starting...${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Check Node.js ----
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo ""
    echo "Install it using one of these methods:"
    echo "  1. Homebrew:  brew install node"
    echo "  2. Download:  https://nodejs.org/ (v18 or higher)"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. You have $(node -v)${NC}"
    echo "   Update: brew upgrade node"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# ---- Check .env files ----
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env is missing!${NC}"
    echo "   Copy .env.example and fill in your values:"
    echo "   cp backend/.env.example backend/.env"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env missing — creating default...${NC}"
    echo 'VITE_API_URL=http://localhost:3000/api' > frontend/.env
    echo 'VITE_APP_NAME=Event Management System' >> frontend/.env
    echo 'VITE_ENABLE_DARK_MODE=true' >> frontend/.env
fi

echo -e "${GREEN}✅ Environment files found${NC}"

# ---- Install Backend Dependencies ----
echo ""
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# ---- Install Frontend Dependencies ----
echo ""
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# ---- Start Both Servers ----
echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   🚀 Starting servers...${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Start backend in background
cd "$SCRIPT_DIR/backend"
npm run dev &
BACKEND_PID=$!

# Start frontend in background
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for servers to boot
sleep 3

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}   ✅ Everything is running!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "   ${BLUE}Frontend${NC}:  http://localhost:5173"
echo -e "   ${BLUE}Backend${NC}:   http://localhost:3000"
echo -e "   ${BLUE}API Docs${NC}:  http://localhost:3000/api-docs"
echo ""
echo -e "   Press ${RED}Ctrl+C${NC} to stop both servers"
echo ""

# Handle Ctrl+C — kill both servers
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Done. Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
