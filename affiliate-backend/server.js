const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const affiliateRoutes = require('./routes/affiliates');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Enhanced CORS for dev environment
app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory (for dashboards)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/affiliates', affiliateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'WebGemini Affiliate API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to WebGemini Affiliate System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'GET /api/auth/verify',
        profile: 'GET /api/auth/profile'
      },
      affiliates: {
        trackSignup: 'POST /api/affiliates/track-signup',
        verifyCoupon: 'POST /api/affiliates/verify-coupon',
        getStats: 'GET /api/affiliates/stats (requires auth)',
        getReferrals: 'GET /api/affiliates/referrals (requires auth)',
        adminStats: 'GET /api/affiliates/admin/stats (admin only)',
        adminClients: 'GET /api/affiliates/admin/clients (admin only)',
        allAffiliates: 'GET /api/affiliates/all (admin only)'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   WebGemini Affiliate System API                 ║
║   Server running on http://localhost:${PORT}       ║
║                                                   ║
║   Admin Login:                                    ║
║   Username: admin                                 ║
║   Password: admin123                              ║
║                                                   ║
║   Dashboards:                                     ║
║   Admin: http://localhost:${PORT}/admin-dashboard.html  ║
║   Affiliate: http://localhost:${PORT}/affiliate-dashboard.html ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - keep server running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep server running
});

module.exports = app;
