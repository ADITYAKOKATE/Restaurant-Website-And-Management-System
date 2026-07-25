import styles from './FeaturedDishes.module.css';

const dishes = [
  {
    name: 'Gavran Chicken',
    desc: 'Rustic village-style spice blend with deep, rich flavor.',
    image: 'https://raw.githubusercontent.com/sahil15132/menu-card/main/204.jpeg',
  },
  {
    name: 'Chicken Raan',
    desc: 'Slow-cooked and aromatic, made for a premium feast.',
    image: 'https://raw.githubusercontent.com/sahil15132/menu-card/main/1.jpeg',
  },
  {
    name: 'Mutton Handi',
    desc: 'Tender mutton simmered in a signature Maharashtrian gravy.',
    image: 'https://raw.githubusercontent.com/sahil15132/menu-card/main/227.jpeg',
  },
  {
    name: 'Paneer Tikka',
    desc: 'Smoky, soft, and perfectly balanced with warm spices.',
    image: 'https://raw.githubusercontent.com/sahil15132/menu-card/main/46.jpeg',
  },
  {
    name: 'Special Thali',
    desc: 'A complete dining experience with multiple authentic flavors.',
    image: 'https://raw.githubusercontent.com/sahil15132/menu-card/main/227.jpeg',
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
