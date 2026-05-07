'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import styles from './Admin.module.css';

export default function AdminTopbar({
  onOpenMenu,
  onToggleSidebar,
  collapsed,
  title,
  subtitle,
  lastUpdated,
  onRefresh,
}: {
  onOpenMenu: () => void;
  onToggleSidebar: () => void;
  collapsed: boolean;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  onRefresh?: () => void;
}) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button type="button" className={styles.topbarActionButton} onClick={onOpenMenu} aria-label={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}>
          <span className={styles.topbarActionIcon}>☰</span>
          <span className={styles.topbarActionLabel}>{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
        <button type="button" className={styles.topbarActionButtonDesktop} onClick={onToggleSidebar} aria-label={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}>
          <span className={styles.topbarActionIcon}>⇔</span>
          <span className={styles.topbarActionLabel}>{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
        <div>
          <p className={styles.topbarEyebrow}>Restaurant Admin Panel</p>
          <h1 className={styles.topbarTitle}>{title}</h1>
          <p className={styles.topbarSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.topbarRight}>
        {lastUpdated && <span className={styles.topbarPill}>Updated {lastUpdated}</span>}
        {onRefresh && (
          <button type="button" className={styles.secondaryButton} onClick={onRefresh}>
            ↻ Refresh
          </button>
        )}
        <div ref={profileMenuRef} className={styles.profileDropdownContainer}>
          <button
            type="button"
            className={styles.topbarProfileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-expanded={showProfileMenu}
            aria-haspopup="menu"
          >
            <div className={styles.topbarAvatar}>{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className={styles.topbarProfileMeta}>
              <p className={styles.topbarName}>{user?.name || 'Admin'}</p>
              <p className={styles.topbarRole}>{user?.role || 'admin'}</p>
            </div>
            <span className={styles.topbarChevron}>▾</span>
          </button>

          {showProfileMenu && (
            <div className={styles.profileDropdownMenu} role="menu">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className={styles.logoutButton}
              >
                ⎋ Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}