import styles from './Offers.module.css';

const offers = [
  { title: 'Weekend Combo', text: 'Perfect for family dinners and relaxed celebrations.', tag: 'Popular' },
  { title: 'Family Pack', text: 'Generous portions for a warm shared dining experience.', tag: 'Value' },
  { title: 'Festival Special', text: 'Seasonal dishes curated for joyful festive gatherings.', tag: 'Limited' },
  { title: 'Biryani Offer', text: 'A premium rice feast with rich spices and aroma.', tag: 'Hot Deal' },
];

export default function Offers() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="special-offers-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Special Offers</p>
          <h2 id="special-offers-heading" className={styles.heading}>Elegant Offers for Every Occasion</h2>
        </div>

        <div className={styles.grid}>
          {offers.map((offer) => (
            <article key={offer.title} className={styles.card}>
              <span className={styles.tag}>{offer.tag}</span>
              <h3>{offer.title}</h3>
              <p>{offer.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
