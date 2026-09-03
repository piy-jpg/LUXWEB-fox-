#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Setting up Lumière Beauty Full-Stack"
echo "=========================================="

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js is not installed. Please install Node.js 18+ to run backend services."
else
    echo "✅ Node.js $(node -v) detected."
fi

# 2. Check Python
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 is not installed."
else
    echo "✅ Python $(python3 --version) detected."
fi

# 3. Setup Backend Environment if needed
if [ -d "backend" ]; then
    echo "📦 Initializing backend environment..."
    cd backend
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created backend/.env from .env.example"
    fi
    cd ..
fi

echo "=========================================="
echo "  Setup complete! Quick run instructions:"
echo "  - Frontend: python3 -m http.server 8000 --directory frontend"
echo "  - Backend:  cd backend && npm install && npm run dev"
echo "=========================================="
