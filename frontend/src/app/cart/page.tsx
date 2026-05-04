'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import './cart.css';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, isLoading, fetchCart } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'dine_in'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const taxAmount = Math.round(cartTotal * 0.05);
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const grandTotal = cartTotal + taxAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setOrderError('Please enter your delivery address.');
      return;
    }
    setOrderError('');
    setIsPlacingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderType, paymentMethod, deliveryAddress, phone, specialInstructions }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchCart(); // Refresh cart (will be empty now)
        router.push(`/orders?new=${data.order.tokenNumber}&method=${paymentMethod}`);
      } else {
        setOrderError(data.message || 'Failed to place order.');
      }
    } catch {
      setOrderError('Network error. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!user) {
    return (
      <main className="page-content section">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-5xl) 0' }}>
          <span style={{ fontSize: '60px', display: 'block', marginBottom: 'var(--space-lg)' }}>🔐</span>
          <h2>Please Log In</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            You need to be logged in to view your cart and place an order.
          </p>
          <Link href="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Your Cart</span>
          <h2>Ready to Order?</h2>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4xl)' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="card glass" style={{ textAlign: 'center', padding: 'var(--space-5xl) var(--space-xl)' }}>
            <span style={{ fontSize: '60px', display: 'block', marginBottom: 'var(--space-md)' }}>🛒</span>
            <h3>Your cart is empty</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
              Looks like you haven't added any delicious food yet!
            </p>
            <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── Cart Items ── */}
            <div className="cart-items-col">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item-card card">
                  <div className="cart-item-img">
                    <img src={item.menuItem.image} alt={item.menuItem.name} />
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.menuItem.name}</h4>
                    <p className="cart-item-cat">{item.menuItem.category}</p>
                    <p className="cart-item-price">₹{item.menuItem.price}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}>+</button>
                    </div>
                    <p className="cart-item-subtotal">₹{item.menuItem.price * item.quantity}</p>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.menuItem._id)}
                      aria-label="Remove"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary + Checkout ── */}
            <div className="cart-summary-col">
              <div className="card glass cart-summary-card">
                <h3 className="cart-summary-title">Order Summary</h3>

                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Taxes (5%)</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Delivery Fee</span>
                    <span>{orderType === 'delivery' ? '₹40' : <span style={{ color: 'var(--accent)' }}>FREE (Dine-In)</span>}</span>
                  </div>
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span style={{ color: 'var(--secondary)' }}>₹{grandTotal}</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-lg)' }} onClick={() => setShowCheckout(true)}>
                    Proceed to Checkout →
                  </button>
                ) : (
                  <div className="checkout-form">

                    {/* Order Type */}
                    <div className="checkout-section">
                      <label className="checkout-label">Order Type</label>
                      <div className="toggle-group">
                        <button
                          className={`toggle-btn ${orderType === 'delivery' ? 'toggle-btn--active' : ''}`}
                          onClick={() => setOrderType('delivery')}
                        >
                          🚴 Delivery
                        </button>
                        <button
                          className={`toggle-btn ${orderType === 'dine_in' ? 'toggle-btn--active' : ''}`}
                          onClick={() => setOrderType('dine_in')}
                        >
                          🍽️ Dine-In
                        </button>
                      </div>
                    </div>

                    {/* Delivery Fields */}
                    {orderType === 'delivery' && (
                      <div className="checkout-section">
                        <label className="checkout-label">Delivery Address *</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="Enter your full delivery address..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                        <label className="checkout-label" style={{ marginTop: 'var(--space-sm)' }}>Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="+91 XXXXX XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="checkout-section">
                      <label className="checkout-label">Payment Method</label>
                      <div className="payment-options">
                        <label className={`payment-option ${paymentMethod === 'online' ? 'payment-option--selected' : ''}`}>
                          <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                          <div className="payment-option-content">
                            <span className="payment-option-icon">💳</span>
                            <div>
                              <p className="payment-option-title">Pay Online</p>
                              <p className="payment-option-sub">Order confirmed instantly</p>
                            </div>
                          </div>
                        </label>
                        <label className={`payment-option ${paymentMethod === 'cod' ? 'payment-option--selected' : ''}`}>
                          <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                          <div className="payment-option-content">
                            <span className="payment-option-icon">💵</span>
                            <div>
                              <p className="payment-option-title">Pay on Delivery / At Counter</p>
                              <p className="payment-option-sub">Order placed, pay later</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div className="checkout-section">
                      <label className="checkout-label">Special Instructions (Optional)</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="e.g. Less spicy, extra chutney..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    {orderError && (
                      <p className="form-error" style={{ marginBottom: 'var(--space-sm)' }}>⚠️ {orderError}</p>
                    )}

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? 'Placing Order...' : paymentMethod === 'online' ? '💳 Pay & Place Order' : '✅ Place Order (Pay Later)'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                      onClick={() => setShowCheckout(false)}
                    >
                      ← Back to Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Dine-In Tip */}
              {orderType === 'dine_in' && showCheckout && (
                <div className="dine-in-tip card">
                  <span style={{ fontSize: '28px' }}>🏠</span>
                  <div>
                    <p style={{ fontWeight: 600 }}>Dining In?</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>After placing your order, show your Token Number at the counter to collect your food!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
