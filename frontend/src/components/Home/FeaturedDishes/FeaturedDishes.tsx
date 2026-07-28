import styles from './FeaturedDishes.module.css';

const dishes = [
  {
    name: 'Gavran Chicken Handi (Full)',
    desc: 'Rustic village-style spice blend with deep, rich flavor.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chicken_Handi.JPG',
  },
  {
    name: 'Spl. Chicken Raan',
    desc: 'Slow-cooked and aromatic, made for a premium feast.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Chicken_Tandoor.JPG',
  },
  {
    name: 'Mutton Handi (Full)',
    desc: 'Tender mutton simmered in a signature Maharashtrian gravy.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Indian_mutton_Curry.JPG',
  },
  {
    name: 'Paneer Tikka',
    desc: 'Smoky, soft, and perfectly balanced with warm spices.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Tandoori_Paneer_Tikka.jpg',
  },
  {
    name: 'Spl. Mutton Thali',
    desc: 'A complete dining experience with multiple authentic flavors.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Mutton_Thali.jpg',
  },
];

export default function FeaturedDishes() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="signature-dishes-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Signature Dishes</p>
          <h2 id="signature-dishes-heading" className={styles.heading}>Our Most Loved Plates</h2>
          <p className={styles.subtitle}>
            A curated selection of dishes that define the taste and character of Premacha Wada.
          </p>
        </div>

        <div className={styles.grid}>
          {dishes.map((dish) => (
            <article key={dish.name} className={styles.card}>
              <div className={styles.imageBox}>
                <img src={dish.image} alt={dish.name} className={styles.image} loading="lazy" />
                <div className={styles.overlay}></div>
              </div>
              <h3 className={styles.cardTitle}>{dish.name}</h3>
              <p className={styles.cardText}>{dish.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
