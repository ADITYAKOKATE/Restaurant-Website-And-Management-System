'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export default function DeliveryGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login?redirect=/delivery');
    } else if (user.role !== 'admin' && user.role !== 'delivery') {
      router.replace('/');
    } else {
      setAuthorized(true);
    }
  }, [user, loading, router]);

  if (!authorized) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return <>{children}</>;
}
