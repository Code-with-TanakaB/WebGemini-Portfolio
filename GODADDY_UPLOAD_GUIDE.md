# GoDaddy Upload Checklist - Ready to Deploy!

## ✅ Backend Status
- **Backend URL**: https://webgemini-portfolio.onrender.com
- **Status**: Live and running ✅
- **Database**: PostgreSQL on Render ✅
- **Frontend Files**: Updated and committed ✅

---

## 📤 Files to Upload to GoDaddy cPanel

### Upload These Frontend Files:

```
✅ HTML Files:
   - index.html
   - login.html
   - affiliate-dashboard.html
   - admin-dashboard.html
   - client-signup.html
   - blog.html
   - terms.html
   - google1191e567d1ced9d8.html (if exists)

✅ CSS Files:
   - style.css
   - dashboard-style.css

✅ JavaScript Files:
   - script.js
   - affiliate-dashboard.js
   - admin-dashboard.js
   - hero-collection.js

✅ Folders:
   - image/ (entire folder with all images)

✅ Other Files:
   - Any favicon files
   - Any robots.txt or sitemap files
```

### ❌ DO NOT Upload These (Backend Files):

```
❌ affiliate-backend/ (entire folder - stays on Render)
❌ node_modules/
❌ affiliate.db
❌ .env
❌ .git/
❌ package.json (from root or backend)
❌ package-lock.json
❌ .gitignore
❌ Any .md documentation files (optional)
```

---

## 🚀 Step-by-Step Upload Process

### Method 1: File Manager (Easiest)

1. **Log into GoDaddy cPanel**
   - Go to: https://myaccount.godaddy.com
   - Products → Web Hosting → Manage
   - Click "cPanel Admin"

2. **Open File Manager**
   - Find "Files" section
   - Click "File Manager"

3. **Navigate to public_html**
   - In left sidebar, click `public_html/`
   - This is your website's root folder

4. **Upload Files**
   - Click "Upload" button (top menu)
   - Drag and drop all frontend files
   - Or click "Select File" and choose files
   - Wait for upload to complete (green checkmarks)

5. **Upload image folder**
   - You can upload the entire `image/` folder
   - Or create folder first, then upload contents

### Method 2: FTP (Professional)

1. **Get FTP Credentials**
   - In cPanel, find "FTP Accounts"
   - Create new FTP account or use main account
   - Note: Host, Username, Password

2. **Connect with FTP Client**
   - Download FileZilla (free): https://filezilla-project.org
   - Connect using your credentials
   - Navigate to `public_html/`

3. **Upload Files**
   - Drag frontend files from left to right
   - Upload to `public_html/` folder

---

## 🔧 Important Configuration

### Update ALLOWED_ORIGINS on Render

After uploading, update your backend to allow your GoDaddy domain:

1. Go to Render Dashboard
2. Click on your web service: `webgemini-portfolio`
3. Go to "Environment" tab
4. Find `ALLOWED_ORIGINS` variable
5. Update value to:
   ```
   https://yoursite.com,https://www.yoursite.com
   ```
   (Replace `yoursite.com` with your actual GoDaddy domain)

6. Save changes
7. Backend will auto-restart

---

## ✅ Testing Checklist

After uploading to GoDaddy:

### Test 1: Site Loads
- [ ] Visit your GoDaddy domain
- [ ] Homepage loads correctly
- [ ] Images display
- [ ] No console errors (press F12)

### Test 2: Backend Connection
- [ ] Open browser console (F12)
- [ ] Should see: "Affiliate Dashboard using API: https://webgemini-portfolio.onrender.com/api"
- [ ] No CORS errors

### Test 3: Login System
- [ ] Go to login page
- [ ] Uncheck "Demo Mode" checkbox
- [ ] Try registering a new affiliate (real registration)
- [ ] Should get success message

### Test 4: Client Signup
- [ ] Go to client signup page
- [ ] Fill out form with test data
- [ ] Use a valid coupon code (from an affiliate)
- [ ] Submit form
- [ ] Should track referral in database

### Test 5: Dashboards
- [ ] Login as affiliate
- [ ] Dashboard should show real data from backend
- [ ] Check stats, referrals load
- [ ] Logout and try admin login

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" errors

**Check:**
1. Is backend URL correct in all files? ✅ (Already updated)
2. Is backend running? Visit: https://webgemini-portfolio.onrender.com/api/health
3. Should see: `{"success": true, "message": "WebGemini Affiliate API is running"}`

**Fix:**
- If backend is sleeping (free tier), wait 30 seconds for cold start
- Or upgrade to Starter plan ($7/mo) for always-on

### Problem: CORS errors in console

**Error:**
```
Access to fetch at 'https://webgemini-portfolio.onrender.com/api/...' 
from origin 'https://yoursite.com' has been blocked by CORS policy
```

**Fix:**
1. Go to Render → Your web service → Environment
2. Update `ALLOWED_ORIGINS` to include your GoDaddy domain
3. Format: `https://yoursite.com,https://www.yoursite.com`

### Problem: 401 Unauthorized on login

**Check:**
1. Is `JWT_SECRET` set on Render?
2. Backend logs for errors

**Fix:**
- Verify JWT_SECRET environment variable exists on Render

### Problem: Database connection errors

**Check backend logs:**
1. Render Dashboard → Web Service → Logs
2. Look for PostgreSQL connection errors

**Fix:**
- Verify `DATABASE_URL` is set correctly (external URL)
- Format: `postgresql://user:pass@dpg-...oregon-postgres.render.com/dbname`

---

## 📊 Quick Status Check

### Before Upload:
- [x] Backend deployed on Render
- [x] PostgreSQL database created
- [x] Environment variables set
- [x] Frontend files updated with backend URL
- [x] Changes committed to GitHub

### After Upload:
- [ ] Files uploaded to GoDaddy cPanel
- [ ] ALLOWED_ORIGINS updated on Render
- [ ] Site tested and working
- [ ] Login/signup working
- [ ] Dashboards loading data

---

## 🎯 Your Current Setup

```
User Browser
    ↓
https://yoursite.com (GoDaddy cPanel)
    ↓ API Calls
https://webgemini-portfolio.onrender.com/api (Render Backend)
    ↓
PostgreSQL Database (Render)
```

---

## 💰 Cost Summary

| Service | What | Cost |
|---------|------|------|
| GoDaddy | Frontend hosting | Already paid ✅ |
| Render Web Service | Backend (Free tier) | $0/mo (sleeps) |
| Render Web Service | Backend (Starter) | $7/mo (always-on) |
| Render PostgreSQL | Database (Free) | $0/mo (90 days) |
| Render PostgreSQL | Database (Paid) | $7/mo (persistent) |
| **Total (Free)** | | **$0/mo** |
| **Total (Production)** | | **$14/mo** |

---

## 🚀 Next Steps

1. **Upload files to GoDaddy** (follow steps above)
2. **Update ALLOWED_ORIGINS** on Render
3. **Test everything** (follow testing checklist)
4. **Tell me if any issues** - I'll help troubleshoot!

---

## 📝 Notes

- All frontend files now point to: `https://webgemini-portfolio.onrender.com/api`
- Backend is live and ready
- Database is connected
- Just upload and test!

**Need help? Ask me!** 🙌
