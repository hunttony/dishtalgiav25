import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });
  
  // Protected routes
  const protectedRoutes = ['/account', '/checkout', '/orders'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Auth routes
  const authRoutes = ['/login', '/auth/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access auth routes, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
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
