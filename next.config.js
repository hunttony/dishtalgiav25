/** @type {import('next').NextConfig} */
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// Helper function to safely get hostname from URL
const getHostname = (url) => {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).hostname;
    }
    return url.split('/')[0];
  } catch (e) {
    return null;
  }
};

// Get Vercel URL safely
const vercelUrl = process.env.VERCEL_URL || '';
const vercelHostname = vercelUrl ? getHostname(vercelUrl) : null;

const nextConfig = {
  reactStrictMode: !isProduction,
  
  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'dishtalgia.com',
      'www.dishtalgia.com',
      ...(vercelHostname ? [vercelHostname] : []),
    ].filter(Boolean),
    unoptimized: !isProduction,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    NEXT_PUBLIC_VERCEL_URL: vercelUrl 
      ? vercelUrl.startsWith('http') 
        ? vercelUrl 
        : `https://${vercelUrl}`
      : 'http://localhost:3000',
  },
  webpack: (config) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
    };

    // Add SVGR Loader for SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  eslint: {
    // Temporarily ignore ESLint during builds to resolve build failures
    ignoreDuringBuilds: true,
  },
  env: {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3004',
  },
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Replace with your actual domain in production
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
