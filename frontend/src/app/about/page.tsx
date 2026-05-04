import AboutComponent from '@/components/Home/About/About';
import TrustStats from '@/components/Home/TrustStats/TrustStats';
import Gallery from '@/components/Home/Gallery/Gallery';
import Testimonials from '@/components/Home/Testimonials/Testimonials';

export default function AboutPage() {
  return (
    <main className="page-content">
      {/* Reusing Home Components to construct a comprehensive About page */}
      <div className="section-header" style={{ marginTop: 'var(--space-4xl)' }}>
        <span className="section-tag">About Us</span>
        <h2>The Story of Premacha Wada</h2>
        <p>Serving authentic Maharashtrian cuisine with love since 1995.</p>
      </div>

      <AboutComponent />
      <TrustStats />
      <Gallery />
      <Testimonials />
    </main>
  );
}
