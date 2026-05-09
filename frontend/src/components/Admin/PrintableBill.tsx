import React from 'react';
import { AdminOrderRecord } from './adminTypes';
import { formatCurrency } from './adminUtils';

export function PrintableBill({ order, restaurantName = "Premacha Wada" }: { order: AdminOrderRecord | null, restaurantName?: string }) {
  if (!order) return null;

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: '400px', margin: '0 auto', fontSize: '14px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{restaurantName}</h2>
        <p style={{ margin: '5px 0' }}>Authentic Taste</p>
        <p style={{ margin: '5px 0', fontSize: '12px' }}>GSTIN: 27AABCU9603R1ZX</p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
        <p style={{ margin: '2px 0' }}><strong>Order No:</strong> {order.tokenNumber || order._id.substring(0, 8)}</p>
        <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p style={{ margin: '2px 0' }}><strong>Type:</strong> {order.orderType.replace('_', ' ').toUpperCase()}</p>
        {order.paymentMethod && <p style={{ margin: '2px 0' }}><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>}
        {order.user?.name && <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {order.user.name}</p>}
      </div>

      <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left' }}>
            <th style={{ padding: '4px 0' }}>Item</th>
            <th style={{ padding: '4px 0', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: '4px 0', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '4px 0', textAlign: 'right' }}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: '4px 0' }}>{item.name}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(order.totalAmount - order.taxAmount - order.deliveryFee)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Tax:</span>
          <span>{formatCurrency(order.taxAmount)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
            <span>Delivery:</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', fontWeight: 'bold', fontSize: '16px' }}>
          <span>Total:</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Thank you for your visit!</p>
        <p style={{ fontSize: '12px' }}>Please come again</p>
      </div>
    </div>
  );
}
