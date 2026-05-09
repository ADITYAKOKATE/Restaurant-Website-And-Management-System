import styles from './Contact.module.css';

export default function Contact() {
  const mapAddress = '747, Aurangabad - Ahmednagar - Pune Hwy, Wagholi, Pune, Maharashtra 412207';
  const mapQuery = encodeURIComponent(mapAddress);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="contact-heading">
      <div className={styles.container}>
        <div className={styles.infoCard}>
          <p className={styles.kicker}>Contact Preview</p>
          <h2 id="contact-heading" className={styles.heading}>Plan Your Visit with Ease</h2>
          <div className={styles.details}>
            <p><strong>📍 Address:</strong> 747, Aurangabad - Ahmednagar - Pune Hwy, Wagholi, Pune, Maharashtra 412207</p>
            <p><strong>🕒 Hours:</strong> 11:00 AM - 10:00 PM</p>
            <p><strong>📞 Phone:</strong> +91 98765 43210</p>
          </div>
          <div className={styles.actionRow}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className={styles.button}
            >
              Get Directions
            </a>
            <a href="/reservations" className={`${styles.button} ${styles.bookButton}`}>
              Book a Table
            </a>
          </div>
        </div>

        <div className={styles.mapCard}>
          <div className={styles.mapViewport}>
            <iframe
              title="Premacha Wada map preview"
              src={`https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`}
              className={styles.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className={styles.mapOverlay}>
              <span className={styles.mapIcon}>📍</span>
              <p>{mapAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
