import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Overclock Mesh",
  description: "A sovereign DePIN layer for fractional GPU/CPU cluster leasing",
};

import { Providers } from './providers';
import Offer18Interceptor from '@/components/Offer18Interceptor';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Offer18Interceptor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
