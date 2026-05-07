'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import '../orders.css';

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
  discountAmount?: number;
  appliedPromoCode?: string;
  orderType: 'delivery';
  status: string;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'failed';
  tokenNumber: number;
  deliveryAddress: string;
  specialInstructions: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; step: number }> = {
  pending:          { label: 'Order Placed',     color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   icon: '⏳', step: 1 },
  confirmed:        { label: 'Confirmed',        color: '#2ECC71', bg: 'rgba(46,204,113,0.12)', icon: '✅', step: 2 },
  preparing:        { label: 'Preparing',        color: '#FF6B35', bg: 'rgba(255,107,53,0.12)', icon: '👨‍🍳', step: 3 },
  ready:            { label: 'Ready to Collect', color: '#2ECC71', bg: 'rgba(46,204,113,0.12)', icon: '🔔', step: 4 },
  out_for_delivery: { label: 'Out for Delivery', color: '#3498DB', bg: 'rgba(52,152,219,0.12)', icon: '🚴', step: 4 },
  delivered:        { label: 'Delivered',        color: '#2ECC71', bg: 'rgba(46,204,113,0.12)', icon: '🎉', step: 5 },
  cancelled:        { label: 'Cancelled',        color: '#FF4757', bg: 'rgba(255,71,87,0.12)',  icon: '❌', step: 0 },
};

const DELIVERY_STEPS = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrderDetailPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else if (res.status === 404) {
        router.push('/orders');
      }
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!user && !loading) { router.push('/login'); return; }
    if (!user) return;
    fetchOrder();
    // Poll every 15 seconds for live status
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [user, loading, orderId]);

  if (loading || isFetching) {
    return (
      <main className="page-content section">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-5xl)' }}>
          <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
      </main>
    );
  }

  if (!order) return null;

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const steps = DELIVERY_STEPS;
  const currentStep = statusCfg.step;
  const isCancelled = order.status === 'cancelled';
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <main className="page-content section">
      <div className="container" style={{ maxWidth: 780 }}>

        {/* Back */}
        <Link href="/orders" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex' }}>
          ← Back to Orders
        </Link>

        {/* Token Hero */}
        <div className="order-detail-hero card glass">
          <div className="order-detail-hero-left">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Order Token</p>
            <p className="order-detail-token">#{order.tokenNumber}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{date}</p>
            <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-muted)' }}>
              🚴 Delivery
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              className="order-status-badge"
              style={{ color: statusCfg.color, background: statusCfg.bg, fontSize: 16, padding: '8px 16px' }}
            >
              {statusCfg.icon} {statusCfg.label}
            </div>
            <div
              className="order-payment-badge"
              style={{
                marginTop: 8,
                color: order.paymentStatus === 'paid' ? '#2ECC71' : order.paymentStatus === 'pending_verification' ? '#FFD700' : '#FF4757',
                background: order.paymentStatus === 'paid' ? 'rgba(46,204,113,0.1)' : order.paymentStatus === 'pending_verification' ? 'rgba(255,215,0,0.1)' : 'rgba(255,71,87,0.1)',
              }}
            >
              {order.paymentStatus === 'paid' ? '💳 Paid Online' : order.paymentStatus === 'pending_verification' ? '⏳ Verifying Payment' : order.paymentStatus === 'failed' ? '❌ Payment Failed' : '💵 Pay on Delivery'}
            </div>
          </div>
        </div>

        {/* ── Live Status Tracker ── */}
        {!isCancelled && (
          <div className="card order-tracker">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600 }}>Live Order Tracking</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-refreshes every 15s</span>
            </div>
            <div className="tracker-steps">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <div key={step} className="tracker-step">
                    <div className={`tracker-dot ${isDone ? 'tracker-dot--done' : isActive ? 'tracker-dot--active' : ''}`}>
                      {isDone ? '✓' : stepNum}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`tracker-line ${isDone ? 'tracker-line--done' : ''}`} />
                    )}
                    <p className={`tracker-label ${isActive ? 'tracker-label--active' : isDone ? 'tracker-label--done' : ''}`}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Items ── */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            Order Items ({order.items.length})
          </h3>
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

          {/* Bill */}
          <div className="order-bill">
            <div className="order-bill-row">
              <span>Subtotal</span>
              <span>₹{order.totalAmount - order.taxAmount - order.deliveryFee + (order.discountAmount || 0)}</span>
            </div>
            <div className="order-bill-row">
              <span>GST (5%)</span>
              <span>₹{order.taxAmount}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="order-bill-row">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
            )}
            {(order.discountAmount || 0) > 0 && (
              <div className="order-bill-row" style={{ color: '#2ecc71' }}>
                <span>Discount {order.appliedPromoCode ? `(${order.appliedPromoCode})` : ''}</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="order-bill-divider" />
            <div className="order-bill-row order-bill-total">
              <span>Total</span>
              <span style={{ color: 'var(--secondary)' }}>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* ── Payment Verification Banner ── */}
        {order.paymentStatus === 'pending_verification' && (
          <div className="card glass" style={{ border: '1px solid #FFD700', background: 'rgba(255, 215, 0, 0.05)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <span style={{ fontSize: '32px' }}>⏳</span>
              <div>
                <h4 style={{ color: '#FFD700', marginBottom: '4px' }}>Payment Verification Pending</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  We've received your payment reference. Our team is verifying the transaction and will confirm your order shortly.
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Delivery / Dine-In Info */}
        {(order.deliveryAddress || order.specialInstructions) && (
          <div className="card" style={{ padding: 'var(--space-lg) var(--space-xl)' }}>
            {order.deliveryAddress && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>📍 {order.deliveryAddress}</p>
            )}
            {order.specialInstructions && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>📝 {order.specialInstructions}</p>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <Link href="/menu" className="btn btn-primary">Order Again 🍛</Link>
        </div>
      </div>
    </main>
  );
}
