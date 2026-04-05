#!/bin/sh
set -e

echo "Starting application services..."

# Start FastAPI service in background
echo "Starting FastAPI service on port 8000..."
cd /app/backend/AI_services
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
FASTAPI_PID=$!

# Give FastAPI a moment to start
sleep 3

# Start Node.js server
echo "Starting Node.js server on port ${PORT}..."
cd /app/backend
node server.js

# Wait for all background processes
wait $FASTAPI_PID
