#!/bin/bash
set -e

if [ ! -d "backend" ]; then
  echo "Error: backend directory not found"
  ls -la
  exit 1
fi

cd backend
npm install

