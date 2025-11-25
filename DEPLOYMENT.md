# 🚀 Vercel Deployment Guide - Parking Management System

This guide will walk you through deploying your parking management app to Vercel with Vercel KV database.

## 📋 Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Your code pushed to the repository

## 🏗️ Architecture Overview

The app has been converted to work on Vercel's serverless platform:

- **Frontend**: React + Vite (served as static files)
- **Backend**: Serverless API functions in `/api` directory
- **Database**: Vercel KV (Redis-based key-value store)

## 📦 Step 1: Push Your Code to Git

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Add your remote repository
git remote add origin <your-repo-url>

# Push to main branch
git push -u origin main
```

## 🌐 Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your parking-app repository
4. Vercel will auto-detect the configuration from `vercel.json`

### Build Settings (Vercel should auto-configure these):

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🗄️ Step 3: Set Up Vercel KV Database

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **"Create Database"**
3. Select **"KV" (Key-Value Store)**
4. Choose a database name (e.g., `parking-db`)
5. Select a region (choose closest to your users)
6. Click **"Create"**

### Connect KV to Your Project

1. After creating the database, click on it
2. Go to the **".env.local"** tab
3. Copy the environment variables shown
4. Go back to your project → **Settings** → **Environment Variables**
5. Add these environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

## 🔧 Step 4: Configure Environment Variables

In your Vercel project settings → Environment Variables, add:

### Required Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `KV_REST_API_URL` | *from KV dashboard* | KV database URL |
| `KV_REST_API_TOKEN` | *from KV dashboard* | KV auth token |
| `KV_REST_API_READ_ONLY_TOKEN` | *from KV dashboard* | KV read-only token |

### Optional Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_API_URL` | `/api` | API base URL (default works for Vercel) |

**Important:** Make sure to set variables for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

## 🚀 Step 5: Deploy

1. Click **"Deploy"** button in Vercel
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a URL like `https://your-app.vercel.app`

## ✅ Step 6: Verify Deployment

1. Open your deployed URL
2. Try logging in with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Test creating a reservation
4. Check the admin panel

## 🔍 Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Make sure all dependencies are in `package.json`
- Run `npm install` locally first to verify

**Error**: "Build timeout"
- **Solution**: Increase build timeout in Vercel settings

### API Errors

**Error**: "KV_REST_API_URL is not defined"
- **Solution**: Double-check environment variables are set in Vercel
- Redeploy after adding variables

**Error**: "Failed to fetch"
- **Solution**: Check if API routes are accessible at `https://your-app.vercel.app/api/health`
- Verify `vercel.json` routing configuration

### Database Issues

**Error**: "Connection refused" or "Unauthorized"
- **Solution**: Regenerate KV tokens in Vercel dashboard
- Update environment variables with new tokens
- Redeploy

**Data not persisting**
- **Solution**: Verify KV database is properly connected
- Check Vercel logs for KV-related errors

## 📊 Monitoring & Logs

### View Logs:
1. Go to your project in Vercel
2. Click **"Deployments"**
3. Click on a deployment
4. Click **"Functions"** tab to see serverless function logs

### View KV Database:
1. Go to **Storage** tab
2. Click on your KV database
3. Use the **"Data"** tab to browse stored data

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your repository:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

## 🌍 Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## 🔐 Security Considerations

### Important Security Notes:

1. **Change Default Credentials**: After first deployment, log in and change the admin password!
2. **Environment Variables**: Never commit `.env` files to git
3. **KV Tokens**: Keep your KV tokens secret
4. **HTTPS**: Vercel provides automatic HTTPS for all deployments

### Change Admin Password:

1. Log in as admin
2. Go to Admin Panel
3. Click on "משתמשים" (Users) tab
4. Edit admin user
5. Set a strong new password

## 📈 Scaling

Vercel automatically scales your serverless functions. For heavy usage:

1. **Upgrade Vercel Plan**: Consider Pro or Enterprise for higher limits
2. **Optimize KV Usage**: Use batch operations where possible
3. **Monitor Usage**: Check Vercel dashboard for function invocations and KV operations

## 🆘 Getting Help

### Check Logs First:
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# View logs from terminal
vercel logs
```

### Common Resources:
- Vercel Documentation: https://vercel.com/docs
- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv
- Support: https://vercel.com/support

## 🎉 Success!

Your parking management system is now live on Vercel!

**Next Steps:**
1. ✅ Share the URL with your residents
2. ✅ Change default admin password
3. ✅ Test all features thoroughly
4. ✅ Set up custom domain (optional)
5. ✅ Configure backup exports regularly

---

## 📝 Quick Reference

### Project Structure:
```
parking-app/
├── frontend/          # React frontend
│   ├── src/
│   ├── dist/         # Build output
│   └── package.json
├── api/              # Serverless functions
│   ├── lib/
│   │   └── storage.js    # KV storage helper
│   ├── login.js
│   ├── users.js
│   ├── reservations.js
│   └── ...
├── vercel.json       # Vercel configuration
└── DEPLOYMENT.md     # This file
```

### Default Users:
- **Admin**: `admin` / `admin123`
- **User**: `dani` / `1234`

### Key URLs:
- **Health Check**: `/api/health`
- **Login**: `/login`
- **Calendar**: `/calendar`
- **Admin Panel**: `/admin`

---

**Built with ❤️ for residential parking management**