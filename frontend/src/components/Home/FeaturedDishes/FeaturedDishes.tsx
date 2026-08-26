'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './FeaturedDishes.module.css';

interface Dish {
  name: string;
  desc: string;
  image: string;
}

const FEATURED_NAMES = [
  'Gavran Chicken Handi (Full)',
  'Spl. Chicken Raan',
  'Mutton Handi (Full)',
  'Paneer Tikka',
  'Spl. Mutton Thali'
];

const DEFAULT_DESCS: Record<string, string> = {
  'Gavran Chicken Handi (Full)': 'Rustic village-style spice blend with deep, rich flavor.',
  'Spl. Chicken Raan': 'Slow-cooked and aromatic, made for a premium feast.',
  'Mutton Handi (Full)': 'Tender mutton simmered in a signature Maharashtrian gravy.',
  'Paneer Tikka': 'Smoky, soft, and perfectly balanced with warm spices.',
  'Spl. Mutton Thali': 'A complete dining experience with multiple authentic flavors.'
};

export default function FeaturedDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: any[]) => {
         const fetchedDishes = FEATURED_NAMES.map(name => {
           const item = data.find(d => d.name === name);
           return {
             name,
             desc: item?.description || DEFAULT_DESCS[name],
             image: item?.image || ''
           };
         }).filter(d => d.image !== '');
         setDishes(fetchedDishes);
      })
      .catch(console.error);
  }, []);

  if (dishes.length === 0) return null;

  return (
    <section className={`section ${styles.section}`} aria-labelledby="signature-dishes-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Signature Dishes</p>
          <h2 id="signature-dishes-heading" className={styles.heading}>Our Most Loved Plates</h2>
          <p className={styles.subtitle}>
            A curated selection of dishes that define the taste and character of Premacha Wada. Click any dish to view and order.
          </p>
        </div>

        <div className={styles.grid}>
          {dishes.map((dish) => (
            <Link
              key={dish.name}
              href={`/menu?dish=${encodeURIComponent(dish.name)}`}
              className={styles.cardLink}
              title={`View ${dish.name} on menu`}
            >
              <article className={styles.card}>
                <div className={styles.imageBox}>
                  <img src={dish.image} alt={dish.name} className={styles.image} loading="lazy" />
                  <div className={styles.overlay}></div>
                  <div className={styles.viewBadge}>
                    <span>View Dish ↗</span>
                  </div>
                </div>
                <h3 className={styles.cardTitle}>{dish.name}</h3>
                <p className={styles.cardText}>{dish.desc}</p>
                <span className={styles.actionText}>
                  Order Dish <span className={styles.arrow}>→</span>
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
