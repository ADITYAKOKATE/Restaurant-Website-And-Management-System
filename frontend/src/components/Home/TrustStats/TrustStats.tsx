import styles from './TrustStats.module.css';

const stats = [
  { value: '10K+', label: 'Happy Customers', icon: '👨‍👩‍👧‍👦' },
  { value: '50+', label: 'Authentic Recipes', icon: '📖' },
  { value: '25+', label: 'Signature Dishes', icon: '🍽️' },
  { value: '20+', label: 'Years of Experience', icon: '🏛️' },
];

export default function TrustStats() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="trust-stats-heading">
      <div className={styles.container}>
        <div className={styles.headingWrap}>
          <p className={styles.kicker}>Trust & Stats</p>
          <h2 id="trust-stats-heading" className={styles.heading}>Credibility That Feels Premium</h2>
        </div>

        <div className={styles.grid}>
          {stats.map((item) => (
            <article key={item.label} className={styles.card}>
              <span className={styles.icon}>{item.icon}</span>
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}