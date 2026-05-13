import React from 'react';
import { POSActiveOrder } from './adminTypes';
import { useAuth } from '../../context/AuthContext';

interface PrintableBillProps {
  order: POSActiveOrder | null;
  type?: 'bill' | 'kot';
  restaurantName?: string;
}

export function PrintableBill({
  order,
  type = 'bill',
  restaurantName = 'HOTEL PREMACHA WADA',
}: PrintableBillProps) {
  const { user } = useAuth();
  
  if (!order) return null;

  const tableLabel = order.tableNumber >= 101
    ? `${order.tableNumber - 100}`
    : `${order.tableNumber}`;

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  if (type === 'kot') {
    return (
      <div style={{ fontFamily: 'monospace', maxWidth: '300px', margin: '0 auto', fontSize: '13px', padding: '8px' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', letterSpacing: '2px' }}>KOT</h3>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{restaurantName}</p>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Token:</strong> #{order.tokenNumber}</span>
            <span><strong>{order.tableNumber >= 101 ? `P${tableLabel}` : `Table ${tableLabel}`}</strong></span>
          </div>
          <div><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px' }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
          ))}
        </div>
        {order.specialInstructions && (
          <div style={{ marginTop: '8px', borderTop: '1px solid #000', paddingTop: '6px', fontSize: '12px' }}>
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
    <div style={{ fontFamily: 'monospace', maxWidth: '350px', margin: '0 auto', fontSize: '14px', padding: '10px', color: '#000' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>{restaurantName}</h2>
        <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
          GADE WASTI, NEXT TO PERFECT<br />
          VAJAN KATA, NAGAR ROAD,<br />
          WAGHOLI , PUNE -412207
        </div>
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
      <div style={{ padding: '4px 0' }}>
        Name: {order.user?.name || ''}
      </div>
      <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>

      {/* Order Info */}
      <div style={{ marginBottom: '10px', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
          <span>Dine In: {tableLabel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier: {user?.name || 'biller'}</span>
          <span>Bill No.: {order.tokenNumber}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 0', fontSize: '13px', fontWeight: 'normal' }}>Item</th>
            <th style={{ textAlign: 'right', padding: '4px 0', fontSize: '13px', fontWeight: 'normal' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '4px 0', fontSize: '13px', fontWeight: 'normal' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '4px 0', fontSize: '13px', fontWeight: 'normal' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderTop: '1px solid #000' }}><td colSpan={4} style={{ padding: 0 }}></td></tr>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '4px 0' }}>{item.name}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>

      {/* Totals Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
        <span>Total Qty: {totalQty}</span>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>Sub Total</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>

      {/* Grand Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '18px', fontWeight: 'bold' }}>
        <span>Grand Total</span>
        <span>₹ {order.totalAmount.toFixed(2)}</span>
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', fontSize: '14px' }}>
        THANK YOU VISIT AGAIN !!
      </div>
    </div>
  );
}
