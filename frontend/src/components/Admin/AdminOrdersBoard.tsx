'use client';

import { useMemo, useState } from 'react';
import { AdminBadge, AdminEmptyState, AdminSectionHeader } from './AdminUi';
import { updateAdminOrderStatus } from './adminApi';
import { AdminOrderRecord, AdminOrderStatus } from './adminTypes';
import { formatCurrency, formatShortDateTime, getBoardStatus, getNextWorkflowStatus, getPaymentLabel, getStatusLabel, getStatusTone } from './adminUtils';
import styles from './Admin.module.css';
import { useAdminOrdersData } from './useAdminOrdersData';

type BoardKey = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

const columns: Array<{ key: BoardKey; title: string; helper: string }> = [
  { key: 'pending', title: 'Pending', helper: 'New tickets waiting for confirmation.' },
  { key: 'confirmed', title: 'Confirmed', helper: 'Accepted and queued for kitchen prep.' },
  { key: 'preparing', title: 'Preparing', helper: 'Kitchen is actively working on these orders.' },
  { key: 'ready', title: 'Ready', helper: 'Ready for counter pickup or dispatch.' },
  { key: 'delivered', title: 'Delivered', helper: 'Completed orders closed by staff.' },
];

export default function AdminOrdersBoard() {
  const { orders, loading, error, lastUpdated, refresh, setOrders } = useAdminOrdersData(10000);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeDropKey, setActiveDropKey] = useState<AdminOrderStatus | null>(null);

  const grouped = useMemo(() => {
    type BoardKey = (typeof columns)[number]['key'];
    const initialBoard: Record<BoardKey, AdminOrderRecord[]> = {
      pending: [],
      confirmed: [],
      preparing: [],
      ready: [],
      delivered: [],
    };

    return columns.reduce<Record<BoardKey, AdminOrderRecord[]>>((accumulator, column) => {
      accumulator[column.key] = orders.filter((order) => getBoardStatus(order) === column.key);
      return accumulator;
    }, initialBoard);
  }, [orders]);

  const moveOrder = async (order: AdminOrderRecord, targetStatus: AdminOrderStatus) => {
    const nextStatus = targetStatus === 'ready' && order.status === 'preparing' ? getNextWorkflowStatus(order) : targetStatus;
    if (nextStatus === order.status) return;

    const previousOrders = orders;
    const updatedOrders = orders.map((entry) => (entry._id === order._id ? { ...entry, status: nextStatus } : entry));
    setOrders(updatedOrders);

    try {
      await updateAdminOrderStatus(order._id, nextStatus);
      await refresh();
    } catch {
      setOrders(previousOrders);
    }
  };

  return (
    <>
      <section className={styles.panelCard}>
        <AdminSectionHeader
          eyebrow="Live Order Management"
          title="Kitchen command board"
          description="Drag cards between lanes or use the action button to push orders through the kitchen workflow."
          action={<AdminBadge tone="info">Polling every 10 seconds · {lastUpdated}</AdminBadge>}
        />

        <div className={styles.boardDropHint}>Tip: drop a ticket on any lane to update its status instantly.</div>

        {error ? (
          <AdminEmptyState icon="⚠" title="Could not load live orders" description={error} action={<button className={styles.primaryButton} onClick={refresh}>Retry</button>} />
        ) : loading ? (
          <div style={{ minHeight: 320, display: 'grid', placeItems: 'center' }}><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <AdminEmptyState icon="🍽" title="No active orders" description="Live tickets will appear here as soon as customers place new orders." />
        ) : (
          <div className={styles.boardGrid}>
            {columns.map((column) => (
              <section
                key={column.key}
                className={`${styles.boardColumn} ${activeDropKey === column.key ? styles.boardColumnActive : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setActiveDropKey(column.key);
                }}
                onDragLeave={() => setActiveDropKey(null)}
                onDrop={async (event) => {
                  event.preventDefault();
                  setActiveDropKey(null);
                  const orderId = event.dataTransfer.getData('text/plain');
                  const order = orders.find((entry) => entry._id === orderId);
                  if (order) {
                    await moveOrder(order, column.key);
                  }
                }}
              >
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
                    const nextStatus = getNextWorkflowStatus(order);

                    return (
                      <article
                        key={order._id}
                        className={`${styles.orderCard} ${draggedId === order._id ? styles.orderDragging : ''}`}
                        draggable
                        onDragStart={(event) => {
                          setDraggedId(order._id);
                          event.dataTransfer.setData('text/plain', order._id);
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setActiveDropKey(null);
                        }}
                      >
                        <div className={styles.orderMeta}>
                          <div>
                            <div className={styles.orderToken}>#{order.tokenNumber}</div>
                            <p className={styles.orderItemText}>{order.user?.name || 'Guest'} · {formatShortDateTime(order.createdAt)}</p>
                          </div>
                          <AdminBadge tone={getStatusTone(order.status) as any}>{getStatusLabel(order.status)}</AdminBadge>
                        </div>

                        <div className={styles.orderCustomerRow}>
                          <span className={styles.subtlePill}>{order.items.length} items</span>
                          <span className={styles.subtlePill}>{getPaymentLabel(order.paymentMethod)}</span>
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
                            <button className={styles.primaryButton} onClick={() => moveOrder(order, nextStatus)}>
                              {nextStatus === order.status ? 'Hold' : `To ${getStatusLabel(nextStatus)}`}
                            </button>
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