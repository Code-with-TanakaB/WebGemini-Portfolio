# 🚀 Render Deployment Guide - WebGemini Affiliate System

This guide will help you deploy your affiliate backend to Render for 24/7 uptime with zero server management and a generous free tier.

---

## 📋 Prerequisites

- GitHub account (your repository is already set up)
- Render account (free - sign up at https://render.com)
- Your frontend domain (where your website is hosted)

---

## 🎯 Step-by-Step Deployment

### Step 1: Sign Up for Render

1. Go to **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign in with your **GitHub account**
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

**Option A: Using Blueprint (Automated - Recommended)**

1. Click **"New"** → **"Blueprint"**
2. Connect your GitHub repository: **`Code-with-TanakaB/WebGemini-Portfolio`**
3. Render will auto-detect `render.yaml` in the `affiliate-backend` folder
4. Review the configuration and click **"Apply"**
5. Render will automatically deploy! ✨

**Option B: Manual Setup**

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository: **`Code-with-TanakaB/WebGemini-Portfolio`**
3. Configure the service:
   - **Name:** `webgemini-affiliate-backend`
   - **Runtime:** Docker (or Node if not using Dockerfile)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `affiliate-backend`
   - **Build Command:** `npm install` (or leave blank for Docker)
   - **Start Command:** `node server.js` (or leave blank for Docker)
4. Click **"Advanced"** to set environment variables (see Step 3)

### Step 3: Set Environment Variables

Add these environment variables in Render dashboard:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Render will override with their port |
| `JWT_SECRET` | `your-random-secret-key` | Generate at [randomkeygen.com](https://randomkeygen.com/) |
| `ALLOWED_ORIGINS` | `https://your-website.com` | Your actual domain (comma-separated for multiple) |

**Important Security Notes:**
- Generate a **strong JWT_SECRET** (at least 32 characters)
- Set **ALLOWED_ORIGINS** to your actual website URL
- For multiple origins: `https://site1.com,https://site2.com`

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying (takes 2-5 minutes)
3. Watch the logs in real-time
4. Once deployed, you'll see **"Live"** status with a green indicator

### Step 5: Get Your API URL

Your API will be automatically available at:
```
https://webgemini-affiliate-backend.onrender.com
```

Or your custom name:
```
https://your-service-name.onrender.com
```

**Copy this URL** - you'll need it to update your frontend configuration.

---

## 🔧 Update Frontend Configuration

Update your frontend files to use the Render API URL.

### Files to Update:

1. **`affiliate-dashboard.js`**
2. **`admin-dashboard.js`**
3. Any other files making API calls

### Configuration Template:

Replace the existing `API_BASE_URL` logic with:

```javascript
// API Configuration - Auto-detects environment
const API_BASE_URL = (() => {
    // If on localhost/Codespaces, use local backend
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('github.dev')) {
        return 'http://localhost:3001/api';
    }
    
    // Production: Use Render URL
    return 'https://webgemini-affiliate-backend.onrender.com/api';
})();

console.log('Using API:', API_BASE_URL);
```

**Replace** `webgemini-affiliate-backend.onrender.com` with your actual Render domain.

---

## ✅ Verify Deployment

### Test the API:

Open your Render URL in a browser:
```
https://webgemini-affiliate-backend.onrender.com/api
```

Expected response:
```json
{
  "success": true,
  "message": "Welcome to WebGemini Affiliate System API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Test Health Endpoint:

Visit:
```
https://webgemini-affiliate-backend.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "WebGemini Affiliate API is running",
  "timestamp": "2025-10-28T..."
}
```

---

## 🔄 Auto-Deployment (Continuous Deployment)

Render automatically redeploys when you push to GitHub:

```bash
# 1. Make changes to your code
# 2. Commit and push to GitHub
git add .
git commit -m "Update affiliate backend"
git push origin main

# 3. Render detects the change and auto-deploys
# 4. Check Render dashboard for deployment status
```

**Auto-deploy is enabled by default!** ✨

---

## 📊 Monitoring Your Server

### View Logs:
1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time logs and filter by severity

### Monitor Metrics:
- **Events:** Deployment history and status
- **Metrics:** CPU, Memory, and Network usage (on paid plans)
- **Health Checks:** Automatic monitoring of `/api/health`

### Set Up Alerts:
1. Go to service **"Settings"**
2. Scroll to **"Health Check Path"**
3. Set to `/api/health`
4. Render will notify you if your service goes down

---

## 🔒 Security Checklist

✅ **JWT_SECRET** - Strong random string (32+ characters)
✅ **ALLOWED_ORIGINS** - Set to your actual domain(s)
✅ **HTTPS** - Render provides automatic SSL certificates
✅ **Rate Limiting** - Already configured in server.js
✅ **Database Persistence** - Render persists disk by default

### Backup Your Database:

**Option 1: Render Shell**
```bash
# 1. Go to your service in Render dashboard
# 2. Click "Shell" tab
# 3. Run: cat affiliate.db > /tmp/backup.db
# 4. Download from /tmp/backup.db
```

**Option 2: Automated Backups (Recommended)**
Set up a cron job or use Render's disk snapshots (paid plans).

---

## 🆘 Troubleshooting

### Problem: "Application failed to respond"
**Solution:** 
- Check Render logs for errors
- Ensure health check is set to `/api/health`
- Verify PORT environment variable

### Problem: "CORS error" when calling API
**Solution:** 
1. Check `ALLOWED_ORIGINS` includes your website URL
2. Ensure no trailing slashes
3. Verify frontend uses HTTPS (not HTTP)
4. Check browser console for exact error

### Problem: "Free instance spins down"
**Solution:** 
- Free tier instances sleep after 15 minutes of inactivity
- Upgrade to paid plan ($7/month) for always-on
- Or use a service like UptimeRobot to ping your API every 10 minutes

### Problem: Database resets or data lost
**Solution:**
- Render persists disk by default
- Check that you're not using ephemeral storage
- For critical data, consider upgrading to managed database

### Problem: Build fails
**Solution:**
1. Check build logs in Render dashboard
2. Verify `package.json` has all dependencies
3. Try manual redeploy: Settings → Manual Deploy
4. Check Dockerfile syntax if using Docker

---

## 💰 Cost Estimate

**Free Tier Includes:**
- ✅ 750 hours/month (one service always-on)
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS/SSL
- ✅ Auto-deploys from GitHub
- ✅ Free custom domains
- ⚠️ Instances spin down after 15 min inactivity

**Paid Starter Plan ($7/month):**
- ✅ Always-on (no spin down)
- ✅ Faster build times
- ✅ More resources
- ✅ Priority support

**Expected cost for your app:** 
- **Free** (with occasional cold starts)
- **$7/month** (always responsive)

---

## 🎉 You're Done!

Your affiliate backend is now:
- ✅ Running 24/7 on Render
- ✅ Auto-deploying from GitHub
- ✅ Using HTTPS automatically
- ✅ Monitored with health checks
- ✅ Backed by reliable infrastructure

### Next Steps:
1. ✅ Update frontend to use Render API URL
2. ✅ Test all affiliate features (login, dashboard, tracking)
3. ✅ Set up health check monitoring
4. ✅ Consider upgrading if you need always-on service

---

## 📞 Support & Resources

- **Render Documentation:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Status Page:** https://status.render.com
- **Your Service URL:** Check Render dashboard

---

## 🚀 Quick Command Reference

```bash
# Update your code and redeploy
git add .
git commit -m "Your update message"
git push origin main
# Render auto-deploys in 2-5 minutes

# Test locally before pushing
cd affiliate-backend
npm start

# View logs (using Render CLI)
npm install -g @render-com/cli
render login
render logs

# Manual redeploy
# Go to Render dashboard → Service → Manual Deploy
```

---

## 🔄 Migrating from Railway to Render

If you previously used Railway:

1. ✅ `railway.json` → Replaced with `render.yaml`
2. ✅ Environment variables → Transferred to Render dashboard
3. ✅ Database file → Will persist on Render disk
4. ✅ Update frontend API URLs → Changed to Render domain

**No database migration needed!** Your SQLite file will work as-is.

---

**Congratulations!** Your affiliate system is now production-ready on Render! 🎊
