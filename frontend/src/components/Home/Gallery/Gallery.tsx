import styles from './Gallery.module.css';

const items = [
  {
    title: 'Signature Platter',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/b/b5/Chicken_Tikka_with_some_salad.jpg',
  },
  {
    title: 'Authentic Thali',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/1/1d/Mutton_Thali.jpg',
  },
  {
    title: 'Tandoor Specials',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/d/d1/Chicken_Tandoor.JPG',
  },
  {
    title: 'Rich Flavors',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/7/78/Veg_Kolhapuri.jpg',
  },
  {
    title: 'Family Feast',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/6/62/South_Indian_non-veg_Meals.jpg',
  },
  {
    title: 'Aromatic Biryani',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/8/8b/Awadhi_Vegetable_Biryani.jpg',
  },
];

export default function Gallery() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="gallery-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Gallery Preview</p>
          <h2 id="gallery-heading" className={styles.heading}>A Cinematic Taste of the Restaurant</h2>
        </div>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <article key={item.title} className={`${styles.tile} ${index % 3 === 0 ? styles.tall : ''}`}>
              <img src={item.image} alt={item.title} className={styles.image} loading="lazy" />
              <div className={styles.overlay}></div>
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
