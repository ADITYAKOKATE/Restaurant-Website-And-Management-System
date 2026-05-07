'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PaymentQRModal from '@/components/PaymentQRModal/PaymentQRModal';
import './cart.css';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, isLoading, fetchCart } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderType] = useState<'delivery'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  
  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number; title: string } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const taxAmount = Math.round(cartTotal * 0.05);
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const grandTotal = Math.max(0, cartTotal + taxAmount + deliveryFee - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoMessage(null);
    try {
      const res = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, cartTotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedPromo({
          code: data.code,
          discountAmount: data.discountAmount,
          title: data.title
        });
        setPromoMessage({ text: `🎉 ${data.title} applied! Saved ₹${data.discountAmount}`, type: 'success' });
      } else {
        setAppliedPromo(null);
        setPromoMessage({ text: data.message || 'Invalid promo code', type: 'error' });
      }
    } catch {
      setPromoMessage({ text: 'Error applying promo code', type: 'error' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMessage(null);
  };

  const handlePlaceOrder = async (referenceId?: string) => {
    if (!deliveryAddress.trim()) {
      setOrderError('Please enter your delivery address.');
      return;
    }

    // If online payment and no referenceId, show QR modal first
    if (paymentMethod === 'online' && !referenceId) {
      setShowQrModal(true);
      return;
    }

    setOrderError('');
    setIsPlacingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderType, 
          paymentMethod, 
          deliveryAddress, 
          phone, 
          specialInstructions,
          promoCode: appliedPromo?.code,
          paymentReferenceId: referenceId
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchCart(); // Refresh cart (will be empty now)
        setShowQrModal(false);
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
                    <span>₹40</span>
                  </div>
                  {appliedPromo && (
                    <div className="cart-summary-row" style={{ color: '#2ecc71' }}>
                      <span>Discount ({appliedPromo.code})</span>
                      <span>-₹{appliedPromo.discountAmount}</span>
                    </div>
                  )}
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span style={{ color: 'var(--secondary)' }}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  {appliedPromo ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', padding: '8px 12px', borderRadius: '4px' }}>
                      <div>
                        <strong style={{ color: '#2ecc71', fontSize: '14px', display: 'block' }}>{appliedPromo.code} Applied</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{appliedPromo.title}</span>
                      </div>
                      <button onClick={removePromo} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Enter Promo Code" 
                        className="form-input" 
                        style={{ flex: 1, textTransform: 'uppercase' }}
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        disabled={isApplyingPromo}
                      />
                      <button 
                        className="btn btn-secondary" 
                        onClick={handleApplyPromo}
                        disabled={!promoInput.trim() || isApplyingPromo}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoMessage && (
                    <p style={{ marginTop: '8px', fontSize: '13px', color: promoMessage.type === 'error' ? '#ff4757' : '#2ecc71' }}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>

                {!showCheckout ? (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-lg)' }} onClick={() => setShowCheckout(true)}>
                    Proceed to Checkout →
                  </button>
                ) : (
                  <div className="checkout-form">

                    {/* Delivery Fields */}
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
                      <label className="checkout-label" style={{ marginTop: 'var(--space-sm)' }}>Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

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
                      onClick={() => handlePlaceOrder()}
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


            </div>
          </div>
        )}
      </div>

      {showQrModal && (
        <PaymentQRModal
          totalAmount={grandTotal}
          isProcessing={isPlacingOrder}
          onCancel={() => setShowQrModal(false)}
          onConfirm={(utr) => handlePlaceOrder(utr)}
        />
      )}
    </main>
  );
}
