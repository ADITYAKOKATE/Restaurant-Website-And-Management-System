'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchDeliveryOrders, pickupOrder, deliverOrder } from './deliveryApi';
import { AdminOrderRecord } from '../Admin/adminTypes';
import DeliveryOrderCard from './DeliveryOrderCard';
import PaymentConfirmModal from './PaymentConfirmModal';

export default function DeliveryBoard() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Payment modal state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRecord | null>(null);

  const loadOrders = async () => {
    try {
      const data = await fetchDeliveryOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live delivery orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePickup = async (order: AdminOrderRecord) => {
    setProcessingId(order._id);
    try {
      const updated = await pickupOrder(order._id);
      setOrders(orders.map((o) => o._id === order._id ? updated : o));
    } catch (err) {
      alert('Failed to pick up order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeliverClick = (order: AdminOrderRecord) => {
    setSelectedOrder(order);
  };

  const handleConfirmDelivery = async (collected: boolean, note: string) => {
    if (!selectedOrder) return;
    setProcessingId(selectedOrder._id);
    try {
      await deliverOrder(selectedOrder._id, collected, note);
      // Remove from active board
      setOrders(orders.filter((o) => o._id !== selectedOrder._id));
      setSelectedOrder(null);
    } catch (err) {
      alert('Failed to confirm delivery');
    } finally {
      setProcessingId(null);
    }
  };

  const ready = useMemo(() => orders.filter(o => o.status === 'ready'), [orders]);
  const inTransit = useMemo(() => orders.filter(o => o.status === 'out_for_delivery'), [orders]);

  if (loading) {
    return <div className="delivery-center"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="delivery-center error">{error}</div>;
  }

  return (
    <div className="delivery-board">
      <div className="delivery-section">
        <div className="delivery-section-header">
          <h2>Ready for Pickup</h2>
          <span className="delivery-count">{ready.length}</span>
        </div>
        <div className="delivery-list">
          {ready.map(order => (
            <DeliveryOrderCard 
              key={order._id} 
              order={order} 
              actionLabel="Pick Up Order"
              processing={processingId === order._id}
              onAction={handlePickup}
            />
          ))}
          {ready.length === 0 && <p className="delivery-empty">No orders ready for pickup.</p>}
        </div>
      </div>

      <div className="delivery-section in-transit">
        <div className="delivery-section-header">
          <h2>My Active Deliveries</h2>
          <span className="delivery-count">{inTransit.length}</span>
        </div>
        <div className="delivery-list">
          {inTransit.map(order => (
            <DeliveryOrderCard 
              key={order._id} 
              order={order} 
              actionLabel="Mark Delivered"
              processing={processingId === order._id}
              onAction={handleDeliverClick}
            />
          ))}
          {inTransit.length === 0 && <p className="delivery-empty">You have no active deliveries.</p>}
        </div>
      </div>

      {selectedOrder && (
        <PaymentConfirmModal
          order={selectedOrder}
          onConfirm={handleConfirmDelivery}
          onCancel={() => setSelectedOrder(null)}
          processing={processingId === selectedOrder._id}
        />
      )}
    </div>
  );
}
