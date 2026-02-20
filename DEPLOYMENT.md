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
3. Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your production Supabase URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your production Supabase anon key | `eyJhb...` |
| `HOST` | Your server hostname/IP | `123.456.789.012` or `myserver.com` |
| `USERNAME` | SSH username | `ubuntu`, `ec2-user`, `root`, etc. |
| `SSH_PRIVATE_KEY` | Your private SSH key for the server | Long RSA key |

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
       server_name your-domain.com;

       location / {
           root /var/www/rosterflow;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Deployment Process

1. Commit and push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Checkout your code
   - Install dependencies
   - Build the application with production environment variables
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
- Ensure your server has sufficient disk space for the application
- Confirm your domain is pointing to your server's IP address

## Rollback

In case of issues, the deployment creates a backup of the previous version before deploying. Look for backup folders named with timestamps in `/var/www/rosterflow/`.

## Environment Variables

The application uses the following environment variables in production:

- `VITE_SUPABASE_URL` - Production Supabase instance URL
- `VITE_SUPABASE_ANON_KEY` - Production Supabase anonymous key

These are passed during the build process and embedded in the client-side code as required by Supabase.