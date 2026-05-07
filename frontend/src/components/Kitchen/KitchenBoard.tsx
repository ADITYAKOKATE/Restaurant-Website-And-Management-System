'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchKitchenOrders, updateKitchenOrderStatus } from './kitchenApi';
import { AdminOrderRecord } from '../Admin/adminTypes';
import KitchenOrderCard from './KitchenOrderCard';

export default function KitchenBoard() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const data = await fetchKitchenOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live kitchen orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (order: AdminOrderRecord, newStatus: 'preparing' | 'ready') => {
    setProcessingId(order._id);
    try {
      const updated = await updateKitchenOrderStatus(order._id, newStatus);
      if (newStatus === 'ready') {
        // Remove from board entirely (it goes to delivery now)
        setOrders(orders.filter((o) => o._id !== order._id));
      } else {
        setOrders(orders.map((o) => o._id === order._id ? updated : o));
      }
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setProcessingId(null);
    }
  };

  const toPrepare = useMemo(() => orders.filter(o => o.status === 'confirmed'), [orders]);
  const preparing = useMemo(() => orders.filter(o => o.status === 'preparing'), [orders]);

  if (loading) {
    return <div className="kitchen-center"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="kitchen-center error">{error}</div>;
  }

  return (
    <div className="kitchen-board">
      <div className="kitchen-lane">
        <div className="kitchen-lane-header">
          <h2>To Prepare</h2>
          <span className="kitchen-count">{toPrepare.length}</span>
        </div>
        <div className="kitchen-lane-list">
          {toPrepare.map(order => (
            <KitchenOrderCard 
              key={order._id} 
              order={order} 
              actionLabel="Start Preparing"
              processing={processingId === order._id}
              onAction={() => handleStatusChange(order, 'preparing')}
            />
          ))}
          {toPrepare.length === 0 && <p className="kitchen-empty">No new orders.</p>}
        </div>
      </div>

      <div className="kitchen-lane preparing">
        <div className="kitchen-lane-header">
          <h2>Preparing</h2>
          <span className="kitchen-count">{preparing.length}</span>
        </div>
        <div className="kitchen-lane-list">
          {preparing.map(order => (
            <KitchenOrderCard 
              key={order._id} 
              order={order} 
              actionLabel="Mark Ready"
              processing={processingId === order._id}
              onAction={() => handleStatusChange(order, 'ready')}
            />
          ))}
          {preparing.length === 0 && <p className="kitchen-empty">Nothing being prepared currently.</p>}
        </div>
      </div>
    </div>
  );
}
