import styles from './MenuCategories.module.css';

const categories = [
  {
    title: 'Veg Specials',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/174.jpeg',
  },
  {
    title: 'Non-Veg Specials',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/189.jpeg',
  },
  {
    title: 'Handi Dishes',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/199.jpeg',
  },
  {
    title: 'Tandoor',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/190.jpeg',
  },
  {
    title: 'Biryani',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/97.jpeg',
  },
  {
    title: 'Maharashtrian Specials',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/218.jpeg',
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