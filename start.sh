#!/bin/bash

# Loan Amendment Diff Engine - Quick Start Script

echo "🚀 Starting Loan Amendment Diff Engine..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  cd frontend && npm install && cd ..
  cd backend && npm install && cd ..
  echo "✅ Dependencies installed"
  echo ""
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo "⚠️  Creating backend/.env file..."
  echo "PORT=5000" > backend/.env
  echo "OPENAI_API_KEY=" >> backend/.env
  echo "✅ Created backend/.env (OpenAI key is optional)"
  echo ""
fi

export PORT=5001

echo "Starting servers..."
echo "📊 Backend API will run on: http://localhost:5001"
echo "🎨 Frontend app will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers using npm run dev
npm run dev
