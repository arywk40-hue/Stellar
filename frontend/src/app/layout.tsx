import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GeoLedger - Transparent Blockchain Donations',
  description: 'Track your donations on the blockchain with full transparency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`light ${inter.className}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
