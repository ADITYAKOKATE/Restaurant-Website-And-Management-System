import styles from './MenuCategories.module.css';

const categories = [
  {
    title: 'Veg Specials',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Non-Veg Specials',
    image:
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Handi Dishes',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Tandoor',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Biryani',
    image:
      'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Maharashtrian Specials',
    image:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function MenuCategories() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="menu-categories-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Menu Categories</p>
          <h2 id="menu-categories-heading" className={styles.heading}>Browse By Flavor</h2>
        </div>

        <div className={styles.grid}>
          {categories.map((category) => (
            <article key={category.title} className={styles.card}>
              <img src={category.image} alt={category.title} className={styles.image} loading="lazy" />
              <div className={styles.overlay}></div>
              <span className={styles.cardIcon}>✦</span>
              <h3>{category.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}