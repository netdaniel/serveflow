# cPanel Git Deployment Guide for ServeFlow

This guide shows you how to deploy ServeFlow to your cPanel hosting using Git automatic deployment.

## 📋 Prerequisites

- cPanel hosting with Git Version Control enabled
- Node.js installed locally (v18 or higher)
- Your cPanel account credentials

---

## 🚀 Step-by-Step Setup

### Step 1: Build the Application Locally

First, build your React app:

```bash
# Make the build script executable
chmod +x build-cpanel.sh

# Run the build
./build-cpanel.sh
```

Or manually:
```bash
npm ci
npm run build
cp CNAME dist/
```

### Step 2: Add Built Files to Git

```bash
# Add the dist folder (built application)
git add dist/
git add .cpanel.yml
git commit -m "Build for cPanel deployment"
```

### Step 3: Set Up Repository in cPanel

1. **Log into cPanel**
2. Go to: **Files → Git Version Control**
3. Click **"Create"** or **"New Repository"**
4. Fill in:
   ```
   Repository Name: serveflow
   Repository Directory: /home/serveflow/serveflow (or your preferred path)
   Branch: main
   ```
5. Click **"Create"**

### Step 4: Configure Deployment Settings

1. In cPanel Git Version Control, click on your repository
2. Go to **"Settings"** or **"Deployment"** tab
3. Configure:
   ```
   Deployment Source: Choose your remote repository (GitHub)
   Deployment Branch: main
   Deployment Method: Automatic (Push) or Manual (Pull)
   ```

### Step 5: Add cPanel as a Remote

Back in your local terminal:

```bash
# Add cPanel as a remote (replace with your cPanel details)
git remote add cpanel ssh://your-cpanel-username@your-domain.com/home/serveflow/serveflow

# Or if already added, update it
git remote set-url cpanel ssh://your-cpanel-username@your-domain.com/home/serveflow/serveflow
```

### Step 6: Deploy to cPanel

#### Option A: Push Deployment (Automatic)

```bash
# Push to cPanel - this will automatically deploy
git push cpanel main
```

The `.cpanel.yml` file will automatically:
- Copy all files from `dist/` to `/home/serveflow/public_html/`
- Your site will be live at `https://serveflow.site`

#### Option B: Pull Deployment (Manual)

1. Push to remote repository first:
   ```bash
   git push origin main
   ```

2. In cPanel Git Version Control:
   - Click **"Update from Remote"**
   - Click **"Deploy HEAD Commit"**

---

## 📁 File Structure

After deployment, your cPanel should have:

```
/home/serveflow/
├── public_html/          ← Your website files (deployed here)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxxxx.css
│   │   └── index-xxxxx.js
│   ├── CNAME
│   └── ... other built files
│
├── serveflow/            ← Git repository
│   ├── .cpanel.yml
│   ├── dist/
│   ├── src/
│   └── ... source files
```

---

## ⚙️ Configuration Details

### .cpanel.yml Explained

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/serveflow/public_html/
    - /bin/cp -R dist/* $DEPLOYPATH
```

- **Line 1**: YAML file start
- **Line 4**: Sets deployment path to your public HTML directory
- **Line 5**: Copies all built files from `dist/` to public directory

### vite.config.js

Your Vite config is already set up correctly:
- `base: './'` - Uses relative paths for cPanel compatibility
- `outDir: 'dist'` - Builds to dist folder
- `assetsDir: 'assets'` - Puts assets in subfolder

---

## 🔧 Environment Variables

For Supabase to work, you need to create a `.env.production` file:

```bash
# Create .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

This will be built into the app during `npm run build`.

**Important**: Don't commit `.env.production` to Git! Add it to `.gitignore`.

---

## 🐛 Troubleshooting

### Issue: Deployment doesn't run

**Solution**: Check that `.cpanel.yml` is in the repository root:
```bash
ls -la .cpanel.yml
```

### Issue: White screen after deployment

**Solutions**:
1. Check browser console (F12) for errors
2. Verify Supabase keys are in `.env.production` before building
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Assets not loading

**Solution**: Ensure vite.config.js has `base: './'` (not `/`)

### Issue: Git working tree not clean

**Solution**: Commit or stash changes before deploying:
```bash
git status
git add .
git commit -m "Before deployment"
```

---

## 📝 Quick Deployment Checklist

Before each deployment:

- [ ] Run `npm run build`
- [ ] Copy CNAME to dist: `cp CNAME dist/`
- [ ] Test build locally: `npm run preview`
- [ ] Add dist to git: `git add dist/`
- [ ] Commit changes: `git commit -m "Build for deployment"`
- [ ] Push to cPanel: `git push cpanel main`
- [ ] Wait 1-2 minutes
- [ ] Test live site: https://serveflow.site

---

## 🎯 Automated Deployment Script

Create a deploy script for easier deployments:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying to cPanel..."

# Build
npm ci
npm run build
cp CNAME dist/

# Commit and push
git add dist/ .cpanel.yml
git commit -m "Deploy $(date)"
git push cpanel main

echo "✅ Deployment complete!"
echo "Visit: https://serveflow.site"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🌐 Domain Configuration

Your domain `serveflow.site` should point to your cPanel:

1. **In cPanel**: Go to **Domains**
2. Add `serveflow.site` if not already added
3. Set document root to `/public_html`

**DNS Settings** (at your domain registrar):
```
Type: A
Host: @
Value: [your-cPanel-server-IP]

Type: CNAME
Host: www
Value: serveflow.site
```

---

## ✅ Verification

After deployment, verify:

1. Visit: https://serveflow.site
2. Open browser DevTools (F12)
3. Check Console - should see Supabase connected
4. Test login/register functionality
5. Check Network tab - all assets loading

---

## 🆘 Need Help?

Common commands:
```bash
# Check git status
git status

# View remotes
git remote -v

# Check deployment file
cat .cpanel.yml

# Rebuild if issues
npm run build
cp CNAME dist/
```

---

**Ready to deploy?** Run:
```bash
./build-cpanel.sh
```

Then follow the prompts! 🎉
