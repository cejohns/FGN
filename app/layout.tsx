import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../src/index.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FireStar Gaming Network - Gaming News, Reviews & Guides',
  description:
    'Your ultimate destination for gaming news, reviews, guides, and the latest game releases.',
  keywords: ['gaming', 'news', 'reviews', 'guides', 'video games', 'game releases'],
  authors: [{ name: 'FireStar Gaming Network' }],
  openGraph: {
    title: 'FireStar Gaming Network',
    description:
      'Your ultimate destination for gaming news, reviews, guides, and the latest game releases.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FireStar Gaming Network',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FireStar Gaming Network',
    description:
      'Your ultimate destination for gaming news, reviews, guides, and the latest game releases.',
  },
  verification: {
    google: 'G-XZS21FDCRR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
