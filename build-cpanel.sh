#!/bin/bash

# Build script for cPanel deployment
# This builds the app and prepares it for deployment

echo "🔨 Building ServeFlow for production..."

# Install dependencies
npm ci

# Build the application
npm run build

# Copy CNAME file for custom domain
cp CNAME dist/

echo "✅ Build complete! Ready to deploy to cPanel."
echo ""
echo "Next steps:"
echo "1. Add the dist folder: git add dist/"
echo "2. Commit: git commit -m 'Build for cPanel deployment'"
echo "3. Push to cPanel repository"
