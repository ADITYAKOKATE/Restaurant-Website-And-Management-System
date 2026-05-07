import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import SiteChrome from '@/components/SiteChrome/SiteChrome';

export const metadata: Metadata = {
  title: 'Premacha Wada — Authentic Maharashtrian Restaurant',
  description: 'Order the freshest, most authentic dishes and Maharashtrian cuisine online. Premacha Wada brings the taste of Maharashtra\'s beloved flavors right to your doorstep.',
  keywords: 'vada pav, pune restaurant, maharashtrian cuisine, premacha wada, order food online',
  openGraph: {
    title: 'Premacha Wada — Authentic Maharashtrian Restaurant',
    description: 'Order the freshest, most authentic dishes and Maharashtrian cuisine online',
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
