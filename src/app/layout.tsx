
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
  keywords: ['RO Parts', 'Reverse Osmosis', 'Water Purifier Spares', 'RO Membrane', 'RO Filter', 'RO Pump'],
  authors: [{ name: 'RoParts Hub' }],
  creator: 'RoParts Hub',
  publisher: 'RoParts Hub',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: en.metadata.title,
    description: en.metadata.description,
    siteName: 'RoParts Hub',
     images: [
      {
        url: '/og-image.png', // A default OG image for the site
        width: 1200,
        height: 630,
        alt: 'RoParts Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: en.metadata.title,
    description: en.metadata.description,
    images: ['/og-image.png'], 
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${siteUrl}/site.webmanifest`,
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
