'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Admin.module.css';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '▤', color: '#FF6B35', exact: true },
  { href: '/admin/orders', label: 'Orders', icon: '🧾', color: '#FF6B35' },
  { href: '/admin/menu', label: 'Menu', icon: '≣', color: '#FFD700' },
  { href: '/admin/offers', label: 'Offers', icon: '🎉', color: '#E74C3C' },
  { href: '/admin/users', label: 'Users', icon: '◉', color: '#2ECC71' },
  { href: '/admin/analytics', label: 'Analytics', icon: '▰', color: '#3498DB' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙', color: '#9B59B6' },
];

export default function AdminSidebar({ collapsed, mobileOpen, onClose }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}>
      <div className={styles.brandRow}>
        <div className={styles.brandMark}>PW</div>
        <div className={styles.brandCopy}>
          <span className={styles.brandTitle}>Premacha Wada</span>
          <span className={styles.brandSub}>Admin Console</span>
        </div>
        <button className={styles.sidebarClose} onClick={onClose} aria-label="Close admin menu">
          ×
        </button>
      </div>

      <div className={styles.sidebarSectionLabel}>Restaurant Operations</div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`} onClick={onClose}>
              <span className={styles.sidebarIcon} style={{ color: item.color }}>{item.icon}</span>
              <span className={styles.sidebarLinkText}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarBadge}>Live Kitchen Mode</div>
        <p>Real-time order flow, menu control, and business insights in one cockpit.</p>
      </div>
    </aside>
  );
}