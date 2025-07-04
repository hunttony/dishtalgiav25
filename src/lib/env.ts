// Environment variable validation
// This ensures all required environment variables are set when the app starts

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Define base required environment variables
const baseRequiredVars = [
  'NEXTAUTH_SECRET',
  'MONGODB_URI',
  'MONGODB_DB'
] as const;

// Add production-only required variables
const productionRequiredVars = [
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_SITE_URL'
] as const;

// Combine required variables based on environment
const requiredEnvVars = [
  ...baseRequiredVars,
  ...(isProduction ? productionRequiredVars : [])
] as const;

// Type-safe environment variables
export const env = {
  // Core
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: isProduction,
  IS_VERCEL: isVercel,
  
  // Auth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || (isVercel 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'),
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  
  // Public
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (isVercel
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'),
} as const;

// Validate environment variables on startup
export function validateEnv() {
  if (process.env.NEXT_PHASE !== 'phase-production-build' && process.env.NODE_ENV !== 'test') {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
      console.warn('Warning: NEXTAUTH_SECRET is not set or is too short. Please set a strong secret.');
    }
  }
}

// Validate environment immediately when this module is imported
if (typeof window === 'undefined') {
  validateEnv();
}

// Export a type that can be used for type checking
export type Env = typeof env;
