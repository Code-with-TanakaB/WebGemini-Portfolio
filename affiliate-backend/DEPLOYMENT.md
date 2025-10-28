# WebGemini Affiliate Backend - Deployment Guide

## 🚀 Running in Production

### Option 1: Using PM2 (Recommended)

PM2 is a production-grade process manager that keeps your server running 24/7, auto-restarts on crashes, and provides monitoring.

#### Install PM2 globally on your server:
```bash
npm install -g pm2
```

#### Start the server:
```bash
cd /workspaces/WebGemini-Portfolio/affiliate-backend
npm run prod
```

#### Useful PM2 Commands:
```bash
npm run status    # Check server status
npm run logs      # View live logs
npm run restart   # Restart server
npm run stop      # Stop server
pm2 list          # List all running processes
pm2 monit         # Real-time monitoring dashboard
```

#### Make PM2 start on system boot:
```bash
pm2 startup
pm2 save
```

---

### Option 2: Using systemd (Linux servers)

Create a systemd service file for automatic startup and management.

#### Create service file:
```bash
sudo nano /etc/systemd/system/webgemini-affiliate.service
```

#### Add this configuration:
```ini
[Unit]
Description=WebGemini Affiliate Backend
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/WebGemini-Portfolio/affiliate-backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=webgemini-affiliate
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

#### Enable and start the service:
```bash
sudo systemctl enable webgemini-affiliate
sudo systemctl start webgemini-affiliate
sudo systemctl status webgemini-affiliate
```

#### Service management commands:
```bash
sudo systemctl restart webgemini-affiliate  # Restart
sudo systemctl stop webgemini-affiliate     # Stop
sudo journalctl -u webgemini-affiliate -f   # View logs
```

---

### Option 3: Using Docker

For containerized deployment with easy portability.

#### Create Dockerfile in affiliate-backend folder:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

#### Create docker-compose.yml:
```yaml
version: '3.8'

services:
  affiliate-backend:
    build: .
    ports:
      - "3001:3001"
    restart: unless-stopped
    volumes:
      - ./affiliate.db:/app/affiliate.db
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3001
```

#### Run with Docker:
```bash
docker-compose up -d
docker-compose logs -f        # View logs
docker-compose restart        # Restart
docker-compose down           # Stop
```

---

## 🌐 Deployment Platforms

### 1. **VPS/Dedicated Server** (Most Control)
- **Providers**: DigitalOcean, Linode, Vultr, AWS EC2
- **Setup**: SSH access, install Node.js, use PM2 or systemd
- **Cost**: $5-20/month
- **Best for**: Full control, SQLite database

### 2. **Platform as a Service (PaaS)**

#### **Heroku** (Easiest)
```bash
# Install Heroku CLI
heroku login
heroku create webgemini-affiliate
git push heroku main
```
⚠️ Note: Heroku's filesystem is ephemeral - you'll need to migrate to PostgreSQL

#### **Render** (Recommended - Free tier available, SQLite-friendly)

**Option A: Using render.yaml (Automated)**
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Add Render configuration"
git push origin main

# 2. Go to https://render.com and sign up/login
# 3. Click "New" → "Blueprint"
# 4. Connect your GitHub repository
# 5. Render will auto-detect render.yaml and deploy!
```

**Option B: Manual Setup**
```bash
# 1. Go to https://render.com
# 2. Click "New" → "Web Service"
# 3. Connect your GitHub repository
# 4. Configure:
#    - Name: webgemini-affiliate-backend
#    - Runtime: Docker (or Node if not using Dockerfile)
#    - Build Command: npm install
#    - Start Command: node server.js
# 5. Add environment variables:
#    - NODE_ENV=production
#    - JWT_SECRET=your-secret-key
#    - ALLOWED_ORIGINS=https://yourwebsite.com
# 6. Click "Create Web Service"
```

**Your API will be available at**: `https://webgemini-affiliate-backend.onrender.com`

### 3. **Serverless** (Auto-scaling)
- **Vercel**: Good for API routes
- **Netlify Functions**: Similar to Vercel
- **AWS Lambda**: Most flexible

⚠️ Note: Serverless requires migrating from SQLite to a managed database (PostgreSQL, MySQL)

---

## 🔒 Security Checklist for Production

### 1. Environment Variables
Create `.env` file (never commit to Git):
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
```

Update `server.js` to use JWT_SECRET from env:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';
```

### 2. HTTPS/SSL Certificate
- Use **Let's Encrypt** (free SSL)
- Use **Nginx** or **Apache** as reverse proxy
- All API calls should use HTTPS in production

### 3. Firewall Rules
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. CORS Configuration
Update allowed origins in `server.js`:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};
```

### 5. Database Backups
```bash
# Create daily backup script
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * cp /path/to/affiliate-backend/affiliate.db /path/to/backups/affiliate-$(date +\%Y\%m\%d).db
```

---

## 📊 Monitoring & Logging

### View PM2 Logs:
```bash
pm2 logs webgemini-affiliate-backend --lines 100
```

### Monitor Performance:
```bash
pm2 monit
```

### Log Rotation (prevent disk space issues):
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 Updating Your Server

### With PM2:
```bash
cd /workspaces/WebGemini-Portfolio/affiliate-backend
git pull origin main
npm install
npm run restart
```

### Zero-downtime deployment:
```bash
pm2 reload ecosystem.config.js
```

---

## 🆘 Troubleshooting

### Server not starting:
```bash
# Check if port is in use
lsof -i :3001
sudo netstat -tulpn | grep 3001

# Kill process on port 3001
sudo kill -9 $(lsof -t -i:3001)
```

### Database locked errors:
```bash
# Ensure only one server instance is running
pm2 list
pm2 delete all
npm run prod
```

### Can't connect from frontend:
1. Check CORS settings in `server.js`
2. Verify firewall allows port 3001
3. Update frontend API URLs to production domain

---

## 📱 Frontend Configuration

Update your frontend files to use production API URL:

### In `affiliate-dashboard.js`, `admin-dashboard.js`, `client-signup.html`:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://api.yourwebsite.com/api';  // Your production API URL
```

---

## 🎯 Quick Start Guide

**For immediate production deployment:**

```bash
# 1. Navigate to backend folder
cd /workspaces/WebGemini-Portfolio/affiliate-backend

# 2. Install PM2 globally
npm install -g pm2

# 3. Start server with PM2
npm run prod

# 4. Verify it's running
npm run status

# 5. Set up auto-start on reboot
pm2 startup
pm2 save

# 6. View logs
npm run logs
```

Your server is now running 24/7 with automatic restart on crashes! 🚀

---

## 📞 Support Resources

- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
- Express.js Production Guide: https://expressjs.com/en/advanced/best-practice-performance.html
