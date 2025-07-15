
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

// Using default 'en' translations for base metadata
export const metadata: Metadata = {
  title: en.metadata.title,
  description: en.metadata.description,
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
