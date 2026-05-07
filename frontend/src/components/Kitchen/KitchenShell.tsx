'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import './kitchen.css';

export default function KitchenShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="kitchen-layout">
      <header className="kitchen-topbar">
        <div className="kitchen-brand">
          <span className="kitchen-logo">👨‍🍳</span>
          <h1>Premacha Wada Kitchen</h1>
        </div>
        <div className="kitchen-user">
          <span className="kitchen-user-name">{user?.name} ({user?.role})</span>
          <Link href="/" className="kitchen-nav-link">Main Site</Link>
          <button className="kitchen-logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="kitchen-main">
        {children}
      </main>
    </div>
  );
}
