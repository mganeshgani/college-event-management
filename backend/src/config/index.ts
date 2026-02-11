import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    enrollMax: parseInt(process.env.RATE_LIMIT_ENROLL_MAX || '10', 10),
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  dataRetention: {
    days: parseInt(process.env.DATA_RETENTION_DAYS || '730', 10),
  },
};

// Validate required environment variables in production
if (config.env === 'production') {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // TODO: Human review required - ensure secrets are strong and unique
  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}
