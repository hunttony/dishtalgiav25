import type { Metadata } from 'next';
import { Playfair_Display, Open_Sans } from 'next/font/google';
import { CartProvider } from '../contexts/CartContext';
import { PayPalProvider } from '../providers/PayPalProvider';
import { SessionProvider } from '../providers/SessionProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BrowserExtensionHandler } from '../components/BrowserExtensionHandler';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dishtalgia | Southern Banana Pudding',
  description: 'Indulge in our creamy, dreamy banana puddings crafted with Southern love. Order Original, Bananas Foster, or Mississippi Mud Pudding today!',
};

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
  display: 'swap',
});

// Create a client component for handling browser extension attributes
function ClientBody({ children }: { children: React.ReactNode }) {
  'use client';

  return (
    <>
      <BrowserExtensionHandler />
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${openSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream-beige text-chocolate-brown">
        <ClientBody>
          <SessionProvider>
            <CartProvider>
              <PayPalProvider>
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </PayPalProvider>
            </CartProvider>
          </SessionProvider>
        </ClientBody>
      </body>
    </html>
  );
}
