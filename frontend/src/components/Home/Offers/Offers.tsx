'use client';

import { useEffect, useState } from 'react';
import styles from './Offers.module.css';

interface Offer {
  _id: string;
  title: string;
  description: string;
  tag?: string;
  discountCode?: string;
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/offers');
        if (res.ok) {
          const data = await res.json();
          setOffers(data);
        }
      } catch (err) {
        console.error('Failed to fetch offers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return null;
  if (offers.length === 0) return null;

  return (
    <section className={`section ${styles.section}`} aria-labelledby="special-offers-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Special Offers</p>
          <h2 id="special-offers-heading" className={styles.heading}>Elegant Offers for Every Occasion</h2>
        </div>

        <div className={styles.grid}>
          {offers.map((offer) => (
            <article key={offer._id} className={styles.card}>
              {offer.tag && <span className={styles.tag}>{offer.tag}</span>}
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              {offer.discountCode && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--primary)', borderRadius: '4px', display: 'inline-block' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Use Code: </span>
                  <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{offer.discountCode}</strong>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
