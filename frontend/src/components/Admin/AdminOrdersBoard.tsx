'use client';

import { useMemo, useState } from 'react';
import { AdminBadge, AdminEmptyState, AdminSectionHeader } from './AdminUi';
import { acceptAdminOrder, cancelAdminOrder, verifyAdminPayment } from './adminApi';
import { AdminOrderRecord } from './adminTypes';
import { formatCurrency, formatShortDateTime, getPaymentLabel, getStatusLabel, getStatusTone } from './adminUtils';
import styles from './Admin.module.css';
import { useAdminOrdersData } from './useAdminOrdersData';

type BoardKey = 'pending' | 'verify' | 'confirmed' | 'cancelled';

const columns: Array<{ key: BoardKey; title: string; helper: string }> = [
  { key: 'pending', title: 'Pending Review', helper: 'New orders waiting for confirmation.' },
  { key: 'verify', title: 'Verify Payment', helper: 'Check UPI UTR for online payments.' },
  { key: 'confirmed', title: 'Confirmed', helper: 'Accepted and queued for kitchen prep.' },
  { key: 'cancelled', title: 'Cancelled', helper: 'Rejected or cancelled orders.' },
];

export default function AdminOrdersBoard() {
  const { orders, loading, error, lastUpdated, refresh, setOrders } = useAdminOrdersData(10000);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const initialBoard: Record<BoardKey, AdminOrderRecord[]> = {
      pending: [],
      verify: [],
      confirmed: [],
      cancelled: [],
    };

    return columns.reduce<Record<BoardKey, AdminOrderRecord[]>>((accumulator, column) => {
      if (column.key === 'pending') {
        accumulator[column.key] = orders.filter((order) => order.status === 'pending' && order.paymentStatus !== 'pending_verification');
      } else if (column.key === 'verify') {
        accumulator[column.key] = orders.filter((order) => order.paymentStatus === 'pending_verification');
      } else if (column.key === 'cancelled') {
        accumulator[column.key] = orders.filter((order) => order.status === 'cancelled');
      } else {
        accumulator[column.key] = orders.filter((order) => 
          ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status)
        );
      }
      return accumulator;
    }, initialBoard);
  }, [orders]);

  const handleAccept = async (order: AdminOrderRecord) => {
    if (order.status !== 'pending') return;
    setProcessingId(order._id);
    try {
      const updatedOrder = await acceptAdminOrder(order._id);
      setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    } catch (err) {
      console.error(err);
      alert('Failed to accept order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (order: AdminOrderRecord) => {
    if (order.status !== 'pending' && order.status !== 'confirmed') return;
    
    const reason = window.prompt('Reason for cancellation?');
    if (!reason) return;

    setProcessingId(order._id);
    try {
      const updatedOrder = await cancelAdminOrder(order._id, reason);
      setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    } catch (err) {
      console.error(err);
      alert('Failed to cancel order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyPayment = async (order: AdminOrderRecord, action: 'approve' | 'reject') => {
    setProcessingId(order._id);
    try {
      const updatedOrder = await verifyAdminPayment(order._id, action);
      setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    } catch (err) {
      console.error(err);
      alert('Failed to verify payment');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <section className={styles.panelCard}>
        <AdminSectionHeader
          eyebrow="Order Intake"
          title="Admin Order Board"
          description="Review, accept, or reject incoming orders before they are sent to the kitchen."
          action={<AdminBadge tone="info">Polling every 10 seconds · {lastUpdated}</AdminBadge>}
        />

        {error ? (
          <AdminEmptyState icon="⚠" title="Could not load live orders" description={error} action={<button className={styles.primaryButton} onClick={refresh}>Retry</button>} />
        ) : loading ? (
          <div style={{ minHeight: 320, display: 'grid', placeItems: 'center' }}><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <AdminEmptyState icon="🍽" title="No active orders" description="Live tickets will appear here as soon as customers place new orders." />
        ) : (
          <div className={styles.boardGrid}>
            {columns.map((column) => (
              <section key={column.key} className={styles.boardColumn}>
                <div className={styles.boardColumnHeader}>
                  <div>
                    <p className={styles.boardEyebrow}>{column.key}</p>
                    <h3 className={styles.boardTitle}>{column.title}</h3>
                    <p className={styles.boardCopy}>{column.helper}</p>
                  </div>
                  <span className={styles.boardCount}>{grouped[column.key].length}</span>
                </div>

                <div className={styles.boardList}>
                  {grouped[column.key].map((order) => {
                    return (
                      <article key={order._id} className={styles.orderCard}>
                        <div className={styles.orderMeta}>
                          <div>
                            <div className={styles.orderToken}>#{order.tokenNumber}</div>
                            <p className={styles.orderItemText}>{order.user?.name || 'Guest'} · {formatShortDateTime(order.createdAt)}</p>
                            <p className={styles.orderItemText} style={{ marginTop: 4 }}>📞 {order.user?.phone || 'No phone'}</p>
                          </div>
                          <AdminBadge tone={getStatusTone(order.status) as any}>{getStatusLabel(order.status)}</AdminBadge>
                        </div>

                        {order.deliveryAddress && (
                          <div style={{ padding: '8px', background: 'var(--surface-sunken)', borderRadius: '6px', margin: '12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            📍 {order.deliveryAddress}
                          </div>
                        )}

                        <div className={styles.orderCustomerRow}>
                          <span className={styles.subtlePill}>{order.items.length} items</span>
                          <span className={styles.subtlePill}>{getPaymentLabel(order.paymentMethod)}</span>
                          {order.paymentReferenceId && (
                            <span className={styles.subtlePill} style={{ border: '1px dashed var(--primary)', color: 'var(--primary)' }}>
                              UTR: {order.paymentReferenceId}
                            </span>
                          )}
                        </div>

                        <div className={styles.orderItemsList}>
                          {order.items.slice(0, 3).map((item) => (
                            <div key={`${order._id}-${item.name}`} className={styles.orderLine}>
                              <img src={item.image || 'https://images.unsplash.com/photo-1603893662172-99ed8f4430f6?w=200'} alt={item.name} className={styles.thumb} />
                              <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block' }}>{item.name}</strong>
                                <span className={styles.orderItemText}>Qty {item.quantity}</span>
                              </div>
                              <strong>{formatCurrency(item.price * item.quantity)}</strong>
                            </div>
                          ))}
                        </div>

                        <div className={styles.orderFooter}>
                          <strong>{formatCurrency(order.totalAmount)}</strong>
                          <div className={styles.boardActions}>
                            <AdminBadge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>{order.paymentStatus}</AdminBadge>
                            
                            {order.paymentStatus === 'pending_verification' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className={styles.ghostButton} disabled={processingId === order._id} onClick={() => handleVerifyPayment(order, 'reject')}>
                                  Reject
                                </button>
                                <button className={styles.primaryButton} disabled={processingId === order._id} onClick={() => handleVerifyPayment(order, 'approve')}>
                                  Confirm
                                </button>
                              </div>
                            )}

                            {order.status === 'pending' && order.paymentStatus !== 'pending_verification' && (
                              <>
                                <button className={styles.ghostButton} disabled={processingId === order._id} onClick={() => handleCancel(order)}>
                                  Reject
                                </button>
                                <button className={styles.primaryButton} disabled={processingId === order._id} onClick={() => handleAccept(order)}>
                                  Accept Order
                                </button>
                              </>
                            )}

                            {order.status === 'confirmed' && (
                              <button className={styles.ghostButton} disabled={processingId === order._id} onClick={() => handleCancel(order)}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );
}