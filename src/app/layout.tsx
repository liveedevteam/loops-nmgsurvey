/**
 * Root Layout
 * 
 * Main layout component that wraps all pages.
 * Includes providers for LIFF, tRPC, and toast notifications.
 */

import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { LiffProvider } from '@/components/LiffProvider';
import './globals.css';

// Using Outfit font for a modern, premium feel
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Customer Survey | Get Your Exclusive Coupon',
  description: 'Complete our quick 5-step survey and receive an exclusive discount coupon.',
  robots: 'noindex, nofollow', // Private survey
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        {/* Prevent zoom on iOS when focusing inputs */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        <TRPCProvider>
          <LiffProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#0D9488',
                  color: '#fff',
                  border: 'none',
                },
              }}
            />
          </LiffProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
