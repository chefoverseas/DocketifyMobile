/**
 * Environment Variable Validation for Production Deployment
 * Ensures all required environment variables are present and valid
 */

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production';
  PORT: number;
  DATABASE_URL: string;
  SESSION_SECRET: string;
  SENDGRID_API_KEY: string;
  REPL_ID?: string;
  REPLIT_DOMAINS?: string;
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];

  // Required environment variables
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  };

  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv || !['development', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be either "development" or "production"');
  }

  // Validate PORT
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1000 || port > 65535) {
    errors.push('PORT must be a valid number between 1000 and 65535');
  }

  // Validate DATABASE_URL format
  if (requiredVars.DATABASE_URL && !requiredVars.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql://');
  }

  // Validate SESSION_SECRET strength
  if (requiredVars.SESSION_SECRET && requiredVars.SESSION_SECRET.length < 32) {
    errors.push('SESSION_SECRET must be at least 32 characters long for security');
  }

  // Validate SendGrid API key format
  if (requiredVars.SENDGRID_API_KEY && !requiredVars.SENDGRID_API_KEY.startsWith('SG.')) {
    errors.push('SENDGRID_API_KEY must be a valid SendGrid API key starting with "SG."');
  }

  if (errors.length > 0) {
    throw new EnvironmentValidationError(
      `Environment validation failed:\n${errors.map(err => `  - ${err}`).join('\n')}`
    );
  }

  return {
    NODE_ENV: nodeEnv as 'development' | 'production',
    PORT: port,
    DATABASE_URL: requiredVars.DATABASE_URL!,
    SESSION_SECRET: requiredVars.SESSION_SECRET!,
    SENDGRID_API_KEY: requiredVars.SENDGRID_API_KEY!,
    REPL_ID: process.env.REPL_ID,
    REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
  };
}

export function logEnvironmentInfo(config: EnvironmentConfig): void {
  console.log('🔧 Environment Configuration:');
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   DATABASE: ${config.DATABASE_URL.includes('localhost') ? 'Local PostgreSQL' : 'Remote PostgreSQL'}`);
  console.log(`   SESSION_SECRET: ${config.SESSION_SECRET.length} characters`);
  console.log(`   SENDGRID: ${config.SENDGRID_API_KEY ? 'Configured' : 'Not configured'}`);
  
  if (config.REPL_ID) {
    console.log(`   REPLIT: ${config.REPL_ID}`);
  }
  
  if (config.NODE_ENV === 'production') {
    console.log('🚀 Production mode enabled');
    console.log('   - HTTPS redirects enabled');
    console.log('   - Security headers active');
    console.log('   - Email sending enabled');
    console.log('   - Static file serving optimized');
  } else {
    console.log('🛠️  Development mode enabled');
    console.log('   - Hot reload active');
    console.log('   - Console OTP logging');
    console.log('   - Development tools available');
  }
}