'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './profile.css';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (!user && !loading) { router.push('/login'); return; }
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setForm({ name: data.user.name, phone: data.user.phone || '', address: data.user.address || '' });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [user, loading]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.user);
        setIsEditing(false);
        await refreshUser();
        showToast('Profile updated successfully!', true);
      } else {
        showToast(data.message || 'Failed to update profile.', false);
      }
    } catch {
      showToast('Network error. Please try again.', false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isFetching) {
    return (
      <main className="page-content section">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-5xl)' }}>
          <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <main className="page-content section">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.ok ? 'toast-success' : 'toast-error'}`}>
            {toast.ok ? '✅' : '⚠️'} {toast.msg}
          </div>
        </div>
      )}

      <div className="container">
        <div className="profile-layout">

          {/* ── Sidebar Card ── */}
          <div className="profile-sidebar">
            <div className="profile-avatar-circle">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>
            {profile.role === 'admin' && (
              <span className="profile-role-badge">👑 Admin</span>
            )}
            <p className="profile-joined">Member since {joinedDate}</p>

            <div className="profile-sidebar-links">
              <Link href="/orders" className="profile-sidebar-link">
                📋 My Orders
              </Link>
              <Link href="/menu" className="profile-sidebar-link">
                🍛 Browse Menu
              </Link>
              {profile.role === 'admin' && (
                <Link href="/admin" className="profile-sidebar-link profile-sidebar-link--admin">
                  ⚙️ Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="profile-main">
            <div className="card profile-form-card">
              <div className="profile-form-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                    ✏️ Edit
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setIsEditing(false); setForm({ name: profile.name, phone: profile.phone, address: profile.address }); }}>
                    Cancel
                  </button>
                )}
              </div>

              <div className="profile-fields">
                <div className="profile-field">
                  <label className="profile-field-label">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  ) : (
                    <p className="profile-field-value">{profile.name}</p>
                  )}
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Email Address</label>
                  <p className="profile-field-value profile-field-value--muted">{profile.email}
                    <span className="profile-field-locked">🔒 Cannot be changed</span>
                  </p>
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="form-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  ) : (
                    <p className="profile-field-value">{profile.phone || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
                  )}
                </div>

                <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="profile-field-label">Default Delivery Address</label>
                  {isEditing ? (
                    <textarea
                      className="form-input"
                      rows={3}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Enter your default delivery address..."
                      style={{ resize: 'vertical' }}
                    />
                  ) : (
                    <p className="profile-field-value">{profile.address || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="profile-stats-row">
              <Link href="/orders" className="profile-stat-card card">
                <span className="profile-stat-icon">📦</span>
                <span className="profile-stat-label">View Orders</span>
              </Link>
              <Link href="/my-reservations" className="profile-stat-card card">
                <span className="profile-stat-icon">📅</span>
                <span className="profile-stat-label">My Reservations</span>
              </Link>
              <Link href="/cart" className="profile-stat-card card">
                <span className="profile-stat-icon">🛒</span>
                <span className="profile-stat-label">My Cart</span>
              </Link>
              <Link href="/menu" className="profile-stat-card card">
                <span className="profile-stat-icon">🍽️</span>
                <span className="profile-stat-label">Menu</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
