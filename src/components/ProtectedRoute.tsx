'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login page with callback URL
      const callbackUrl = encodeURIComponent(pathname || '/');
      router.push(`/login?callbackUrl=${callbackUrl}`);
    } else if (status === 'authenticated' && requiredRole) {
      // Check if user has the required role
      const userRole = session.user?.role; // You'll need to add role to your session
      if (userRole !== requiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [status, router, pathname, requiredRole, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-chocolate-brown">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
