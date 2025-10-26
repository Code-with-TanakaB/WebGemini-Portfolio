# 🚀 Railway Deployment Guide - WebGemini Affiliate System

This guide will help you deploy your affiliate backend to Railway for 24/7 uptime with zero server management.

---

## 📋 Prerequisites

- GitHub account (your repository is already set up)
- Railway account (free - sign up at https://railway.app)
- Your frontend domain (where your website is hosted)

---

## 🎯 Step-by-Step Deployment

### Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign in with your **GitHub account**
4. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search for and select: **`Code-with-TanakaB/WebGemini-Portfolio`**
4. Railway will detect your repository

### Step 3: Configure Root Directory

Since your backend is in a subdirectory:

1. Click on your deployed service
2. Go to **Settings** tab
3. Find **"Root Directory"** or **"Service Settings"**
4. Set root directory to: **`affiliate-backend`**
5. Click **Save**

### Step 4: Set Environment Variables

1. In your Railway project, click on **Variables** tab
2. Add these environment variables:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=generate-a-random-secure-string-here
ALLOWED_ORIGINS=https://your-actual-website.com
```

**Important:** 
- Replace `JWT_SECRET` with a random string (use this generator: https://randomkeygen.com/)
- Replace `ALLOWED_ORIGINS` with your actual website URL (e.g., `https://code-with-tanakab.github.io`)
- Add multiple origins separated by commas if needed: `https://site1.com,https://site2.com`

### Step 5: Deploy

1. Railway will automatically start building and deploying
2. Wait 2-3 minutes for the deployment to complete
3. Once deployed, you'll see a **"Deploy successful"** message

### Step 6: Get Your API URL

1. In your Railway project, click on **Settings**
2. Find **"Domains"** section
3. Click **"Generate Domain"**
4. Railway will give you a URL like: `https://webgemini-production.up.railway.app`
5. **Copy this URL** - you'll need it for the next step

---

## 🔧 Update Frontend Configuration

Now you need to update your frontend files to use the Railway API URL.

### Files to Update:

1. **`affiliate-dashboard.js`**
2. **`admin-dashboard.js`**
3. **`client-signup.html`** (if it has direct API calls)

### Configuration Template:

Add this at the top of your JavaScript files:

```javascript
// API Configuration - Auto-detects environment
const API_BASE_URL = (() => {
    // If on localhost/Codespaces, use local backend
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('github.dev')) {
        return 'http://localhost:3001/api';
    }
    
    // Production: Use Railway URL
    return 'https://your-railway-domain.up.railway.app/api';
})();

console.log('Using API:', API_BASE_URL);
```

**Replace** `https://your-railway-domain.up.railway.app` with your actual Railway domain from Step 6.

---

## ✅ Verify Deployment

### Test the API:

1. Open your Railway URL in a browser: `https://your-railway-domain.up.railway.app/api`
2. You should see a JSON response like:
```json
{
  "success": true,
  "message": "Welcome to WebGemini Affiliate System API",
  "version": "1.0.0"
}
```

### Test Health Endpoint:

Visit: `https://your-railway-domain.up.railway.app/api/health`

You should see:
```json
{
  "success": true,
  "message": "WebGemini Affiliate API is running",
  "timestamp": "2025-10-26T..."
}
```

---

## 🔄 Auto-Deployment (Continuous Deployment)

Railway automatically redeploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update affiliate backend"
   git push origin main
   ```
3. Railway detects the change and automatically redeploys
4. Wait 2-3 minutes for the new version to be live

---

## 📊 Monitoring Your Server

### View Logs:
1. Go to your Railway project dashboard
2. Click on your service
3. Click **"Deployments"** tab
4. Click on the active deployment
5. Click **"View Logs"** to see real-time server logs

### Monitor Resources:
- Railway shows CPU, Memory, and Network usage
- Free tier includes: 500 hours/month, $5 credit
- Upgrade if you need more resources

---

## 🔒 Security Checklist

✅ **JWT_SECRET** - Set to a random, secure string (at least 32 characters)
✅ **ALLOWED_ORIGINS** - Set to your actual website domain
✅ **HTTPS** - Railway provides automatic HTTPS
✅ **Rate Limiting** - Already configured in your server.js
✅ **Database Backups** - Download periodically from Railway

### Backup Your Database:

1. Go to Railway dashboard
2. Click on your service
3. Click **"Data"** or **"Volumes"**
4. Find `affiliate.db` file
5. Download a backup copy weekly

---

## 🆘 Troubleshooting

### Problem: "Application failed to respond"
**Solution:** Check Railway logs for errors. Ensure PORT is set to 3001 in environment variables.

### Problem: "CORS error" when calling API
**Solution:** 
1. Check `ALLOWED_ORIGINS` includes your website URL
2. Ensure no trailing slashes in URLs
3. Verify your frontend is using HTTPS (not HTTP)

### Problem: Database not persisting
**Solution:** 
1. Go to Railway settings
2. Add a **Volume** mount
3. Set mount path to: `/app/affiliate.db`

### Problem: "Cannot find module" errors
**Solution:**
1. Check that `railway.json` has correct build command
2. Ensure `package.json` has all dependencies
3. Try redeploying: Settings → Redeploy

---

## 💰 Cost Estimate

Railway **Free Tier** includes:
- ✅ $5 in credits per month
- ✅ 500 hours of uptime
- ✅ 100GB bandwidth
- ✅ Automatic HTTPS

**Expected cost for your app:** $0-5/month (well within free tier for small traffic)

To prevent unexpected charges:
1. Go to Railway project settings
2. Set a **usage limit**
3. Add a **notification** for 80% usage

---

## 🎉 You're Done!

Your affiliate backend is now:
- ✅ Running 24/7 on Railway
- ✅ Auto-deploying from GitHub
- ✅ Using HTTPS automatically
- ✅ Backed by Railway's infrastructure
- ✅ Monitored with real-time logs

### Next Steps:
1. Update your frontend to use the Railway API URL
2. Test all affiliate features (login, dashboard, tracking)
3. Set up weekly database backups
4. Monitor logs regularly for any issues

---

## 📞 Support & Resources

- **Railway Documentation:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **Your Deployment URL:** Check Railway dashboard → Domains

---

## 🚀 Quick Command Reference

```bash
# Update your code and redeploy
git add .
git commit -m "Your update message"
git push origin main
# Railway auto-deploys in 2-3 minutes

# Test your API locally before pushing
cd affiliate-backend
npm start

# Check Railway deployment status
# Visit: https://railway.app/dashboard
```

---

**Congratulations!** Your affiliate system is now production-ready and will stay online 24/7! 🎊
