import React from 'react';
import { POSActiveOrder } from './adminTypes';
import { formatCurrency } from './adminUtils';

interface PrintableBillProps {
  order: POSActiveOrder | null;
  type?: 'bill' | 'kot';
  restaurantName?: string;
}

export function PrintableBill({
  order,
  type = 'bill',
  restaurantName = 'Premacha Wada',
}: PrintableBillProps) {
  if (!order) return null;

  const tableLabel = order.tableNumber >= 101
    ? `P${order.tableNumber - 100}`
    : `Table ${order.tableNumber}`;

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (type === 'kot') {
    return (
      <div style={{ fontFamily: 'monospace', maxWidth: '300px', margin: '0 auto', fontSize: '13px', padding: '8px' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', letterSpacing: '2px' }}>KOT</h3>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{restaurantName}</p>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Token:</strong> #{order.tokenNumber}</span>
            <span><strong>{tableLabel}</strong></span>
          </div>
          <div><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style={{ borderTop: '1px dashed #000', paddingTop: '8px' }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
          ))}
        </div>
        {order.specialInstructions && (
          <div style={{ marginTop: '8px', borderTop: '1px dashed #000', paddingTop: '6px', fontSize: '12px' }}>
            <strong>Note:</strong> {order.specialInstructions}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px' }}>
          *** KOT — Kitchen Copy ***
        </div>
      </div>
    );
  }

  // Full bill
  return (
    <div style={{ fontFamily: 'monospace', maxWidth: '380px', margin: '0 auto', fontSize: '13px', padding: '8px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '2px' }}>{restaurantName}</h2>
        <p style={{ margin: '4px 0', fontSize: '12px' }}>Authentic Maharashtrian Cuisine</p>
        <p style={{ margin: '2px 0', fontSize: '11px' }}>GSTIN: 27AABCU9603R1ZX</p>
        <p style={{ margin: '2px 0', fontSize: '11px' }}>Tel: 07969 223344</p>
      </div>

      {/* Order Info */}
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Bill No:</strong> #{order.tokenNumber}</span>
          <span><strong>{tableLabel}</strong></span>
        </div>
        <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        {order.user?.name && <div><strong>Guest:</strong> {order.user.name}</div>}
        <div><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()}</div>
      </div>

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ textAlign: 'left', padding: '4px 2px', fontSize: '12px' }}>Item</th>
            <th style={{ textAlign: 'center', padding: '4px 2px', fontSize: '12px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', fontSize: '12px' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', fontSize: '12px' }}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '3px 2px' }}>{item.name}</td>
              <td style={{ padding: '3px 2px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '3px 2px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
              <td style={{ padding: '3px 2px', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '1px dashed #000', paddingTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {order.taxAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>GST / Tax</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
        )}
        {order.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>Discount</span>
            <span>- {formatCurrency(order.discountAmount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed #000', marginTop: '4px', fontWeight: 'bold', fontSize: '16px' }}>
          <span>TOTAL</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        {order.paymentStatus === 'paid' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#2ECC71' }}>
            <span>✓ PAID</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Thank you for dining with us!</p>
        <p style={{ margin: '2px 0' }}>Please visit again</p>
        <p style={{ margin: '6px 0', fontSize: '11px' }}>— Premacha Wada —</p>
      </div>
    </div>
  );
}
