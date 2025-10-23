# WebGemini Affiliate System

A complete affiliate tracking system for commission-based web services marketing campaigns. This system enables transparent tracking of referrals, automatic commission calculation, and provides separate dashboards for both administrators and affiliates.

## 🌟 Features

### For Administrators
- **Complete Overview Dashboard** - View all affiliates, clients, and revenue metrics in real-time
- **Transparent Tracking** - See exactly which influencer referred which client
- **Commission Management** - Track pending and paid commissions with detailed breakdowns
- **Affiliate Management** - Add, view, and manage all affiliate accounts
- **Automated Commission Calculation** - 10% for starter plans, 25% for high-tier plans

### For Affiliates
- **Personal Dashboard** - Track your referrals and earnings in real-time
- **Unique Coupon Code** - Each affiliate gets a unique discount code to share
- **Earnings Tracking** - View total, pending, and paid earnings
- **Referral Details** - See all clients you've referred with commission breakdown
- **Social Sharing Tools** - Easy sharing on Twitter, Facebook, LinkedIn, and WhatsApp

### Client Signup Integration
- **Coupon Code Validation** - Real-time verification of affiliate codes
- **Automatic Tracking** - Client signups are automatically tracked and linked to affiliates
- **Multiple Plan Support** - Starter, Basic, Pro, Premium, and Enterprise plans

## 📋 Commission Structure

| Plan Type | Commission Rate |
|-----------|----------------|
| Starter Plans (Basic, Starter) | 10% |
| High-Tier Plans (Premium, Pro, Enterprise, Advanced) | 25% |

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies

```bash
cd affiliate-backend
npm install
```

### Step 2: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Step 3: Access the Dashboards

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

**URLs:**
- Login Page: `http://localhost:3001/login.html`
- Admin Dashboard: `http://localhost:3001/admin-dashboard.html`
- Affiliate Dashboard: `http://localhost:3001/affiliate-dashboard.html`
- Client Signup: `http://localhost:3001/client-signup.html`

## 📁 Project Structure

```
WebGemini-Portfolio/
├── affiliate-backend/
│   ├── models/
│   │   └── database.js          # SQLite database schema & helpers
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   └── affiliates.js        # Affiliate & tracking endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── package.json             # Dependencies
│   ├── server.js                # Express server
│   ├── .env                     # Environment variables
│   └── affiliate.db             # SQLite database (auto-created)
├── admin-dashboard.html         # Admin dashboard UI
├── admin-dashboard.js           # Admin dashboard logic
├── affiliate-dashboard.html     # Affiliate dashboard UI
├── affiliate-dashboard.js       # Affiliate dashboard logic
├── login.html                   # Login page
├── client-signup.html           # Client signup form
└── dashboard-style.css          # Dashboard styling
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login for admin/affiliate
- `POST /api/auth/register` - Register new affiliate
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile

### Affiliate Management
- `POST /api/affiliates/track-signup` - Track new client signup (public)
- `POST /api/affiliates/verify-coupon` - Verify coupon code (public)
- `GET /api/affiliates/stats` - Get affiliate stats (requires auth)
- `GET /api/affiliates/referrals` - Get affiliate referrals (requires auth)
- `GET /api/affiliates/admin/stats` - Get overall stats (admin only)
- `GET /api/affiliates/admin/clients` - Get all clients (admin only)
- `GET /api/affiliates/all` - Get all affiliates (admin only)

## 🎯 How It Works

### For Affiliates:
1. **Sign Up** - Create an affiliate account with a unique coupon code
2. **Share** - Share your coupon code with your audience
3. **Earn** - When clients sign up using your code, you automatically earn commissions
4. **Track** - Monitor all referrals and earnings in your dashboard

### For Clients:
1. **Visit Signup Page** - Go to the client signup form
2. **Enter Coupon Code** - Input the affiliate's coupon code (optional)
3. **Verify** - System validates the coupon code
4. **Complete Signup** - Submit the form
5. **Automatic Tracking** - Commission is automatically calculated and tracked

### For Administrators:
1. **Monitor Performance** - View all metrics in the admin dashboard
2. **Manage Affiliates** - Add new affiliates and manage existing ones
3. **Track Commissions** - See pending and paid commissions
4. **View All Clients** - Access complete client list with affiliate attribution

## 🔐 Security Features

- JWT-based authentication with secure token storage
- Password hashing using bcrypt
- Role-based access control (admin/affiliate)
- Input validation on all endpoints
- SQL injection protection via parameterized queries

## 💾 Database Schema

### Affiliates Table
- Stores affiliate information, credentials, and coupon codes
- Tracks account status and creation date

### Clients Table
- Stores client information and plan details
- Links to affiliate via coupon code

### Commissions Table
- Tracks commission calculations
- Records rate, amount, and payment status

### Referrals Table
- Detailed referral tracking
- Conversion status monitoring

## 🛠️ Configuration

Edit `affiliate-backend/.env` to configure:
- Port number
- JWT secret key
- Commission rates
- CORS settings

## 📱 Integration with Your Website

To integrate the affiliate system with your existing website:

1. **Add Signup Form** - Include the client signup form on your website
2. **Update API URLs** - Change `API_BASE_URL` in all HTML files to your production URL
3. **Customize Plans** - Modify plan types and prices in `client-signup.html`
4. **Brand Colors** - Update CSS variables in `dashboard-style.css`

## 🎨 Customization

### Changing Commission Rates
Edit the `calculateCommission` function in `affiliate-backend/routes/affiliates.js`

### Adding New Plan Types
Update the `client-signup.html` form and the `planPrices` object

### Modifying Dashboard Design
Edit `dashboard-style.css` CSS variables and styles

## 🐛 Troubleshooting

**Server won't start:**
- Check if port 3001 is already in use
- Ensure all dependencies are installed
- Verify Node.js version (v14+)

**Login not working:**
- Verify the server is running
- Check browser console for errors
- Ensure correct API_BASE_URL in HTML files

**Database errors:**
- Delete `affiliate.db` and restart server to recreate
- Check file permissions in affiliate-backend folder

## 📊 Default Admin Account

**Important:** Change the default admin password in production!

- Username: `admin`
- Password: `admin123`
- Email: `admin@webgemini.com`

To change, login and update in the database or modify `models/database.js` before first run.

## 🚦 Development vs Production

### Development
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Production
```bash
npm start
```

**Production Checklist:**
- [ ] Change JWT_SECRET in `.env`
- [ ] Update default admin password
- [ ] Update API_BASE_URL in all HTML files to production domain
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper database backups
- [ ] Review and adjust commission rates

## 📈 Future Enhancements

- Email notifications for new referrals
- Payment gateway integration
- Advanced analytics and reporting
- Multi-level affiliate programs
- Automated payout system
- Mobile app for affiliates
- Webhook integrations

## 🤝 Support

For issues or questions about the affiliate system, please contact your development team or create an issue in your project repository.

## 📄 License

This project is proprietary software for WebGemini Portfolio.

---

**Built with:** Node.js, Express.js, SQLite, JWT, and modern vanilla JavaScript

**Created:** October 2025
