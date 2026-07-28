import styles from './MenuCategories.module.css';

const categories = [
  {
    title: 'Veg Specials',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/5/5e/Spicy_Shahi_Paneer.jpg',
  },
  {
    title: 'Non-Veg Specials',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/0/00/Chicken_tikka_masala_%28cropped%29.jpg',
  },
  {
    title: 'Handi Dishes',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chicken_Handi.JPG',
  },
  {
    title: 'Tandoor',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/e7/Chicken_tikka2.jpg',
  },
  {
    title: 'Biryani',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/f/f8/Mutton_Dum_biryani.jpg',
  },
  {
    title: 'Maharashtrian Specials',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/7/7f/Dummy_19_W.jpg',
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