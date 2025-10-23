# Security Features - WebGemini Affiliate System

## Overview
This document outlines the security measures implemented in the WebGemini Affiliate System to protect customer data and prevent unauthorized access.

## Security Features Implemented

### 1. **Password Protection**
- **Bcrypt Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **No Plain Text Storage**: Passwords are never stored in plain text
- **Strong Password Requirements**: Minimum 8 characters for registration, 6 for login
- **Hash Comparison**: Secure password verification using bcrypt.compareSync()

### 2. **Authentication & Authorization**
- **JWT Tokens**: JSON Web Tokens for stateless authentication
- **Token Expiration**: 24-hour expiration on all tokens
- **Role-Based Access Control (RBAC)**: Separate permissions for admin and affiliates
- **Protected Routes**: Middleware verification on all sensitive endpoints

### 3. **Rate Limiting (Brute Force Protection)**
- **Login Rate Limit**: Maximum 10 attempts per IP every 15 minutes
- **Register Rate Limit**: Maximum 10 attempts per IP every 15 minutes
- **General API Rate Limit**: Maximum 100 requests per IP every 15 minutes
- **Automatic Lockout**: IP addresses are temporarily blocked after exceeding limits

### 4. **Input Validation & Sanitization**
- **express-validator**: Server-side validation for all user inputs
- **Email Validation**: RFC-compliant email format checking
- **Length Restrictions**: Enforced min/max lengths on all text fields
- **Alphanumeric Enforcement**: Coupon codes restricted to alphanumeric characters
- **XSS Prevention**: HTML tag stripping from user inputs
- **Type Validation**: Strict type checking for numerical values

### 5. **Security Headers (Helmet.js)**
- **X-DNS-Prefetch-Control**: Controls browser DNS prefetching
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **X-XSS-Protection**: Enables XSS filter in browsers

### 6. **HTTPS/TLS Encryption**
- **GitHub Codespaces**: Automatic HTTPS on all connections
- **Encrypted Data Transmission**: All API calls encrypted in transit
- **Secure Cookies**: Can be enabled for production with secure flag

### 7. **Data Protection**
- **Request Size Limits**: 10KB limit on JSON/URL-encoded payloads
- **CORS Configuration**: Controlled cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries via SQLite3
- **Error Handling**: Generic error messages (no sensitive data leakage)

### 8. **Database Security**
- **Prepared Statements**: All database queries use parameterized statements
- **Unique Constraints**: Email, username, and coupon codes enforced as unique
- **Foreign Key Constraints**: Data integrity through relationships
- **Transaction Support**: Atomic operations for commission calculations

## Security Best Practices

### For Development:
- ✅ Use environment variables for sensitive data
- ✅ Keep dependencies updated
- ✅ Never commit `.env` files to version control
- ✅ Use strong default admin credentials (change immediately)

### For Production:
- 🔒 Change default admin password immediately
- 🔒 Enable HTTPS only (disable HTTP)
- 🔒 Use environment-specific CORS settings
- 🔒 Set NODE_ENV=production
- 🔒 Implement database backups
- 🔒 Monitor rate limit logs
- 🔒 Use secure session management
- 🔒 Enable audit logging

## Validation Rules

### Login:
- **Username**: 3-50 characters
- **Password**: Minimum 6 characters

### Registration:
- **Username**: 3-50 characters, required
- **Email**: Valid email format, normalized
- **Password**: Minimum 8 characters, required
- **Full Name**: 2-100 characters, required
- **Coupon Code**: 3-20 alphanumeric characters, required

### Client Signup:
- **Name**: 2-100 characters, required
- **Email**: Valid email format, normalized, required
- **Phone**: 10-20 characters, optional
- **Plan Type**: Non-empty string, required
- **Plan Price**: Positive number, required
- **Coupon Code**: Up to 20 alphanumeric characters, optional

## Rate Limits

| Endpoint | Limit | Window | Action |
|----------|-------|--------|--------|
| `/api/auth/login` | 10 requests | 15 minutes | Block IP temporarily |
| `/api/auth/register` | 10 requests | 15 minutes | Block IP temporarily |
| `/api/*` (all other) | 100 requests | 15 minutes | Block IP temporarily |

## Security Monitoring

### Logs to Monitor:
- Failed login attempts
- Rate limit violations
- Validation errors
- Database errors
- Unusual access patterns

### Recommended Actions:
1. Review logs daily
2. Set up alerts for suspicious activity
3. Rotate JWT secrets periodically
4. Audit user accounts regularly
5. Update dependencies monthly

## Incident Response

If a security breach is detected:
1. **Isolate**: Disable affected accounts immediately
2. **Investigate**: Review logs to identify the breach source
3. **Notify**: Inform affected users
4. **Patch**: Fix the vulnerability
5. **Monitor**: Increase monitoring for 30 days
6. **Document**: Record incident details and response

## Dependencies & Versions

- `bcryptjs`: ^2.4.3 - Password hashing
- `jsonwebtoken`: ^9.0.2 - JWT authentication
- `helmet`: Latest - Security headers
- `express-rate-limit`: Latest - Rate limiting
- `express-validator`: Latest - Input validation
- `cors`: ^2.8.5 - CORS management

## Compliance Notes

This system implements security measures aligned with:
- OWASP Top 10 security risks
- General Data Protection Regulation (GDPR) principles
- Payment Card Industry Data Security Standard (PCI DSS) guidelines

## Support

For security concerns or to report vulnerabilities, please contact the development team immediately.

**Last Updated**: October 23, 2025
