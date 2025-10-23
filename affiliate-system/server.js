const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const affiliateRoutes = require('./routes/affiliate.routes');
const referralRoutes = require('./routes/referral.routes');
const adminRoutes = require('./routes/admin.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3000", "https://cdn.jsdelivr.net"]
        }
    }
}));
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');

// Replace the previous app.use(cors(...)) call with a dynamic header middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // allow requests with no origin (curl, mobile, same-origin)
    if (!origin) return next();

    if (allowedOrigins.indexOf(origin) !== -1) {
        // Echo the Origin instead of using "*" so credentials can be sent
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        // ensure caches vary by Origin
        res.header('Vary', 'Origin');
    } else {
        console.warn('CORS blocked for origin:', origin);
    }

    // Preflight
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Debug middleware: logs origin and incoming cookies for troubleshooting
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[CORS DEBUG] ${req.method} ${req.originalUrl} origin=${req.headers.origin} cookies=${req.headers.cookie || '<none>'}`);
    }
    next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static files from public directory FIRST (before API routes)
app.use(express.static('public'));

// Rate limiting (only for API routes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Root redirect to admin dashboard
app.get('/', (req, res) => {
    res.redirect('/admin-dashboard.html');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'WebGemini Affiliate System is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WebGemini Affiliate System running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

// (frontend)
fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include', // required to send/receive cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

// when setting cookie/session after successful login:
res.cookie('sid', sessionId, {
    httpOnly: true,
    sameSite: 'none', // required for cross-site cookies
    secure: process.env.NODE_ENV === 'production', // true in prod (HTTPS), false for local dev
    maxAge: 7 * 24 * 60 * 60 * 1000
});
res.json({ success: true });

module.exports = app;
