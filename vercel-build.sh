#!/bin/bash
set -e

echo "Starting build..."
echo "Current directory: $(pwd)"

echo "Building frontend..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  npm run build
  cd ..
else
  echo "ERROR: frontend directory not found!"
  exit 1
fi

echo "Building backend..."
if [ -d "backend" ]; then
  cd backend
  npm install
  npm run build
  cd ..
else
  echo "ERROR: backend directory not found!"
  exit 1
fi

echo "Build completed successfully!"

