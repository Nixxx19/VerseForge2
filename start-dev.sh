#!/bin/bash

echo "🚀 Starting Aether with Auto-Backend..."

# Function to check if backend is running
check_backend() {
    curl -s http://localhost:3001/health > /dev/null 2>&1
    return $?
}

# Kill any existing backend processes
echo "🔄 Checking for existing backend processes..."
pkill -f "node.*server.js" 2>/dev/null || true

# Start backend if not running
if ! check_backend; then
    echo "📡 Starting backend server on port 3001..."
    cd backend
    npm start &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    for i in {1..15}; do
        if check_backend; then
            echo "✅ Backend is running!"
            break
        fi
        echo "Attempt $i/15..."
        sleep 2
    done
    
    if ! check_backend; then
        echo "❌ Failed to start backend after 15 attempts"
        exit 1
    fi
else
    echo "✅ Backend is already running!"
fi

# Go back to root directory
cd ..

# Start frontend
echo "🎨 Starting frontend server..."
npm run dev

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    pkill -f "node.*server.js" 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup INT

# Wait for background process
if [ ! -z "$BACKEND_PID" ]; then
    wait $BACKEND_PID
fi
