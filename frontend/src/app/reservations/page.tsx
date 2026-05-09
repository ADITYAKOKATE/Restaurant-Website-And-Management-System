'use client';

import React, { useState, useEffect } from 'react';
import styles from './Reservations.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface BookedTable {
  tableNumber: number;
  timeSlot: string;
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('18:00');
  const [guests, setGuests] = useState<number | string>(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [bookedTables, setBookedTables] = useState<BookedTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const timeSlots = ["11:00", "12:00", "13:00", "14:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  useEffect(() => {
    fetchAvailability();
  }, [date]);

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`/api/reservations/availability?date=${date}`);
      const data = await res.json();
      setBookedTables(data);
    } catch (err) {
      console.error("Failed to fetch availability", err);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/reservations');
      return;
    }

    if (!selectedTable) {
      setMessage({ text: 'Please select a table.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: selectedTable,
          date,
          timeSlot,
          numberOfGuests: guests
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Reservation request sent! We will confirm it shortly.', type: 'success' });
        setSelectedTable(null);
        fetchAvailability();
      } else {
        setMessage({ text: data.message || 'Failed to book table.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isTableBooked = (tableNum: number) => {
    return bookedTables.some(b => b.tableNumber === tableNum && b.timeSlot === timeSlot);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Book Your Table</h1>
        <p className={styles.subtitle}>Experience premium Maharashtrian dining at Premacha Wada.</p>
      </header>

      <div className={styles.reservationGrid}>
        <div className={styles.formSection}>
          <form onSubmit={handleBooking} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Select Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Preferred Time</label>
              <div className={styles.timeGrid}>
                {timeSlots.map(slot => (
                  <button 
                    key={slot}
                    type="button"
                    className={`${styles.timeButton} ${timeSlot === slot ? styles.activeTime : ''}`}
                    onClick={() => setTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Number of Guests</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={guests} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setGuests('');
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num)) setGuests(num);
                  }
                }}
                required
              />
            </div>

            {message.text && (
              <div className={`${styles.alert} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Processing...' : 'Request Reservation'}
            </button>
          </form>
        </div>

        <div className={styles.tableSection}>
          <h3>Select a Table</h3>
          <p className={styles.hint}>Orange: Selected | Grey: Booked | Border: Available</p>
          <div className={styles.restaurantFloor}>
            {Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
              const booked = isTableBooked(num);
              const selected = selectedTable === num;
              return (
                <div 
                  key={num}
                  className={`${styles.table} ${booked ? styles.booked : ''} ${selected ? styles.selected : ''}`}
                  onClick={() => !booked && setSelectedTable(num)}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
