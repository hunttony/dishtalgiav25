import type { Metadata } from 'next';
import { Playfair_Display, Open_Sans } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

// These are server-side only
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${openSans.variable}`}>
      <body 
        className="min-h-screen flex flex-col bg-cream-beige text-chocolate-brown"
        suppressHydrationWarning={true}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
