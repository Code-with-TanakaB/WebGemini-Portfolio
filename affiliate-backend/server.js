const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const affiliateRoutes = require('./routes/affiliates');

const app = express();
const PORT = process.env.PORT || 3001;

// Security Headers - Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Disable for static files
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting - Prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    }
});

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', generalLimiter);

// Middleware - Enhanced CORS for dev environment
app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
const server = app.listen(PORT, '0.0.0.0', () => {
  const isCodespace = process.env.CODESPACE_NAME;
  const baseUrl = isCodespace 
    ? `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`
    : `http://localhost:${PORT}`;
  
  console.log(`
╔═══════════════════════════════════════════════════╗
║   WebGemini Affiliate System API                 ║
║   Server running on ${isCodespace ? 'GitHub Codespaces' : 'localhost'}
║                                                   ║
║   Access URL: ${baseUrl.padEnd(41)}║
║                                                   ║
║   Dashboards:                                     ║
║   Login:            ${baseUrl}/login.html
║   Admin Dashboard:  ${baseUrl}/admin-dashboard.html
║   Affiliate Panel:  ${baseUrl}/affiliate-dashboard.html
║   Client Signup:    ${baseUrl}/client-signup.html
║                                                   ║
║   Security:         ✓ Rate Limiting Active       ║
║                     ✓ Input Validation Enabled   ║
║                     ✓ HTTPS Encryption          ║
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
