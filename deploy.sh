#!/bin/bash

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete! Check your Vercel dashboard for the deployment URL." 