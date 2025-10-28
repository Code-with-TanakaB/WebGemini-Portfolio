# UptimeRobot Setup Guide - Keep Your Render Service Active

This guide will help you set up UptimeRobot to prevent your free Render service from spinning down during business hours.

---

## 🎯 What This Does

- **Prevents Cold Starts**: Keeps your server warm by pinging it every 5 minutes
- **Free Solution**: UptimeRobot's free tier allows 50 monitors with 5-minute intervals
- **Business Hours Focus**: You can configure it to only ping during active hours
- **Bonus**: Get downtime alerts if your service goes down

---

## 📋 Step-by-Step Setup

### Step 1: Sign Up for UptimeRobot

1. Go to **https://uptimerobot.com**
2. Click **"Sign Up Free"**
3. Enter your email and create a password
4. Verify your email address

---

### Step 2: Create Your First Monitor

1. After login, click **"+ Add New Monitor"**
2. Fill in the details:

   **Monitor Type:** `HTTP(s)`
   
   **Friendly Name:** `WebGemini Affiliate Backend`
   
   **URL (or IP):** `https://webgemini-portfolio.onrender.com/api/health`
   
   **Monitoring Interval:** `5 minutes` (free tier default)
   
   **Monitor Timeout:** `30 seconds`
   
   **Alert Contacts:** Select your email (to get notified if service is down)

3. Click **"Create Monitor"**

---

### Step 3: Verify It's Working

1. Wait 5 minutes for the first check
2. You'll see a green status indicator: **"Up"**
3. Check your Render logs to see the ping requests coming in
4. Your service should now stay active! 🎉

---

## 🕒 Advanced: Business Hours Only (Optional)

If you want to save resources and only keep the service active during business hours:

### Option 1: Use UptimeRobot Maintenance Windows

1. In UptimeRobot, go to **"Settings"** → **"Maintenance Windows"**
2. Create a maintenance window for **after business hours**
   - Example: Monday-Friday, 6 PM - 8 AM
   - Example: All day Saturday & Sunday
3. During maintenance windows, monitoring is paused (service can spin down)

### Option 2: Use Multiple Monitors with Different Schedules

**Free tier limitation**: This requires the paid plan ($7/month for UptimeRobot)

1. Monitor 1: **Business Hours** (5-minute intervals)
   - Active: Monday-Friday, 8 AM - 6 PM
2. Monitor 2: **Off Hours** (60-minute intervals or paused)
   - Active: Evenings and weekends

---

## 📊 Monitoring Dashboard

### What You'll See:

- **Uptime Percentage**: Should be 99.9%+ if Render is healthy
- **Response Time**: Average API response time (~200-500ms)
- **Down Events**: Alerts when service is unreachable
- **Logs**: History of all checks

### Understanding Response Times:

| Response Time | Status | Explanation |
|--------------|--------|-------------|
| 200-500ms | ✅ Normal | Service is warm and responsive |
| 1-3 seconds | ⚠️ Slow | Service might be under load |
| 30+ seconds | 🔴 Cold Start | Service was spun down, now warming up |

---

## 🔧 Troubleshooting

### Issue: Monitor shows "Down"
**Check:**
1. Is your Render service deployed and running?
2. Visit the health endpoint directly: `https://webgemini-portfolio.onrender.com/api/health`
3. Check Render logs for errors

### Issue: Response time is always 30+ seconds
**Problem:** Service is spinning down despite pings
**Solution:** 
- Verify UptimeRobot interval is 5 minutes (not longer)
- Check that monitor is actually running (not paused)
- Render free tier has 15-minute spin down, 5-minute pings should prevent it

### Issue: Too many notification emails
**Solution:**
1. Go to **"Alert Contacts"** in UptimeRobot
2. Edit your email contact
3. Set **"Send alerts when down for X minutes"** to `10 minutes`
4. This prevents false alarms during brief outages

---

## 💰 Cost Comparison

### Free Tier (What You're Using):
- ✅ 50 monitors
- ✅ 5-minute intervals
- ✅ Email/SMS alerts
- ✅ 2-month logs retention
- ⚠️ Cannot customize schedules by day/hour

### Pro Plan ($7/month):
- ✅ Everything in free
- ✅ 1-minute intervals (faster pings)
- ✅ Custom monitoring schedules
- ✅ 1-year logs retention
- ✅ Advanced alert options

**Recommendation:** Start with free tier. Upgrade UptimeRobot only if you need 1-minute pings or custom schedules.

---

## 🎯 Alternative: Self-Hosted Ping (GitHub Actions)

If you prefer not to use a third-party service, you can use **GitHub Actions** to ping your service:

### Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Service Alive

on:
  schedule:
    # Run every 5 minutes during business hours (8 AM - 6 PM UTC, Mon-Fri)
    - cron: '*/5 8-18 * * 1-5'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://webgemini-portfolio.onrender.com/api/health)
          if [ $response -eq 200 ]; then
            echo "✅ Service is alive (HTTP $response)"
          else
            echo "⚠️ Service returned HTTP $response"
            exit 1
          fi
```

**Pros:**
- ✅ Free (included with GitHub)
- ✅ No third-party account needed
- ✅ Fully customizable schedule
- ✅ Version controlled

**Cons:**
- ❌ No uptime dashboard
- ❌ No automatic alerts (need to set up separately)
- ❌ GitHub Actions has limited free minutes (2000/month)

---

## 📱 Mobile App (Bonus)

UptimeRobot has mobile apps:
- **iOS:** https://apps.apple.com/app/uptimerobot/id1104878581
- **Android:** https://play.google.com/store/apps/details?id=com.uptimerobot

Monitor your service on the go! 📲

---

## ✅ Final Checklist

- [ ] UptimeRobot account created
- [ ] Monitor added with 5-minute interval
- [ ] Health endpoint configured: `https://webgemini-portfolio.onrender.com/api/health`
- [ ] Email alerts enabled
- [ ] First check completed successfully
- [ ] Verified service stays warm (check after 20 minutes)

---

## 📞 Support

**UptimeRobot:**
- Help Center: https://blog.uptimerobot.com/category/help/
- Support: support@uptimerobot.com

**Your Service:**
- Health Check: https://webgemini-portfolio.onrender.com/api/health
- Render Dashboard: https://dashboard.render.com/web/srv-d40dup3ipnbc73cki8b0

---

**Setup Complete!** Your Render service will now stay active during business hours. 🎉

Monitor your uptime at: https://uptimerobot.com/dashboard
