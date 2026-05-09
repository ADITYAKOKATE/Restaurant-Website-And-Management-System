'use client';

import React, { useEffect, useState } from 'react';
import styles from './GoogleReviews.module.css';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getReviews() {
      try {
        const res = await fetch('/api/reviews/google');
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch google reviews", err);
      } finally {
        setLoading(false);
      }
    }
    getReviews();
  }, []);

  if (loading) return <div className={styles.loader}>Loading Reviews...</div>;
  if (reviews.length === 0) return null;

  return (
    <section className={styles.section} id="reviews">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Social Proof</span>
          <h2 className={styles.title}>What Our Guests Say</h2>
          <p className={styles.subtitle}>Real experiences from our Google reviews community.</p>
        </div>

        <div className={styles.grid}>
          {reviews.map((review, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.userRow}>
                <img src={review.profile_photo_url} alt={review.author_name} className={styles.avatar} />
                <div className={styles.userInfo}>
                  <h4 className={styles.userName}>{review.author_name}</h4>
                  <span className={styles.time}>{review.relative_time_description}</span>
                </div>
                <div className={styles.googleIcon}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Color_Icon.svg" alt="Google" width="16" />
                </div>
              </div>
              
              <div className={styles.rating}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx} className={idx < review.rating ? styles.starFull : styles.starEmpty}>★</span>
                ))}
              </div>

              <p className={styles.text}>"{review.text}"</p>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <a 
            href="https://www.google.com/maps" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.reviewButton}
          >
            Write a Review on Google
          </a>
        </div>
      </div>
    </section>
  );
}
