const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

/**
 * reCAPTCHA Enterprise Verification Middleware
 * Verifies Google reCAPTCHA Enterprise token and provides risk analysis
 * 
 * Usage: Add this middleware to routes that need reCAPTCHA protection
 * Example: router.post('/signup', verifyRecaptcha, (req, res) => { ... })
 */

// Cache the client for better performance (recommended by Google)
let recaptchaClient = null;

function getRecaptchaClient() {
  if (!recaptchaClient) {
    recaptchaClient = new RecaptchaEnterpriseServiceClient();
  }
  return recaptchaClient;
}

/**
 * Create an assessment to analyze the risk of a UI action
 */
async function createAssessment({
  projectID,
  recaptchaKey,
  token,
  recaptchaAction,
}) {
  const client = getRecaptchaClient();
  const projectPath = client.projectPath(projectID);

  // Build the assessment request
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  try {
    const [response] = await client.createAssessment(request);

    // Check if the token is valid
    if (!response.tokenProperties.valid) {
      console.log(`❌ reCAPTCHA token invalid: ${response.tokenProperties.invalidReason}`);
      return {
        valid: false,
        reason: response.tokenProperties.invalidReason,
        score: 0
      };
    }

    // Check if the expected action was executed
    if (response.tokenProperties.action === recaptchaAction) {
      const score = response.riskAnalysis.score;
      console.log(`✅ reCAPTCHA score: ${score} (action: ${recaptchaAction})`);
      
      // Log any risk reasons
      if (response.riskAnalysis.reasons && response.riskAnalysis.reasons.length > 0) {
        console.log('Risk factors:', response.riskAnalysis.reasons);
      }

      return {
        valid: true,
        score: score,
        reasons: response.riskAnalysis.reasons || []
      };
    } else {
      console.log(`❌ Action mismatch: expected '${recaptchaAction}', got '${response.tokenProperties.action}'`);
      return {
        valid: false,
        reason: 'ACTION_MISMATCH',
        score: 0
      };
    }
  } catch (error) {
    console.error('reCAPTCHA Enterprise API error:', error.message);
    throw error;
  }
}

const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body.recaptcha_token;
  const recaptchaAction = req.body.recaptcha_action || 'submit_form';
  
  // Skip verification in development if project ID is not set
  if (!process.env.RECAPTCHA_PROJECT_ID) {
    console.warn('⚠️  RECAPTCHA_PROJECT_ID not set - skipping verification (development mode)');
    return next();
  }

  // Check if token exists
  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification required. Please complete the CAPTCHA.'
    });
  }

  try {
    // Create assessment with reCAPTCHA Enterprise
    const assessment = await createAssessment({
      projectID: process.env.RECAPTCHA_PROJECT_ID,
      recaptchaKey: process.env.RECAPTCHA_SITE_KEY,
      token: recaptchaToken,
      recaptchaAction: recaptchaAction
    });

    // Check if assessment is valid
    if (!assessment.valid) {
      console.error('reCAPTCHA verification failed:', assessment.reason);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
        reason: assessment.reason
      });
    }

    // Check risk score (scores range from 0.0 to 1.0, higher is less risky)
    // Recommended: Reject if score < 0.5 for sensitive actions
    const MINIMUM_SCORE = parseFloat(process.env.RECAPTCHA_MINIMUM_SCORE || '0.5');
    
    if (assessment.score < MINIMUM_SCORE) {
      console.warn(`⚠️  Low reCAPTCHA score: ${assessment.score} (minimum: ${MINIMUM_SCORE})`);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Suspicious activity detected.',
        score: assessment.score
      });
    }

    // Verification successful, attach score to request for logging
    req.recaptchaScore = assessment.score;
    console.log('✅ reCAPTCHA verified successfully (score:', assessment.score, ')');
    next();

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error.message);
    
    // In production, fail closed (reject on error)
    // In development, you might want to fail open (allow on error)
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        message: 'reCAPTCHA verification error. Please try again.'
      });
    } else {
      // Development: Log warning but allow request
      console.warn('⚠️  reCAPTCHA verification error in development mode - allowing request');
      next();
    }
  }
};

module.exports = { verifyRecaptcha, createAssessment };
