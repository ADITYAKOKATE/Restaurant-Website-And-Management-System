'use client';
import { useEffect, useState } from 'react';
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
  const [items, setItems] = useState<{title: string, image: string}[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: any[]) => {
        const fetchedItems = GALLERY_MAPPING.map(mapping => {
          const item = data.find(d => d.name === mapping.name);
          return {
            title: mapping.title,
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
