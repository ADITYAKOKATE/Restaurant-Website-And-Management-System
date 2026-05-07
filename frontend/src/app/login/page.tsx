'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import '../register/auth.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user);
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'kitchen') {
          router.push('/kitchen');
        } else if (data.user.role === 'delivery') {
          router.push('/delivery');
        } else {
          router.push('/');
        }
      } else {
        setApiError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setApiError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__circle auth-bg__circle--1" />
        <div className="auth-bg__circle auth-bg__circle--2" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-panel auth-panel--left">
          <div className="auth-panel__content">
            <div className="auth-panel__icon">🍛</div>
            <h2 className="auth-panel__title">Welcome Back!</h2>
            <p className="auth-panel__desc">
              Log in to continue enjoying the authentic taste of Premacha Wada. Your cravings are just a click away!
            </p>
            <ul className="auth-panel__perks">
              <li><span className="auth-panel__perk-icon">🛒</span> Access your saved cart</li>
              <li><span className="auth-panel__perk-icon">📦</span> Track your current orders</li>
              <li><span className="auth-panel__perk-icon">🌟</span> View your order history</li>
              <li><span className="auth-panel__perk-icon">🎉</span> Exclusive member deals</li>
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
              <h1 className="auth-form-title">Sign In</h1>
              <p className="auth-form-subtitle">New here? <Link href="/register" className="auth-link">Create a free account</Link></p>
            </div>

            {apiError && (
              <div className="auth-alert auth-alert--error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <input
                  id="login-email"
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
                <div className="auth-label-row">
                  <label htmlFor="login-password" className="form-label">Password</label>
                  <a href="#" className="auth-forgot-link">Forgot password?</a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                {errors.password && <p className="form-error">⚠ {errors.password}</p>}
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner" /> Signing in...</>
                ) : (
                  'Sign In →'
                )}
              </button>

              <div className="divider-text">or</div>

              <p className="auth-register-cta">
                Don&apos;t have an account yet?{' '}
                <Link href="/register" className="auth-link">
                  Sign up for free
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
