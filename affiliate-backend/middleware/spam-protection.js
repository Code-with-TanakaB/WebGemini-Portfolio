/**
 * Simple Spam Protection Middleware
 * Uses honeypot fields and time-based checks (no external services needed)
 * 
 * How it works:
 * 1. Honeypot field - Hidden field that bots fill but humans don't
 * 2. Time check - Forms filled too quickly are likely bots
 * 3. Rate limiting - Already implemented in server.js
 */

const spamProtection = (req, res, next) => {
  // Check honeypot field (should be empty if human)
  const honeypot = req.body.website || req.body.url || req.body.company_website;
  
  if (honeypot && honeypot.trim() !== '') {
    console.warn('🚫 Spam detected: Honeypot field filled');
    // Don't tell the bot what went wrong
    return res.status(400).json({
      success: false,
      message: 'Please try again.'
    });
  }

  // Check if form was filled too quickly (less than 3 seconds = likely bot)
  const formStartTime = req.body.form_start_time;
  if (formStartTime) {
    const timeSpent = Date.now() - parseInt(formStartTime);
    if (timeSpent < 3000) { // Less than 3 seconds
      console.warn('🚫 Spam detected: Form filled too quickly');
      return res.status(400).json({
        success: false,
        message: 'Please take your time filling out the form.'
      });
    }
  }

  // All checks passed
  console.log('✅ Spam protection: Request appears legitimate');
  next();
};

module.exports = { spamProtection };
