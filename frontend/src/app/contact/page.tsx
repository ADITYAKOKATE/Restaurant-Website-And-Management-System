import React from 'react';
import ContactComponent from '@/components/Home/Contact/Contact';

export default function ContactPage() {
  return (
    <main className="page-content">
      <div className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Get In Touch</span>
            <h2>We'd Love to Hear From You</h2>
            <p>Whether you have a question about the menu, want to reserve a table, or need help with a delivery, our team is ready to assist.</p>
          </div>

          <div className="grid-2">
            {/* Contact Form */}
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Send us a Message</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input type="text" id="name" className="form-input" placeholder="Rahul Sharma" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input type="email" id="email" className="form-input" placeholder="rahul@example.com" required />
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <select id="subject" className="form-input" required>
                    <option value="">Select a topic</option>
                    <option value="reservation">Table Reservation</option>
                    <option value="order">Online Order Issue</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea id="message" className="form-input" placeholder="How can we help you?" rows={5} required></textarea>
                </div>

                <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-sm)' }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Address & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="card glass">
                <h3>Contact Information</h3>
                <ul style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>📍</span>
                    <div>
                      <strong>Address</strong>
                      <p style={{ color: 'var(--text-secondary)' }}>747, Aurangabad - Ahmednagar - Pune Hwy, Wagholi, Pune, Maharashtra 412207</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p style={{ color: 'var(--text-secondary)' }}>+91 98765 43210</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>📧</span>
                    <div>
                      <strong>Email</strong>
                      <p style={{ color: 'var(--text-secondary)' }}>premachawada1@gmail.com</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>🕒</span>
                    <div>
                      <strong>Opening Hours</strong>
                      <p style={{ color: 'var(--text-secondary)' }}>Everyday: 11:00 AM - 10:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Quick Map embed preview */}
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '100%', minHeight: '250px' }}>
                <iframe
                  title="Premacha Wada map"
                  src="https://www.google.com/maps?q=747,+Aurangabad+-+Ahmednagar+-+Pune+Hwy,+Wagholi,+Pune,+Maharashtra+412207&z=15&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
