#!/bin/bash

# Start Node.js server
echo "Starting Node.js server..."
npm run dev &
NODE_PID=$!

# Start Flask backend
echo "Starting Flask backend..."
python flask_backend.py &
FLASK_PID=$!

# Function to handle termination
terminate() {
  echo "Shutting down servers..."
  kill $NODE_PID
  kill $FLASK_PID
  exit 0
}

# Set up trap for Ctrl+C
trap terminate INT

# Wait for both servers
echo "Both servers are running. Press Ctrl+C to stop."
wait