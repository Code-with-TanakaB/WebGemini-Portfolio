/**
 * Test reCAPTCHA Enterprise Middleware
 * Run: node test-recaptcha-enterprise.js
 */

const { createAssessment } = require('./middleware/recaptcha');

console.log('🧪 Testing reCAPTCHA Enterprise Integration\n');

// Test with mock data
const testAssessment = async () => {
  try {
    console.log('Testing createAssessment function...\n');
    
    // This will fail because we don't have valid credentials yet
    // But it will show us if the code is structured correctly
    const result = await createAssessment({
      projectID: 'webgemini-projec-1756218461977',
      recaptchaKey: '6Lf7BgksAAAAAPPByVV0JbmaoV74W4Io0RFNt0Vr',
      token: 'test-token-12345',
      recaptchaAction: 'test_action'
    });
    
    console.log('✅ Assessment result:', result);
  } catch (error) {
    console.log('⚠️  Expected error (no credentials configured yet):');
    console.log('   ', error.message);
    console.log('\n📝 This is normal! Add service account credentials to fix.\n');
  }
};

// Test environment variable check
console.log('📋 Environment Variables:');
console.log('   RECAPTCHA_PROJECT_ID:', process.env.RECAPTCHA_PROJECT_ID || '❌ Not set');
console.log('   RECAPTCHA_SITE_KEY:', process.env.RECAPTCHA_SITE_KEY || '❌ Not set');
console.log('   RECAPTCHA_MINIMUM_SCORE:', process.env.RECAPTCHA_MINIMUM_SCORE || '0.5 (default)');
console.log('   GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT || '❌ Not set');
console.log('   GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || '❌ Not set');
console.log();

testAssessment();
