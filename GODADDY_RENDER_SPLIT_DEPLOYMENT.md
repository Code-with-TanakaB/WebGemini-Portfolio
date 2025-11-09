# Split Deployment Guide: GoDaddy + Render

## Best Solution for Your Situation

**Frontend (Static Files)** → GoDaddy cPanel (your existing hosting)
**Backend (Node.js API)** → Render ($0-14/month)

---

## Why This Works Best

✅ Use your existing GoDaddy hosting (already paid for)
✅ Backend runs properly on platform designed for Node.js
✅ No hosting upgrade needed
✅ Easy to maintain
✅ Professional setup
✅ Automatic SSL on both sides

---

## Architecture

```
User Browser
    ↓
GoDaddy cPanel (HTML/CSS/JS)
    ↓ API Calls
Render Backend (Node.js + PostgreSQL)
    ↓
Returns JSON Data
```

---

## Part 1: Deploy Backend to Render

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub

### 2. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `webgemini-affiliate-db`
3. Region: Choose closest to you
4. Plan: Free or Starter ($7/mo)
5. Click "Create Database"
6. **Copy the "External Database URL"** (save this!)

### 3. Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `webgemini-affiliate-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `affiliate-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (with sleep) or Starter ($7/mo)

### 4. Add Environment Variables
Click "Environment" → Add:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-key-min-32-chars-change-this
DATABASE_URL=<paste the database URL from step 2>
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
```

### 5. Add Health Check
- **Health Check Path**: `/api/health`
- Save settings

### 6. Deploy
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- **Copy your backend URL**: `https://your-service.onrender.com`

---

## Part 2: Prepare Frontend Files

### Update API URLs in All Files

You need to update these files to point to your Render backend:

#### Files to Update:
- `login.html`
- `affiliate-dashboard.js`
- `admin-dashboard.js`
- `client-signup.html`

### Updates Needed:

**1. Open `affiliate-dashboard.js`**

Find this line (around line 3-12):
```javascript
const API_BASE_URL = (() => {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('github.dev')) {
        return 'http://localhost:3001/api';
    }
    return 'https://webgemini-portfolio.onrender.com/api';
})();
```

Change to:
```javascript
const API_BASE_URL = 'https://YOUR-BACKEND-NAME.onrender.com/api';
```
(Replace `YOUR-BACKEND-NAME` with your actual Render service name)

**2. Open `admin-dashboard.js`**

Find similar code and update:
```javascript
const API_BASE_URL = 'https://YOUR-BACKEND-NAME.onrender.com/api';
```

**3. Open `login.html`**

Find the script section with API_BASE_URL and update:
```javascript
const API_BASE_URL = 'https://YOUR-BACKEND-NAME.onrender.com/api';
```

**4. Open `client-signup.html`**

Find and update:
```javascript
const API_BASE_URL = 'https://YOUR-BACKEND-NAME.onrender.com/api';
```

---

## Part 3: Upload Frontend to GoDaddy cPanel

### Files to Upload:
```
index.html
style.css
script.js
dashboard-style.css
blog.html
terms.html
login.html
affiliate-dashboard.html
affiliate-dashboard.js
admin-dashboard.html
admin-dashboard.js
client-signup.html
google1191e567d1ced9d8.html (if needed)
image/ (entire folder)
```

### Files NOT to Upload (Backend files):
```
❌ affiliate-backend/ (stays on Render)
❌ node_modules/
❌ affiliate.db
❌ .env
❌ package.json (backend)
```

### Upload Steps:

#### Option A: File Manager (Easy)
1. Log into GoDaddy cPanel
2. Click "File Manager"
3. Navigate to `public_html/` folder
4. Click "Upload"
5. Select all frontend files (listed above)
6. Wait for upload to complete

#### Option B: FTP (Professional)
1. Get FTP credentials from GoDaddy cPanel (FTP Accounts)
2. Use FileZilla or similar FTP client
3. Connect to your site
4. Upload files to `public_html/` folder

---

## Part 4: Update CORS on Backend

Make sure backend allows your GoDaddy domain.

On Render, update `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
```

Replace `yoursite.com` with your actual GoDaddy domain.

---

## Part 5: Test Everything

### Test Backend
1. Visit: `https://YOUR-BACKEND-NAME.onrender.com/api/health`
2. Should see: `{"success":true,"message":"WebGemini Affiliate API is running",...}`

### Test Frontend
1. Visit: `https://yoursite.com` (your GoDaddy domain)
2. Site should load normally
3. Click "Login" → Try demo login (admin/admin)
4. Should redirect to dashboard
5. Check browser console (F12) for errors

### Test API Connection
1. Go to client signup page
2. Fill out form with test data
3. Submit
4. Should work without errors

---

## Part 6: Fix ALLOWED_ORIGINS (If CORS Errors)

If you see CORS errors in browser console:

1. Go to Render Dashboard → Your backend service
2. Environment → Update `ALLOWED_ORIGINS`
3. Add all variations of your domain:
```
https://yoursite.com,https://www.yoursite.com,http://yoursite.com,http://www.yoursite.com
```

---

## Troubleshooting

### Problem: "Failed to fetch" errors
**Solution:** Check API_BASE_URL in frontend files points to correct Render URL

### Problem: CORS errors
**Solution:** Update ALLOWED_ORIGINS on Render to include your GoDaddy domain

### Problem: 401 Unauthorized
**Solution:** Check JWT_SECRET is set on Render

### Problem: Backend sleeping (free tier)
**Solution:** Either upgrade to Starter ($7/mo) or use UptimeRobot to ping

### Problem: Database connection errors
**Solution:** Verify DATABASE_URL is set correctly on Render

---

## Costs Summary

| Item | Cost | Notes |
|------|------|-------|
| GoDaddy Hosting | $Already paid$ | Use existing plan |
| Render Backend (Free) | $0/mo | Sleeps after 15min |
| Render Backend (Paid) | $7/mo | Always on |
| Render Database (Free) | $0/mo | 90 days, then expires |
| Render Database (Paid) | $7/mo | 1GB, backups |
| **Total (Free)** | **$0/mo** | With limitations |
| **Total (Paid)** | **$14/mo** | Production ready |

---

## Want Me to Do This For You?

I can:
1. ✅ Update all frontend files with correct API URLs (just give me your Render URL)
2. ✅ Create deployment checklist
3. ✅ Help troubleshoot any issues
4. ✅ Test the setup

**Just tell me your Render backend URL when ready!**
