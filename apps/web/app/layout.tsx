import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'PEPO - Give Freely. Live Lightly.',
  description: 'Community-based giving and sharing platform promoting generosity, fairness, and dignity',
  keywords: 'giving, sharing, community, charity, giveaway, free items',
  openGraph: {
    title: 'PEPO - Give Freely. Live Lightly.',
    description: 'Community-based giving and sharing platform promoting generosity, fairness, and dignity',
    url: 'https://pepo.app',
    siteName: 'PEPO',
    images: [
      {
        url: 'https://pepo.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PEPO - Give Freely. Live Lightly.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pepoapp',
    title: 'PEPO - Give Freely. Live Lightly.',
    description: 'Community-based giving and sharing platform promoting generosity, fairness, and dignity',
    images: ['https://pepo.app/og-image.png'],
  },
  alternates: {
    canonical: 'https://pepo.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-background-default flex flex-col min-h-screen`}>
        <ErrorBoundary>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}

