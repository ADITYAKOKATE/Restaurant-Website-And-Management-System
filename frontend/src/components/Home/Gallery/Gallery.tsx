'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Gallery.module.css';

const GALLERY_MAPPING = [
  { title: 'Signature Platter', name: 'Spl. Chicken Kharda Thali' },
  { title: 'Authentic Thali', name: 'Spl. Mutton Kharda Thali' },
  { title: 'Tandoor Specials', name: 'Spl. Chicken Achari Raan' },
  { title: 'Rich Flavors', name: 'Veg Kadai' },
  { title: 'Family Feast', name: 'Spl. Veg Thali' },
  { title: 'Aromatic Biryani', name: 'Veg Hydrabadi Biryani' },
];

export default function Gallery() {
  const [items, setItems] = useState<{title: string, name: string, image: string}[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: any[]) => {
        const fetchedItems = GALLERY_MAPPING.map(mapping => {
          const item = data.find(d => d.name === mapping.name);
          return {
            title: mapping.title,
            name: mapping.name,
            image: item?.image || ''
          };
        }).filter(i => i.image !== '');
        setItems(fetchedItems);
      })
      .catch(console.error);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className={`section ${styles.section}`} aria-labelledby="gallery-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Gallery Preview</p>
          <h2 id="gallery-heading" className={styles.heading}>A Cinematic Taste of the Restaurant</h2>
        </div>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <Link
              key={item.title}
              href={`/menu?dish=${encodeURIComponent(item.name)}`}
              className={`${styles.tile} ${index % 3 === 0 ? styles.tall : ''}`}
              title={`View ${item.name} on menu`}
            >
              <img src={item.image} alt={item.title} className={styles.image} loading="lazy" />
              <div className={styles.overlay}></div>
              <div className={styles.badge}>
                <span>Order Now ↗</span>
              </div>
              <div className={styles.tileContent}>
                <h3>{item.title}</h3>
                <span className={styles.dishName}>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
