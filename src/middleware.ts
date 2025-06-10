import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of allowed origins
const allowedOrigins = [
  'https://dishtalgia.vercel.app',
  'https://dishtalgia-v3.vercel.app',
  'http://localhost:3000',
  'http://localhost:3004',
];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  
  // Get token with secure cookie settings
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  
  // Log token for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Token in middleware:', !!token);
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
