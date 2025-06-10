import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/auth/register',
  '/forgot-password',
  '/products',
  '/about',
  '/contact',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
];

// Check if the path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

// List of allowed origins
const allowedOrigins = [
  'https://dishtalgia.vercel.app',
  'https://dishtalgia-v3.vercel.app',
  'http://localhost:3000',
  'http://localhost:3004',
];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  
  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Get token with secure cookie settings
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  
  // Log token for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', pathname, '| Authenticated:', !!token);
  }
  
  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const requestOrigin = request.headers.get('origin');
    const response = NextResponse.next();
    
    // Set CORS headers
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200, 
        headers: Object.fromEntries(response.headers) 
      });
    }

    // Protect API routes that require authentication
    if (pathname.startsWith('/api/account') || pathname.startsWith('/api/admin')) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return response;
  }
  
  // Protected routes
  const protectedRoutes = ['/account', '/checkout', '/orders'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Auth routes
  const authRoutes = ['/login', '/auth/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', origin);
    // Only set callbackUrl if it's not already set to prevent redirect loops
    if (pathname !== '/login' && !pathname.startsWith('/auth/')) {
      url.searchParams.set('callbackUrl', pathname);
    }
    const response = NextResponse.redirect(url);
    // Ensure cookies are properly set for the redirect
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('X-Auth-Required', 'true');
    return response;
  }

  // If user is authenticated and tries to access auth routes, redirect to home or callback URL
  if (isAuthRoute && token) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl && !callbackUrl.startsWith('/auth/') 
      ? new URL(callbackUrl, origin).toString()
      : new URL('/', origin).toString();
    
    const response = NextResponse.redirect(new URL(redirectUrl, origin));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images|sw.js|workbox-*.js).*)',
  ],
};
