import { useState } from 'react';
import { AdminOrderRecord } from '../Admin/adminTypes';
import { formatCurrency } from '../Admin/adminUtils';

interface PaymentConfirmModalProps {
  order: AdminOrderRecord;
  onConfirm: (collected: boolean, note: string) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
}

export default function PaymentConfirmModal({ order, onConfirm, onCancel, processing }: PaymentConfirmModalProps) {
  const [note, setNote] = useState('');
  const [payMode, setPayMode] = useState<'cash' | 'upi' | null>(null);
  const isOnline = order.paymentMethod === 'online';
  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className="delivery-modal-overlay">
      <div className="delivery-modal">
        <h2 className="delivery-modal-title">Confirm Delivery</h2>
        
        <div className="delivery-modal-details">
          <p><strong>Order:</strong> #{order.tokenNumber}</p>
          <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
          <p>
            <strong>Payment Method:</strong> 
            <span className={`delivery-badge ${isOnline ? 'badge-success' : 'badge-warning'}`}>
              {isOnline ? 'Online (Already Paid)' : 'Cash on Delivery'}
            </span>
          </p>
        </div>

        {!isOnline && !isPaid && (
          <div className="delivery-payment-selector" style={{ marginBottom: '1.5rem' }}>
            <p className="delivery-label" style={{ marginBottom: '1rem' }}>How did the customer pay?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className={`delivery-btn ${payMode === 'cash' ? 'delivery-btn-success' : 'delivery-btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setPayMode('cash')}
              >
                💵 Cash
              </button>
              <button 
                className={`delivery-btn ${payMode === 'upi' ? 'delivery-btn-primary' : 'delivery-btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setPayMode('upi')}
              >
                📱 UPI / QR
              </button>
            </div>

            {payMode === 'upi' && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                <img 
                  src="/payment-qr.webp" 
                  alt="Hotel QR" 
                  style={{ width: '180px', height: 'auto', display: 'block', margin: '0 auto 1rem', borderRadius: '8px' }} 
                />
                <p style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>UPI ID: <strong>8421665617@okbizaxis</strong></p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>Pay {formatCurrency(order.totalAmount)}</p>
              </div>
            )}

            {payMode === 'cash' && (
              <div className="delivery-modal-warning" style={{ marginTop: '1rem' }}>
                ⚠️ Ensure you have collected <strong>{formatCurrency(order.totalAmount)}</strong> in cash.
              </div>
            )}
          </div>
        )}

        {(isOnline || isPaid) && (
          <div className="delivery-modal-warning" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#28a745', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
            ✅ Payment already received ({order.paymentMethod === 'online' ? 'Online' : 'Verified'}).
          </div>
        )}

        <div className="delivery-modal-form">
          <label className="delivery-label">Add Note (Optional)</label>
          <input 
            type="text" 
            className="delivery-input" 
            placeholder="E.g., Left at door" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="delivery-modal-actions">
          <button className="delivery-btn delivery-btn-outline" onClick={onCancel} disabled={processing}>Cancel</button>
          <button 
            className={`delivery-btn ${(isOnline || isPaid) ? 'delivery-btn-primary' : 'delivery-btn-success'}`}
            onClick={() => onConfirm(!(isOnline || isPaid), note)} 
            disabled={processing || (!isOnline && !isPaid && !payMode)}
          >
            {processing ? 'Confirming...' : (isOnline || isPaid) ? 'Confirm Delivered' : payMode === 'upi' ? 'UPI Payment Received' : 'Cash Collected'}
          </button>
        </div>
      </div>
    </div>
  );
}
