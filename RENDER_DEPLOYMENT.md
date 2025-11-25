# 🚀 Deploy to Render.com (FREE)

Your Docker app works perfectly! Deploy it to Render for free.

## ⚡ Quick Deployment (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free, no credit card needed)

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `parking-app` repository

### Step 4: Configure Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `parking-app` (or any name) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Docker` |
| **Instance Type** | **Free** |

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Your app will be live at `https://parking-app-xxxx.onrender.com`

## ✅ That's It!

Your app is now live with:
- ✅ Automatic HTTPS
- ✅ Your Docker setup working exactly as localhost
- ✅ Persistent storage
- ✅ Free forever

## 📝 Important Notes

### Free Tier Limitations:
- **Spins down after 15 min** of inactivity
- First request after sleep: ~30 seconds
- After that: normal speed
- **Solution**: Keep a tab open or use a uptime monitor

### Data Persistence:
Your `data.json` will persist! Render provides persistent disk storage even on free tier.

## 🔧 Troubleshooting

### Build Fails
Check your `Dockerfile` exposes port 4000:
```dockerfile
EXPOSE 4000
```

### Can't Access
Make sure your backend server listens on `0.0.0.0`:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Need to See Logs
Go to Render dashboard → Your service → **Logs** tab

## 💡 Next Steps

1. ✅ Test your deployed app
2. ✅ Change admin password
3. ✅ Share URL with residents
4. ✅ (Optional) Set up custom domain

## 🆓 Keep It Free

To stay on free tier:
- ✅ Only use web services (not background workers)
- ✅ Stay under 750 hours/month (plenty for one app)
- ✅ No credit card needed

---

**Your app will work EXACTLY like localhost:4000, but online!** 🎉
