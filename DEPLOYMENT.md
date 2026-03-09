# RosterFlow Deployment Guide

This document explains how to deploy RosterFlow to production using GitHub Actions.

## Prerequisites

Before setting up automated deployment, ensure you have:

1. A GitHub repository with your RosterFlow code
2. A server with SSH access (AWS EC2, DigitalOcean, etc.)
3. A web server configured (nginx, Apache, etc.)

## GitHub Secrets Setup

You need to configure the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets (include `SSH_PORT` if you're not using port 22):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your production Supabase URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your production Supabase anon key | `eyJhb...` |
| `HOST` | Your server hostname/IP | `123.456.789.012` or `myserver.com` |
| `USERNAME` | SSH username | `ubuntu`, `ec2-user`, `root`, etc. |
| `SSH_PRIVATE_KEY` | Your private SSH key for the server | Ed25519 or RSA key without passphrase |
| `SSH_PORT` | (optional) Non‑standard SSH port (default 22) | `2222` |

## Server Setup

On your production server, you'll need to:

1. Install and configure a web server (e.g., nginx)
2. Create a directory for your application:
   ```bash
   sudo mkdir -p /var/www/rosterflow
   sudo chown $USER:$USER /var/www/rosterflow
   ```

3. Configure nginx to serve the application:
   ```nginx
   server {
       listen 80;
       server_name serveflow.site;

       # Comprehensive MIME types for modern web apps
       types {
           application/javascript js mjs jsx;
           text/css css;
           application/json json;
           image/svg+xml svg;
           image/png png;
           image/jpeg jpg jpeg;
           image/gif gif;
           image/webp webp;
           font/woff2 woff2;
           font/woff woff;
           application/octet-stream wasm;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/css application/javascript application/json image/svg+xml font/woff font/woff2;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

       # Handle client-side routing (SPA)
       location / {
           root /var/www/rosterflow;
           try_files $uri $uri/ /index.html;

           # Cache static assets
           location ~* \.(js|mjs|jsx|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$ {
               expires 1y;
               add_header Cache-Control "public, immutable";
           }
       }
   }
   ```

## Deployment Process

1. Commit and push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Checkout your code
   - Install dependencies
   - Build the application with production environment variables
   - Create a backup of the current deployment: `cp -r . ./backup-$(date +%Y%m%d-%H%M%S)`
   - Deploy the built files to your server via SSH
   - Restart your web server

## Manual Deployment

To manually trigger a build and check the deployment process:

```bash
node scripts/deploy.js
```

## Troubleshooting

- If deployment fails, check the GitHub Actions logs for error details
- Verify your SSH key has proper permissions to access the server
- Make sure the SSH service is running on the host and the correct port (22 by default; use `SSH_PORT` if different) is open in the firewall
- If you're using a custom port, set the `SSH_PORT` secret in GitHub to that value (e.g. `2222`)
- Ensure your server has sufficient disk space for the application
- Confirm your domain is pointing to your server's IP address

## Rollback

In case of issues, the deployment creates a backup of the previous version before deploying. Look for backup folders named with timestamps in `/var/www/rosterflow/`.

## Environment Variables

The application uses the following environment variables in production:

- `VITE_SUPABASE_URL` - Production Supabase instance URL
- `VITE_SUPABASE_ANON_KEY` - Production Supabase anonymous key

These are passed during the build process and embedded in the client-side code as required by Supabase.