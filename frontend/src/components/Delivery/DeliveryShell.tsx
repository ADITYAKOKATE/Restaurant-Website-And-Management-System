'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import './delivery.css';

export default function DeliveryShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="delivery-layout">
      <header className="delivery-topbar">
        <div className="delivery-brand">
          <span className="delivery-logo">🚴</span>
          <h1>Driver App</h1>
        </div>
        <div className="delivery-user">
          <span className="delivery-user-name">{user?.name}</span>
          <button className="delivery-logout-btn" onClick={logout}>Exit</button>
        </div>
      </header>
      <main className="delivery-main">
        {children}
      </main>
    </div>
  );
}
