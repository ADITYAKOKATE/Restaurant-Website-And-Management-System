import styles from './WhyChooseUs.module.css';

const reasons = [
  { title: 'Authentic Taste', text: 'Traditional recipes that keep the flavor honest and memorable.', icon: '🍲' },
  { title: 'Fresh Ingredients', text: 'We use fresh produce and quality spices in every dish.', icon: '🌿' },
  { title: 'Hygienic Kitchen', text: 'A clean kitchen and careful preparation process every day.', icon: '✨' },
  { title: 'Experienced Chefs', text: 'A skilled kitchen team with years of restaurant craft.', icon: '👨‍🍳' },
  { title: 'Family Atmosphere', text: 'Warm hospitality designed for groups, families, and guests.', icon: '🏠' },
];

export default function WhyChooseUs() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="why-choose-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>Why Choose Us</p>
          <h2 id="why-choose-heading" className={styles.heading}>Trust Built Through Quality</h2>
        </div>

        <div className={styles.grid}>
          {reasons.map((reason) => (
            <article key={reason.title} className={styles.card}>
              <span className={styles.icon}>{reason.icon}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}