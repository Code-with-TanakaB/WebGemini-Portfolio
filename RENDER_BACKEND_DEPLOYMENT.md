# ANSWER: Where to Deploy Backend & Which Database URL

## Your Questions Answered

### Q1: "I can't see where I deploy the backend folder"

**A:** You need to create a **Web Service** in Render (separate from the database).

**Steps:**
1. Go to Render Dashboard: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"** from dropdown
4. Connect your GitHub repo: `WebGemini-Portfolio`
5. Configure these settings:
   - **Root Directory**: `affiliate-backend` (IMPORTANT!)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (see below)
7. Click "Create Web Service"

---

### Q2: "Do you require internal or external database URL?"

**A:** Use **EXTERNAL Database URL** ✅

**Why?**
- **External URL**: Your web service can access it ✅
- **Internal URL**: Only for Render's internal network ❌

**How to Get External URL:**
1. Go to your PostgreSQL database in Render
2. Scroll to "Connections" section
3. Find "**External Database URL**"
4. Click Copy button
5. Should look like: `postgres://user:pass@dpg-xxx.oregon-postgres.render.com/dbname`

---

## Complete Configuration Checklist

### Web Service Settings:

```
Name: webgemini-affiliate-backend
Region: (Same as your database)
Branch: main
Root Directory: affiliate-backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Environment Variables (Add these 5):

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-random-32-character-secret-key-here
DATABASE_URL=postgres://[paste-external-url-here]
ALLOWED_ORIGINS=https://yoursite.com
```

### Health Check:

```
Health Check Path: /api/health
```

---

## What Happens Next

1. **Deploy**: Wait 2-5 minutes
2. **Get URL**: `https://your-service.onrender.com`
3. **Test**: Visit `https://your-service.onrender.com/api/health`
4. **Share**: Tell me your backend URL
5. **Update**: I'll update your frontend files
6. **Upload**: Upload frontend to GoDaddy
7. **Done**: Site is live! ✅

---

## Need Visual Guide?

Read the full step-by-step with screenshots:
- `GODADDY_RENDER_SPLIT_DEPLOYMENT.md`

---

**Start here:** Click "New +" → "Web Service" in Render Dashboard
