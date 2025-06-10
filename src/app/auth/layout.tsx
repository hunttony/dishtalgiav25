import type { Metadata } from 'next';
import { Playfair_Display, Open_Sans } from 'next/font/google';
import { SessionProvider } from '../../providers/SessionProvider';

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

export const metadata: Metadata = {
  title: 'Dishtalgia - Authentication',
  description: 'Login or register to access your account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${playfair.variable} ${openSans.variable}`}>
      <div className="min-h-screen bg-cream-beige text-chocolate-brown">
        <SessionProvider>
          {children}
        </SessionProvider>
      </div>
    </div>
  );
}
