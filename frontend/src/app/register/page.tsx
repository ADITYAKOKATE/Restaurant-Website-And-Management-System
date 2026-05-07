'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './auth.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user);
        router.push('/');
      } else {
        setApiError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setApiError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg">
        <div className="auth-bg__circle auth-bg__circle--1" />
        <div className="auth-bg__circle auth-bg__circle--2" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-panel auth-panel--left">
          <div className="auth-panel__content">
            <div className="auth-panel__icon">🍛</div>
            <h2 className="auth-panel__title">Join the Premacha Family!</h2>
            <p className="auth-panel__desc">
              Create your account and enjoy authentic Maharashtrian cuisine delivered right to your door.
            </p>
            <ul className="auth-panel__perks">
              <li><span className="auth-panel__perk-icon">⚡</span> Fast delivery to your doorstep</li>
              <li><span className="auth-panel__perk-icon">🎁</span> Exclusive member offers & discounts</li>
              <li><span className="auth-panel__perk-icon">📋</span> Easy order tracking</li>
              <li><span className="auth-panel__perk-icon">❤️</span> Made fresh with love</li>
            </ul>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-panel auth-panel--right">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <Link href="/" className="auth-back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                Back to home
              </Link>
              <h1 className="auth-form-title">Create Account</h1>
              <p className="auth-form-subtitle">Already have an account? <Link href="/login" className="auth-link">Sign in</Link></p>
            </div>

            {apiError && (
              <div className="auth-alert auth-alert--error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && <p className="form-error">⚠ {errors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <p className="form-error">⚠ {errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone" className="form-label">Phone Number <span className="form-label-optional">(Optional)</span></label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password && <p className="form-error">⚠ {errors.password}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword}</p>}
              </div>

              <p className="auth-terms">
                By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>

              <button
                id="register-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner" /> Creating Account...</>
                ) : (
                  'Create My Account 🚀'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
