import styles from './Testimonials.module.css';

const testimonials = [
  { name: 'Aarav Patil', rating: 5, text: 'The flavors feel authentic and the whole experience feels premium.', role: 'Family Guest' },
  { name: 'Meera Deshmukh', rating: 5, text: 'Beautiful ambiance, warm service, and the food was outstanding.', role: 'Food Lover' },
  { name: 'Rohan Kulkarni', rating: 5, text: 'A polished restaurant with a strong Maharashtrian identity.', role: 'Regular Visitor' },
];

export default function Testimonials() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="testimonials-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Testimonials</p>
          <h2 id="testimonials-heading" className={styles.heading}>What Guests Are Saying</h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((item) => (
            <article key={item.name} className={styles.card}>
              <div className={styles.topRow}>
                <span className={styles.stars}>{'★'.repeat(item.rating)}</span>
                <span className={styles.role}>{item.role}</span>
              </div>
              <p className={styles.text}>{item.text}</p>
              <h3>{item.name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
