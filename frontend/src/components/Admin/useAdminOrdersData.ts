'use client';

import { useEffect, useState } from 'react';
import { fetchAdminOrders } from './adminApi';
import { AdminOrderRecord } from './adminTypes';

export function useAdminOrdersData(refreshIntervalMs = 30000) {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('just now');

  const refresh = async () => {
    try {
      setError(null);
      const data = await fetchAdminOrders();
      setOrders(data || []);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, refreshIntervalMs);
    return () => window.clearInterval(timer);
  }, [refreshIntervalMs]);

  return { orders, loading, error, lastUpdated, refresh, setOrders };
}