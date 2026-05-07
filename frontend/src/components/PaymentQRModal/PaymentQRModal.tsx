'use client';

import React, { useState } from 'react';
import styles from './PaymentQRModal.module.css';

interface PaymentQRModalProps {
  totalAmount: number;
  onConfirm: (utr: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function PaymentQRModal({
  totalAmount,
  onConfirm,
  onCancel,
  isProcessing
}: PaymentQRModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [utr, setUtr] = useState('');

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleConfirm = () => {
    if (utr.length >= 8) {
      onConfirm(utr);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2>{step === 1 ? 'Scan & Pay via UPI' : 'Confirm Transaction'}</h2>
          <p>{step === 1 ? 'Pay securely using any UPI app' : 'Enter the details from your payment app'}</p>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.stepIndicator}>
            <div className={`${styles.dot} ${step === 1 ? styles.dotActive : ''}`} />
            <div className={`${styles.dot} ${step === 2 ? styles.dotActive : ''}`} />
          </div>

          {step === 1 ? (
            <>
              <div className={styles.qrContainer}>
                <img src="/payment-qr.webp" alt="Payment QR Code" className={styles.qrImage} />
              </div>
              <div className={styles.paymentInfo}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Scan the QR or use UPI ID:</p>
                <code className={styles.upiId}>8421665617@okbizaxis</code>
                
                <div className={styles.amountBox}>
                  <label>Amount to Pay</label>
                  <span>₹{totalAmount}</span>
                </div>

                <div className={styles.upiLogos}>
                   {/* We can use simple text or small icons if we have them, for now just text or generic logos */}
                   <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>GPay · PhonePe · Paytm · BHIM</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.utrInputContainer}>
                <label htmlFor="utr-input">UTR / Transaction Reference Number</label>
                <input
                  id="utr-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 427891234567"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, ''))}
                  autoFocus
                />
                <p className={styles.helperText}>
                  After completing the payment in your app, go to transaction history to find the 12-digit UTR/Ref number.
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255,107,53,0.05)', borderRadius: '12px', border: '1px solid rgba(255,107,53,0.1)', marginBottom: '1.5rem' }}>
                 <p style={{ fontSize: '0.8rem', color: 'var(--primary)', lineHeight: '1.4' }}>
                   <strong>Note:</strong> Your order will be placed immediately, but it will be <strong>confirmed only after</strong> we verify the transaction ID.
                 </p>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step === 1 ? (
            <>
              <button className={`btn btn-ghost ${styles.backBtn}`} onClick={onCancel}>
                Cancel
              </button>
              <button className={`btn btn-primary ${styles.actionBtn}`} onClick={handleNext}>
                I've Paid — Next →
              </button>
            </>
          ) : (
            <>
              <button className={`btn btn-ghost ${styles.backBtn}`} onClick={handleBack} disabled={isProcessing}>
                ← Back
              </button>
              <button 
                className={`btn btn-primary ${styles.actionBtn}`} 
                onClick={handleConfirm}
                disabled={utr.length < 8 || isProcessing}
              >
                {isProcessing ? 'Placing Order...' : 'Confirm & Place Order ✅'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
