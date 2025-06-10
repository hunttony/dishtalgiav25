'use client';

import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { CartProvider } from '../contexts/CartContext';
import { PayPalProvider } from '../providers/PayPalProvider';
import { SessionProvider } from '../providers/SessionProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BrowserExtensionHandler } from '../components/BrowserExtensionHandler';

interface ClientLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <BrowserExtensionHandler />
      {children}
    </>
  );
}

export default function ClientLayout({
  children,
  session,
}: ClientLayoutProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <PayPalProvider>
          <ClientBody>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ClientBody>
        </PayPalProvider>
      </CartProvider>
    </SessionProvider>
  );
}
