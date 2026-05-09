'use client';

import styles from './Hero.module.css';

/**
 * HERO COMPONENT
 *
 * Purpose:
 * - First section visitors see on homepage
 * - Communicates "What is Premacha Wada?"
 * - Drives visitors to menu or reservation
 *
 * Structure:
 * - Left: Premium text content + CTAs
 * - Right: Visual imagery with effects (desktop only)
 *
 * Why split into sub-components?
 * - Easier to understand each part
 * - Easier to modify later
 * - Follows real-world team projects
 */

// Badge component - small tag at top
function Badge() {
  return (
    <div className={styles.badge}>
      ✦ Authentic Maharashtrian Heritage ✦
    </div>
  );
}

// Main heading with gradient text
function Heading() {
  return (
    <h1 className={styles.heading}>
      <span>Experience </span>
      <span className={styles.highlight}>Premium Dining</span>
    </h1>
  );
}

// Description under heading
function Description() {
  return (
    <p className={styles.description}>
      Discover Maharashtra's finest culinary traditions. Each dish crafted with passion,
      served with elegance. Welcome to a world where authentic flavors meet modern luxury.
    </p>
  );
}

// CTA buttons - drive action
function CallToAction() {
  return (
    <div className={styles.ctaButtons}>
      <a href="/menu" className={styles.btnPrimary}>
        Explore Menu
      </a>
      <a href="/reservations" className={styles.btnSecondary}>
        Reserve Table
      </a>
    </div>
  );
}

// Trust indicators - build confidence
function TrustIndicators() {
  return (
    <div className={styles.trust}>
      <div className={styles.trustItem}>
        <span className={styles.trustValue}>4.9★</span>
        <span className={styles.trustLabel}>Highly Rated</span>
      </div>
      <div className={styles.trustItem}>
        <span className={styles.trustValue}>1000+</span>
        <span className={styles.trustLabel}>Happy Guests</span>
      </div>
    </div>
  );
}

// Right side - visual content
function VisualSection() {
  return (
    <div className={styles.visual}>
      {/* Dual glow layers for depth */}
      <div className={styles.glow}></div>
      <div className={styles.glowSecondary}></div>

      {/* Main image container */}
      <div className={styles.imageBox}>
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
          alt="Premium Maharashtrian platter"
          className={styles.heroImage}
          loading="lazy"
        />
        <div className={styles.imageOverlay}></div>
        <div className={styles.imageGrain}></div>
        <div className={styles.imageTag}>Chef's Signature Platter</div>
      </div>

      {/* Top floating badge */}
      <div className={styles.floatingBadge}>
        <span>Chef's Recommendation</span>
      </div>

      {/* Bottom floating info card */}
      <div className={styles.floatingCard}>
        <span className={styles.cardIcon}>⭐</span>
        <div>
          <p className={styles.cardTitle}>Award-Winning</p>
          <p className={styles.cardSubtitle}>Since 1995</p>
        </div>
      </div>

      <div className={styles.sideCard}>
        <p className={styles.sideCardTitle}>Evening Dining</p>
        <p className={styles.sideCardText}>Handcrafted taste with luxury ambience</p>
      </div>
    </div>
  );
}

// Main component - puts everything together
export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* LEFT SIDE - Text content */}
        <div className={styles.content}>
          <Badge />
          <Heading />
          <Description />
          <CallToAction />
          <TrustIndicators />
        </div>

        {/* RIGHT SIDE - Visual content (hidden on mobile) */}
        <VisualSection />
      </div>
    </section>
  );
}
