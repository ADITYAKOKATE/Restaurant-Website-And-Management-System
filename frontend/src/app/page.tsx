import Hero from '@/components/Home/Hero/Hero';
import TrustStats from '@/components/Home/TrustStats/TrustStats';
import FeaturedDishes from '@/components/Home/FeaturedDishes/FeaturedDishes';
import About from '@/components/Home/About/About';
import MenuCategories from '@/components/Home/MenuCategories/MenuCategories';
import Offers from '@/components/Home/Offers/Offers';
import WhyChooseUs from '@/components/Home/WhyChooseUs/WhyChooseUs';
import Gallery from '@/components/Home/Gallery/Gallery';
import GoogleReviews from '@/components/Home/GoogleReviews/GoogleReviews';
import Contact from '@/components/Home/Contact/Contact';

/**
 * HOME PAGE
 *
 * Modern Next.js Page Component
 * - Server Component by default
 * - Imports from Home components directory
 * - Scalable structure for adding more sections
 *
 * Structure:
 * 1. Hero Section — First impression, branding, CTAs
 * 2. Featured Dishes — Menu highlights (coming next)
 * 3. About Section — Story & heritage
 * 4. Testimonials — Social proof
 * 5. CTA Section — Final conversion
 * 6. Contact/Reservation — Engagement
 */

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      <TrustStats />
      <FeaturedDishes />
      <About />
      <MenuCategories />
      <Offers />
      <WhyChooseUs />
      <Gallery />
      <GoogleReviews />
      <Contact />
    </>
  );
}
