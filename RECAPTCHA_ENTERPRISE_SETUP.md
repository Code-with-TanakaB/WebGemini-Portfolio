# reCAPTCHA Enterprise Setup Guide

## ✅ What's Been Implemented

Your system now uses **Google reCAPTCHA Enterprise** with advanced bot detection and risk scoring.

### Frontend Changes
- ✅ Updated `client-signup.html` - Uses `grecaptcha.enterprise.execute()`
- ✅ Updated `login.html` - Uses `grecaptcha.enterprise.execute()`
- ✅ Invisible verification - No checkbox, seamless UX
- ✅ Action tracking - Each form has unique action name

### Backend Changes
- ✅ New middleware: `affiliate-backend/middleware/recaptcha.js`
- ✅ Enterprise API integration with risk scoring
- ✅ Configurable score threshold (default: 0.5)
- ✅ Client caching for performance

### Actions Defined
- `client_signup` - Client registration form
- `affiliate_registration` - Affiliate registration form

---

## 🔧 Required Configuration

### 1. Google Cloud Service Account

You need to create a service account for the reCAPTCHA Enterprise API.

#### Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `webgemini-projec-1756218461977`
3. **Navigate to**: IAM & Admin → Service Accounts
4. **Create Service Account**:
   - Name: `recaptcha-enterprise-verifier`
   - Role: `reCAPTCHA Enterprise Agent`
5. **Create Key**:
   - Click on the service account
   - Go to "Keys" tab
   - Add Key → Create new key → JSON
   - Download the JSON file

### 2. Deploy to Render

Add these environment variables to your Render backend:

```bash
# Required
RECAPTCHA_PROJECT_ID=webgemini-projec-1756218461977
RECAPTCHA_SITE_KEY=6Lf7BgksAAAAAPPByVV0JbmaoV74W4Io0RFNt0Vr
RECAPTCHA_MINIMUM_SCORE=0.5

# Service Account Authentication
# Copy the values from your downloaded JSON file:
GOOGLE_CLOUD_PROJECT=webgemini-projec-1756218461977
GOOGLE_CLOUD_CLIENT_EMAIL=<from JSON file>
GOOGLE_CLOUD_PRIVATE_KEY=<from JSON file - keep the \n characters>
```

**Important**: When adding `GOOGLE_CLOUD_PRIVATE_KEY`:
- Copy the entire value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters as-is
- Render will handle the quotes automatically

### 3. Alternative: Upload JSON File

If you prefer, you can upload the service account JSON file:

1. Upload to Render using Render's file upload feature
2. Set environment variable:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/opt/render/project/src/service-account-key.json
   ```

---

## 📊 How Risk Scoring Works

reCAPTCHA Enterprise returns a **risk score** from 0.0 to 1.0:

- **1.0** = Very likely legitimate user
- **0.5** = Neutral (default threshold)
- **0.0** = Very likely a bot

### Current Configuration
- **Minimum Score**: 0.5 (configurable via `RECAPTCHA_MINIMUM_SCORE`)
- **Action**: Requests below threshold are rejected
- **Logging**: All scores are logged for monitoring

### Adjusting Threshold

Too many false positives? Lower the threshold:
```bash
RECAPTCHA_MINIMUM_SCORE=0.3  # More permissive
```

Too many bots getting through? Raise it:
```bash
RECAPTCHA_MINIMUM_SCORE=0.7  # More strict
```

---

## 🧪 Testing

### Development Mode
If `RECAPTCHA_PROJECT_ID` is not set, verification is skipped with a warning.

### Production Testing
1. Submit a form on your site
2. Check backend logs on Render:
   ```
   ✅ reCAPTCHA score: 0.9 (action: client_signup)
   ✅ reCAPTCHA verified successfully (score: 0.9)
   ```

### View Assessments in Google Cloud
1. Go to: https://console.cloud.google.com/security/recaptcha
2. Select your site key
3. View analytics and individual assessments

---

## 🔍 Monitoring & Analytics

### Backend Logs
Every verification is logged with:
- Score
- Action name
- Risk reasons (if any)
- Success/failure

### Google Cloud Console
View comprehensive metrics:
- Score distribution
- Action breakdown
- Bot detection reasons
- Geographic patterns

---

## 🚨 Troubleshooting

### "RECAPTCHA_PROJECT_ID not set"
- **Cause**: Missing environment variable
- **Fix**: Add `RECAPTCHA_PROJECT_ID` to Render

### "Permission denied" or API errors
- **Cause**: Service account not configured or missing permissions
- **Fix**: 
  1. Verify service account has "reCAPTCHA Enterprise Agent" role
  2. Check environment variables are set correctly
  3. Ensure private key includes `\n` characters

### "Invalid token" errors
- **Cause**: Token expired or site key mismatch
- **Fix**: Tokens expire after ~2 minutes, ensure immediate submission

### Low scores for legitimate users
- **Cause**: New site, aggressive scoring
- **Fix**: Lower `RECAPTCHA_MINIMUM_SCORE` to 0.3-0.4
- **Wait**: Scores improve as reCAPTCHA learns your traffic patterns

---

## 📚 Resources

- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Interpreting Assessment](https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment)
- [Best Practices](https://cloud.google.com/recaptcha-enterprise/docs/best-practices)

---

## 🎯 Next Steps

1. ✅ Create Google Cloud service account
2. ✅ Download JSON key file
3. ✅ Add environment variables to Render
4. ✅ Redeploy backend
5. ✅ Test both signup forms
6. ✅ Monitor scores in Google Cloud Console
7. ✅ Adjust threshold if needed

**Your reCAPTCHA Enterprise implementation is ready!** 🚀
