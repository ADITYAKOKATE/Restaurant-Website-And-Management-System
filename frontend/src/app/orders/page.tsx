'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './orders.css';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  orderType: 'dine_in' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  tokenNumber: number;
  deliveryAddress: string;
  specialInstructions: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:          { label: 'Pending',         color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   icon: '⏳' },
  confirmed:        { label: 'Confirmed',        color: '#2ECC71', bg: 'rgba(46,204,113,0.12)', icon: '✅' },
  preparing:        { label: 'Preparing',        color: '#FF6B35', bg: 'rgba(255,107,53,0.12)', icon: '👨‍🍳' },
  ready:            { label: 'Ready to Collect', color: '#2ECC71', bg: 'rgba(46,204,113,0.12)', icon: '🔔' },
  out_for_delivery: { label: 'Out for Delivery', color: '#3498DB', bg: 'rgba(52,152,219,0.12)', icon: '🚴' },
  delivered:        { label: 'Delivered',        color: '#2ECC71', bg: 'rgba(46,204,113,0.12)', icon: '🎉' },
  cancelled:        { label: 'Cancelled',        color: '#FF4757', bg: 'rgba(255,71,87,0.12)',  icon: '❌' },
};

function OrdersContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const newToken = searchParams.get('new');
  const newMethod = searchParams.get('method');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOrders();
    // Poll every 15 seconds for live status updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <main className="page-content section">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-5xl) 0' }}>
          <h2>Please Log In</h2>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content section">
      <div className="container">
        
        {/* ── Success Banner for new order ── */}
        {newToken && (
          <div className="order-success-banner">
            <div className="order-success-left">
              <span className="order-success-emoji">🎉</span>
              <div>
                <h3 className="order-success-title">
                  {newMethod === 'online' ? 'Payment Successful! Order Confirmed!' : 'Order Placed Successfully!'}
                </h3>
                <p className="order-success-sub">
                  {newMethod === 'online'
                    ? 'Your payment has been processed. Your food is being prepared!'
                    : 'Your order is placed. Please pay when your food is delivered or at the counter.'}
                </p>
              </div>
            </div>
            <div className="order-token-highlight">
              <p className="order-token-label">Your Token</p>
              <p className="order-token-number">#{newToken}</p>
              <p className="order-token-hint">Show this at the counter</p>
            </div>
          </div>
        )}

        <div className="section-header">
          <span className="section-tag">Order History</span>
          <h2>My Orders</h2>
          <p>Track all your past and active orders in one place.</p>
        </div>

        {isFetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4xl)' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card glass" style={{ textAlign: 'center', padding: 'var(--space-5xl) var(--space-xl)' }}>
            <span style={{ fontSize: '60px', display: 'block', marginBottom: 'var(--space-md)' }}>📋</span>
            <h3>No orders yet!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
              You haven't placed any orders yet. Start by exploring our menu!
            </p>
            <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <Link key={order._id} href={`/orders/${order._id}`} className="order-card card order-card--clickable">
                  {/* Header Row */}
                  <div className="order-card-header">
                    <div className="order-card-meta">
                      <div className="order-type-badge">
                        {order.orderType === 'dine_in' ? '🍽️ Dine-In' : '🚴 Delivery'}
                      </div>
                      <span className="order-date">{date}</span>
                    </div>

                    <div className="order-token-chip">
                      <span className="order-token-chip-label">Token</span>
                      <span className="order-token-chip-number">#{order.tokenNumber}</span>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="order-status-row">
                    <span
                      className="order-status-badge"
                      style={{ color: statusCfg.color, background: statusCfg.bg }}
                    >
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <span
                      className="order-payment-badge"
                      style={{
                        color: order.paymentStatus === 'paid' ? '#2ECC71' : '#FFD700',
                        background: order.paymentStatus === 'paid' ? 'rgba(46,204,113,0.1)' : 'rgba(255,215,0,0.1)',
                      }}
                    >
                      {order.paymentStatus === 'paid' ? '💳 Paid' : '💵 Payment Pending'}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="order-items-list">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <img src={item.image} alt={item.name} className="order-item-img" />
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">× {item.quantity}</span>
                        <span className="order-item-price">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="order-card-footer">
                    {order.deliveryAddress && (
                      <p className="order-address">📍 {order.deliveryAddress}</p>
                    )}
                    {order.specialInstructions && (
                      <p className="order-instructions">📝 {order.specialInstructions}</p>
                    )}
                    <div className="order-total-row">
                      <div style={{ display: 'flex', gap: 'var(--space-md)', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <span>Subtotal: ₹{order.totalAmount - order.taxAmount - order.deliveryFee}</span>
                        <span>Tax: ₹{order.taxAmount}</span>
                        {order.deliveryFee > 0 && <span>Delivery: ₹{order.deliveryFee}</span>}
                      </div>
                      <div className="order-total-amount">
                        Total: ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="page-content section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" style={{ width: 40, height: 40 }}></div></div>}>
      <OrdersContent />
    </Suspense>
  );
}
