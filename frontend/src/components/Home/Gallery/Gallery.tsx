import styles from './Gallery.module.css';

const items = [
  {
    title: 'Signature Platter',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/10.jpeg',
  },
  {
    title: 'Authentic Thali',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/15.jpeg',
  },
  {
    title: 'Tandoor Specials',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/3.jpeg',
  },
  {
    title: 'Rich Flavors',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/162.jpeg',
  },
  {
    title: 'Family Feast',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/5.jpeg',
  },
  {
    title: 'Aromatic Biryani',
    image:
      'https://raw.githubusercontent.com/sahil15132/menu-card/main/90.jpeg',
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
