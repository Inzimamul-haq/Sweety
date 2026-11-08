import rateLimit from 'express-rate-limit';

function createLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({
        error: {
          message: options.message,
          field: null,
        },
      });
    },
    message,
  });
}

// Login & Signup: 20 requests per 10 minutes
export const authRateLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'Too many authentication attempts. Please try again after 10 minutes.',
});

// Doctor access code verification: 5 attempts per 1 minute per IP
export const doctorCodeRateLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  message: 'Too many access code attempts. Please wait a minute and try again.',
});

// Add reading: 30 requests per 2 minutes
export const addReadingRateLimiter = createLimiter({
  windowMs: 2 * 60 * 1000,
  limit: 30,
  message: 'Too many reading submissions. Please try again after 2 minutes.',
});

// Profile & Password & Account deletion: 15 requests per 10 minutes
export const profileRateLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  message: 'Too many profile update requests. Please try again after 10 minutes.',
});
