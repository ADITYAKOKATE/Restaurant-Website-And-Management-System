import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import SiteChrome from '@/components/SiteChrome/SiteChrome';

export const metadata: Metadata = {
  title: 'Premacha Wada — Authentic Maharashtrian Street Food',
  description: 'Order the freshest, most authentic Vada Pav and street food online. Premacha Wada brings the taste of Maharashtra\'s beloved street food right to your doorstep.',
  keywords: 'vada pav, pune street food, maharashtrian street food, premacha wada, order food online',
  openGraph: {
    title: 'Premacha Wada — Authentic Maharashtrian Street Food',
    description: 'Order the freshest Vada Pav and street food online.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
