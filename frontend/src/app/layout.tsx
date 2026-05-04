import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export const metadata: Metadata = {
  title: 'Premacha Vada — Authentic Maharashtrian Street Food',
  description: 'Order the freshest, most authentic Vada Pav and street food online. Premacha Vada brings the taste of Maharashtra\'s beloved street food right to your doorstep.',
  keywords: 'vada pav, pune street food, maharashtrian street food, premacha vada, order food online',
  openGraph: {
    title: 'Premacha Vada — Authentic Maharashtrian Street Food',
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
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main style={{ minHeight: '100vh' }}>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
