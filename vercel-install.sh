#!/bin/bash
set -e

echo "Starting installation..."
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo "Installing frontend dependencies..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  cd ..
else
  echo "ERROR: frontend directory not found!"
  exit 1
fi

echo "Installing backend dependencies..."
if [ -d "backend" ]; then
  cd backend
  npm install
  cd ..
else
  echo "ERROR: backend directory not found!"
  exit 1
fi

echo "Installation completed successfully!"

