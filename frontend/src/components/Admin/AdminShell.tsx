'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import styles from './Admin.module.css';

export default function AdminShell({
  children,
  title,
  subtitle,
  lastUpdated,
  onRefresh,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  onRefresh?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const routeMeta = [
    {
      path: '/admin/orders',
      title: 'Orders Board',
      subtitle: 'Track and move live tickets through kitchen stages.',
    },
    {
      path: '/admin/menu',
      title: 'Menu Manager',
      subtitle: 'Create, update, and control availability of menu items.',
    },
    {
      path: '/admin/offers',
      title: 'Offers & Combos',
      subtitle: 'Manage promotions, discount codes, and special combos.',
    },
    {
      path: '/admin/users',
      title: 'User Manager',
      subtitle: 'Manage roles, account status, and customer access.',
    },
    {
      path: '/admin/billing',
      title: 'Billing & Revenue',
      subtitle: 'Monitor financial performance, tax, and payment splits.',
    },
    {
      path: '/admin/reservations',
      title: 'Reservations',
      subtitle: 'Manage table bookings and guest requests.',
    },
    {
      path: '/admin/analytics',
      title: 'Analytics',
      subtitle: 'Monitor sales trends, top items, and payment performance.',
    },

    {
      path: '/admin/settings',
      title: 'Settings',
      subtitle: 'Control store operations, charges, and policy preferences.',
    },
    {
      path: '/admin',
      title: 'Admin Dashboard',
      subtitle: 'Operational control center for orders, menu, users, analytics, and settings.',
    },
  ];

  const activeMeta = routeMeta.find((entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`));
  const resolvedTitle = activeMeta?.title || title;
  const resolvedSubtitle = activeMeta?.subtitle || subtitle;

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) {
      if (!mobileOpen) {
        setMobileOpen(true);
        setCollapsed(false);
        return;
      }

      setMobileOpen(false);
      return;
    }

    setCollapsed((current) => !current);
  };

  return (
    <div className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <div className={`${styles.shellBackdrop} ${mobileOpen ? styles.shellBackdropVisible : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      <AdminSidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className={styles.shellMain}>
        <AdminTopbar
          title={resolvedTitle}
          subtitle={resolvedSubtitle}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
          collapsed={collapsed}
          onOpenMenu={handleSidebarToggle}
          onToggleSidebar={handleSidebarToggle}
        />

        <div className={styles.shellContent}>{children}</div>
      </div>
    </div>
  );
}