/**
 * Manual deployment script for RosterFlow
 * Run this script to build and deploy the application
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

console.log('🚀 Starting RosterFlow deployment...\n');

try {
  // Check if we're in the correct directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No package.json found. Make sure you\'re in the project root.');
  }

  console.log('✅ Package.json found');

  // Load environment variables
  dotenv.config({ path: '.env' });

  // Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');

  // Check if dist folder exists
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed: dist folder not found');
  }

  console.log('✅ Distribution files created\n');

  // If you have SSH access configured, you can add deployment steps here
  console.log('📋 Deployment steps:');
  console.log('1. Configure your server with the GitHub Actions workflow');
  console.log('2. Set up the following secrets in GitHub:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('   - HOST (your server IP/domain)');
  console.log('   - USERNAME (server username)');
  console.log('   - SSH_PRIVATE_KEY (your private SSH key)');
  console.log('   - SSH_PORT (optional, default 22; use 2222 for custom port)');
  console.log('\n3. Push to main branch to trigger deployment');
  console.log('\nAlternatively, you can manually copy the dist folder to your server:');
  console.log('   scp -P 2222 -r dist/ username@your-server:/var/www/rosterflow/');

  console.log('\n🎉 Deployment script completed!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}