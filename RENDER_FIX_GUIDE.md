# Fix Render Deployment - Step by Step

## Cost: $14/month (Best Value for Your Use Case)

### Why Render?
- ✅ No server management (AWS requires manual setup)
- ✅ Automatic SSL certificates
- ✅ GitHub integration (auto-deploy)
- ✅ Built-in monitoring
- ✅ Easy environment variables
- ✅ $14/month vs AWS EC2 $20/month + your time

---

## Step 1: Upgrade Render Services

### Backend Service
1. Go to Render Dashboard → Your backend service
2. Upgrade to **Starter Plan** ($7/month)
   - No sleep
   - Always online
   - 512MB RAM (enough for Node.js)

### Database
1. Create new **PostgreSQL** database ($7/month)
   - Free tier: 90 days, then $7/month
   - 1GB storage (plenty for affiliates)
   - Automated backups

---

## Step 2: Configure Environment Variables on Render

Go to your backend service → Environment → Add these:

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-random-string-here-min-32-chars
ALLOWED_ORIGINS=https://your-frontend-domain.com
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

**Get DATABASE_URL:**
- Render Dashboard → Your Postgres DB → "External Database URL"
- Copy and paste into backend service environment

---

## Step 3: Add Health Check

In your backend service settings:
- **Health Check Path**: `/api/health`
- **Health Check Interval**: 30 seconds

This tells Render your service is running correctly.

---

## Step 4: Migrate from SQLite to PostgreSQL

### Update package.json (add pg driver)

```bash
cd affiliate-backend
npm install pg
```

### Update database.js to use PostgreSQL

I'll create this file for you below.

---

## Step 5: Update Frontend API URL

Make sure your frontend points to the correct backend:

In your HTML files, update API_BASE_URL:
```javascript
const API_BASE_URL = 'https://your-backend-name.onrender.com/api';
```

---

## Step 6: Deploy

1. Commit changes: `git add . && git commit -m "Migrate to PostgreSQL"`
2. Push to GitHub: `git push`
3. Render auto-deploys
4. Check logs: Render Dashboard → Logs

---

## Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Verify DATABASE_URL is set correctly
- Verify JWT_SECRET is set

### 401 errors on login?
- Check JWT_SECRET is same across deploys
- Check ALLOWED_ORIGINS includes your frontend domain

### Database connection errors?
- Verify DATABASE_URL format: `postgres://user:pass@host:5432/dbname`
- Check Postgres service is running

---

## Cost Breakdown

| Service | Cost | Why |
|---------|------|-----|
| Backend (Starter) | $7/mo | No sleep, always on |
| PostgreSQL | $7/mo | Persistent data, backups |
| **Total** | **$14/mo** | **Best value for your needs** |

Compare to AWS EC2:
- EC2 instance: $10/mo
- Elastic IP: $3.60/mo
- Storage: $2/mo
- Your time: Priceless
- SSL setup: Manual
- **Total: $20/mo + lots of work**

---

## Alternative: Free Tier (with limitations)

If you want to stay free:
1. Keep Render free tier (sleeps after 15min inactivity)
2. Use UptimeRobot to ping every 14 minutes (keeps it awake)
3. Use free Postgres (90 days, then expires)

**Limitations:**
- First request after sleep takes 30-60 seconds
- Free Postgres expires after 90 days
- Not recommended for production

---

## Next Steps

1. I can create the PostgreSQL migration code for you
2. I can update your database.js file
3. I can help set up environment variables

**Want me to proceed with the migration?**
