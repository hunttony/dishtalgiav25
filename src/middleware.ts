import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of allowed origins
const allowedOrigins = [
  'https://dishtalgia.vercel.app',
  'http://localhost:3000',
  // Add other domains as needed
];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const token = await getToken({ req: request });
  
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
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access auth routes, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', origin));
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
