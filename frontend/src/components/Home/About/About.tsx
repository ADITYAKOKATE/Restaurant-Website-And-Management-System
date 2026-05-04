import styles from './About.module.css';

export default function About() {
  return (
    <section className={`section ${styles.about}`} aria-labelledby="about-heading">
      <div className={styles.container}>
        <div className={styles.storyCard}>
          <p className={styles.kicker}>Our Story</p>
          <h2 id="about-heading" className={styles.heading}>
            Rooted in Tradition, Served with Warmth
          </h2>
          <p className={styles.lead}>
            A premium Maharashtrian dining destination where heritage recipes meet modern elegance.
          </p>
          <p className={styles.text}>
            Premacha Wada celebrates authentic Maharashtrian flavors through handcrafted recipes,
            premium ingredients, and warm hospitality.
          </p>
          <p className={styles.text}>
            Every dish is prepared to honor the heritage of the region while giving guests a
            refined dining experience.
          </p>

          <div className={styles.highlights}>
            <div className={styles.highlightItem}>
              <span className={styles.highlightIcon}>✦</span>
              <span>Heritage-inspired recipes</span>
            </div>
            <div className={styles.highlightItem}>
              <span className={styles.highlightIcon}>✦</span>
              <span>Premium ingredients and plating</span>
            </div>
            <div className={styles.highlightItem}>
              <span className={styles.highlightIcon}>✦</span>
              <span>Warm family-style hospitality</span>
            </div>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metricCard}>
              <strong>20+</strong>
              <span>Years of Legacy</span>
            </div>
            <div className={styles.metricCard}>
              <strong>50+</strong>
              <span>Authentic Recipes</span>
            </div>
            <div className={styles.metricCard}>
              <strong>10K+</strong>
              <span>Happy Guests</span>
            </div>
          </div>
        </div>

        <div className={styles.visualCard}>
          <div className={styles.visualTop}>
            <span className={styles.badge}>Chef's Signature</span>
            <span>Since 1995</span>
          </div>

          <div className={styles.visualImage}>
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
              alt="Premium plated dish from Premacha Wada"
              loading="lazy"
            />
            <div className={styles.imageOverlay}></div>
          </div>

          <div className={styles.visualCenter}>
            <span className={styles.visualIcon}>✦</span>
            <p>Traditional recipes, premium presentation</p>
          </div>

          <div className={styles.visualFooter}>
            <p>Authentic Maharashtrian Dining Experience</p>
          </div>
        </div>
      </div>
    </section>
  );
}
