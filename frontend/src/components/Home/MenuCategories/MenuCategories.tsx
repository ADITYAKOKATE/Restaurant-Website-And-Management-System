'use client';
import { useEffect, useState } from 'react';
import styles from './MenuCategories.module.css';

const CATEGORY_MAPPING = [
  { title: 'Veg Specials', name: 'Veg Maharaja' },
  { title: 'Non-Veg Specials', name: 'Chicken Tikka Masala' },
  { title: 'Handi Dishes', name: 'Chicken Handi (Full)' },
  { title: 'Tandoor', name: 'Chicken Afgani' },
  { title: 'Biryani', name: 'Mutton Dum Biryani (Full)' },
  { title: 'Maharashtrian Specials', name: 'Mutton Kharda' },
];

export default function MenuCategories() {
  const [categories, setCategories] = useState<{title: string, image: string}[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: any[]) => {
        const fetchedCats = CATEGORY_MAPPING.map(mapping => {
          const item = data.find(d => d.name === mapping.name);
          return {
            title: mapping.title,
            image: item?.image || ''
          };
        }).filter(i => i.image !== '');
        setCategories(fetchedCats);
      })
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

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