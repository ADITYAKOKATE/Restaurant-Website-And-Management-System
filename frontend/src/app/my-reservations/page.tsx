'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import './reservations.css';

interface Reservation {
  _id: string;
  tableNumber: number;
  date: string;
  timeSlot: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'Pending Approval', color: '#FFD700', bg: 'rgba(255,215,0,0.1)',   icon: '⏳' },
  confirmed: { label: 'Confirmed',        color: '#2ECC71', bg: 'rgba(46,204,113,0.1)', icon: '✅' },
  completed: { label: 'Completed',        color: '#3498DB', bg: 'rgba(52,152,219,0.1)', icon: '✨' },
  cancelled: { label: 'Cancelled',        color: '#FF4757', bg: 'rgba(255,71,87,0.1)',  icon: '❌' },
};

export default function MyReservationsPage() {
  const { user, loading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/reservations/me');
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        }
      } catch (err) {
        console.error('Failed to fetch reservations', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchReservations();

    const interval = setInterval(fetchReservations, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <main className="page-content section">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-5xl) 0' }}>
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your reservations.</p>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content section">
      <div className="container">
        
        <div className="section-header">
          <span className="section-tag">Booking History</span>
          <h2>My Reservations</h2>
          <p>Manage and track your table bookings at Premacha Wada.</p>
        </div>

        {isFetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4xl)' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="card glass" style={{ textAlign: 'center', padding: 'var(--space-5xl) var(--space-xl)' }}>
            <span style={{ fontSize: '60px', display: 'block', marginBottom: 'var(--space-md)' }}>📅</span>
            <h3>No reservations yet!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
              Planning a visit? Book a table in advance for a seamless experience.
            </p>
            <Link href="/reservations" className="btn btn-primary">Book a Table</Link>
          </div>
        ) : (
          <div className="reservations-list">
            {reservations.map((res) => {
              const statusCfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
              const formattedDate = new Date(res.date).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric'
              });

              return (
                <div key={res._id} className="reservation-card card">
                  <div className="reservation-card-header">
                    <div className="reservation-card-meta">
                      <div className="table-badge">
                        🪑 Table {res.tableNumber}
                      </div>
                      <span className="reservation-date">{formattedDate}</span>
                    </div>
                    <div className="reservation-status-row">
                      <span 
                        className="status-badge"
                        style={{ color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.color}33` }}
                      >
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="reservation-details">
                    <div className="detail-item">
                      <span className="detail-label">Time Slot</span>
                      <span className="detail-value">{res.timeSlot}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Guests</span>
                      <span className="detail-value">{res.numberOfGuests} Persons</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Requested On</span>
                      <span className="detail-value">{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {res.specialRequests && (
                    <div className="special-requests">
                      <strong>Notes:</strong> {res.specialRequests}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
