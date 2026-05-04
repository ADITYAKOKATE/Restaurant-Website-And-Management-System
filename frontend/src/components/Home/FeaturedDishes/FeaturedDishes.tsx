import styles from './FeaturedDishes.module.css';

const dishes = [
  {
    name: 'Gavran Chicken',
    desc: 'Rustic village-style spice blend with deep, rich flavor.',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chicken Raan',
    desc: 'Slow-cooked and aromatic, made for a premium feast.',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Mutton Handi',
    desc: 'Tender mutton simmered in a signature Maharashtrian gravy.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Paneer Tikka',
    desc: 'Smoky, soft, and perfectly balanced with warm spices.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Special Thali',
    desc: 'A complete dining experience with multiple authentic flavors.',
    image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=1200&q=80',
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
