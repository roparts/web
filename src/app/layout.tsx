
import type { Metadata } from 'next';
import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from '@/context/LanguageContext';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

// Using default 'en' translations for base metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: en.metadata.title,
    template: `%s | RoParts Hub`,
  },
  description: en.metadata.description,
  keywords: [
    'RO Parts', 'Reverse Osmosis', 'Water Purifier Spares', 'RO Membrane',
    'RO Filter', 'RO Pump', 'Water Filter Spares India', 'Domestic RO Parts',
    'Commercial RO Parts', 'AquaPure', 'Kent RO Spares', 'RO Accessories'
  ],
  authors: [{ name: 'RoParts Hub' }],
  creator: 'RoParts Hub',
  publisher: 'RoParts Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'hi-IN': '/hi',
    },
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: en.metadata.title,
    description: en.metadata.description,
    siteName: 'RoParts Hub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RoParts Hub - Best RO Spare Parts in India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: en.metadata.title,
    description: en.metadata.description,
    images: ['/og-image.png'],
    creator: '@ropartshub',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  manifest: `/site.webmanifest`,
  verification: {
    google: 'google-site-verification-id', // Placeholder - user should replace with actual ID
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <LanguageProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
