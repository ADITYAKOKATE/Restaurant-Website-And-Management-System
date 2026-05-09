'use client';

import React, { useState, useEffect } from 'react';
import { AdminSectionHeader, AdminBadge, AdminEmptyState } from './AdminUi';
import { formatShortDateTime } from './adminUtils';
import { fetchAdminReservations, updateAdminReservationStatus } from './adminApi';
import { AdminReservationRecord } from './adminTypes';
import styles from './Admin.module.css';

export default function AdminReservationsPanel() {
  const [reservations, setReservations] = useState<AdminReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReservations(filterDate, filterStatus);
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [filterDate, filterStatus]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateAdminReservationStatus(id, status);
      loadReservations();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const getStatusTone = (status: string): 'muted' | 'success' | 'warning' | 'danger' | 'info' | 'promo' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      default: return 'muted';
    }
  };

  return (
    <>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <p className={styles.heroEyebrow}>Table Orchestration</p>
          <h2 className={styles.heroTitle}>Reservation Management</h2>
          <p className={styles.heroDescription}>
            View and manage upcoming table bookings. Confirm requests, track completions, and manage guest flow.
          </p>
        </div>
        <div className={styles.boardActions}>
           <div style={{ display: 'flex', gap: '10px' }}>
             <input 
               type="date" 
               className={styles.settingsInput} 
               value={filterDate} 
               onChange={(e) => setFilterDate(e.target.value)}
               style={{ width: 'auto', marginBottom: 0 }}
             />
             <select 
               className={styles.settingsInput} 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               style={{ width: 'auto', marginBottom: 0 }}
             >
               <option value="">All Statuses</option>
               <option value="pending">Pending</option>
               <option value="confirmed">Confirmed</option>
               <option value="completed">Completed</option>
               <option value="cancelled">Cancelled</option>
             </select>
           </div>
        </div>
      </section>

      <section className={styles.panelCard}>
        <AdminSectionHeader eyebrow="Reservations" title="Live Booking Stream" description="Latest table requests and confirmed bookings." />
        
        {loading ? (
          <div style={{ minHeight: 200, display: 'grid', placeItems: 'center' }}><div className="spinner" /></div>
        ) : error ? (
          <AdminEmptyState icon="⚠" title="Error" description={error} />
        ) : reservations.length === 0 ? (
          <AdminEmptyState icon="📅" title="No reservations found" description="Adjust your filters or wait for new customer bookings." />
        ) : (
          <div className={styles.boardList}>
            {reservations.map((res) => (
              <article key={res._id} className={styles.orderCard}>
                <div className={styles.orderMeta}>
                  <div>
                    <div className={styles.orderToken}>Table {res.tableNumber}</div>
                    <p className={styles.orderItemText}>
                      <strong>{res.user?.name || 'Unknown User'}</strong> • {res.user?.phone || 'No Phone'} <br/>
                      {new Date(res.date).toLocaleDateString()} at {res.timeSlot}
                    </p>
                  </div>
                  <AdminBadge tone={getStatusTone(res.status)}>{res.status.toUpperCase()}</AdminBadge>
                </div>
                
                <div className={styles.orderItems}>
                  <span className={styles.subtlePill}>{res.numberOfGuests} Guests</span>
                  {res.specialRequests && <span className={styles.subtlePill}>Note: {res.specialRequests}</span>}
                </div>

                <div className={styles.orderFooter}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {res.status === 'pending' && (
                      <button className={styles.primaryButton} onClick={() => handleStatusUpdate(res._id, 'confirmed')} style={{ padding: '6px 12px', fontSize: 12 }}>
                        Confirm
                      </button>
                    )}
                    {res.status === 'confirmed' && (
                      <button className={styles.primaryButton} onClick={() => handleStatusUpdate(res._id, 'completed')} style={{ padding: '6px 12px', fontSize: 12, backgroundColor: '#2ECC71' }}>
                        Mark Completed
                      </button>
                    )}
                    {(res.status === 'pending' || res.status === 'confirmed') && (
                      <button className={styles.secondaryButton} onClick={() => handleStatusUpdate(res._id, 'cancelled')} style={{ padding: '6px 12px', fontSize: 12 }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
