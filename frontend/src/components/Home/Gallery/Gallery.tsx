import styles from './Gallery.module.css';

const items = [
  {
    title: 'Signature Platter',
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Warm Ambience',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Live Kitchen',
    image:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Luxury Table Setting',
    image:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Family Feast',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Evening Dining',
    image:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
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
