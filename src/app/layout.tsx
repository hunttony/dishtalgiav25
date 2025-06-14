import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Open_Sans } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import ClientLayout from './ClientLayout';
import { generateJsonLd } from '@/lib/seo';
import Script from 'next/script';
import './globals.css';

// These are server-side only
export const metadata: Metadata = {
  title: 'Dishtalgia | Southern Banana Pudding',
  description: 'Indulge in our creamy, dreamy banana puddings crafted with Southern love. Order Original, Bananas Foster, or Mississippi Mud Pudding today!',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dishtalgia.com'),
  applicationName: 'Dishtalgia',
  authors: [{ name: 'Dishtalgia' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'banana pudding', 'Southern desserts', 'Houston desserts', 'Dishtalgia', 
    'Original pudding', 'Bananas Foster', 'Mississippi Mud', 'homemade pudding',
    'dessert delivery', 'best banana pudding'
  ],
  creator: 'Dishtalgia',
  publisher: 'Dishtalgia',
  formatDetection: {
    email: true,
    address: false,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Dishtalgia',
    title: 'Dishtalgia | Southern Banana Pudding',
    description: 'Indulge in our creamy, dreamy banana puddings crafted with Southern love.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dishtalgia - Southern Banana Pudding',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dishtalgia | Southern Banana Pudding',
    description: 'Indulge in our creamy, dreamy banana puddings crafted with Southern love.',
    images: ['/images/og-image.jpg'],
    creator: '@dishtalgia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5dc' }, // cream-beige
    { media: '(prefers-color-scheme: dark)', color: '#3e2723' },  // chocolate-brown
  ],
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

// Generate JSON-LD for the website
const jsonLd = generateJsonLd('website', {});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the session on the server side
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en" className={`${playfair.variable} ${openSans.variable}`}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Favicons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/hero-bg.jpg" as="image" />
      </head>
      <body 
        className="min-h-screen flex flex-col bg-cream-beige text-chocolate-brown"
        suppressHydrationWarning={true}
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <ClientLayout session={session}>
          {children}
        </ClientLayout>
        
        {/* Google Analytics - Add your measurement ID */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
