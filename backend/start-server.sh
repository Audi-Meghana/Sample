#!/usr/bin/env bash
set -e

echo "Starting Prenatal AI backend + FastAPI service..."

# Locate Python runtime
if command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
elif command -v python >/dev/null 2>&1; then
  PYTHON=python
else
  echo "ERROR: Python is required to start the FastAPI service."
  exit 1
fi

# Install Python dependencies if needed
if [ -f AI_services/requirements.txt ]; then
  echo "Installing Python dependencies..."
  $PYTHON -m pip install --quiet --no-cache-dir -r AI_services/requirements.txt
fi

# Start FastAPI service in the background
cd AI_services
echo "Starting FastAPI on port 8000..."
$PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
FASTAPI_PID=$!

# Wait for FastAPI to become available
sleep 8

cd ..

# Start Node backend
echo "Starting Node backend on port ${PORT:-3000}..."
node server.js

# Wait for FastAPI to exit cleanly if backend shuts down
wait $FASTAPI_PID