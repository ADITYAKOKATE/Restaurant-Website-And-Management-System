import React from 'react';
import { POSActiveOrder } from './adminTypes';

interface PrintableBillProps {
  order: POSActiveOrder | null;
  type?: 'bill' | 'kot';
  restaurantName?: string;
  cashierName?: string;
}

export function PrintableBill({
  order,
  type = 'bill',
  restaurantName = 'HOTEL PREMACHA WADA',
  cashierName = 'biller',
}: PrintableBillProps) {
  
  if (!order) return null;

  const tableLabel = order.tableNumber >= 101
    ? `${order.tableNumber - 100}`
    : `${order.tableNumber}`;

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  if (type === 'kot') {
    return (
      <div style={{ fontFamily: 'monospace', width: '280px', margin: '0 auto', fontSize: '13px', padding: '4px', color: '#000', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold' }}>KOT</h3>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>{restaurantName}</p>
        </div>
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Token:</strong> #{order.tokenNumber}</span>
            <span><strong>{order.tableNumber >= 101 ? `P${tableLabel}` : `Table ${tableLabel}`}</strong></span>
          </div>
          <div><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style={{ borderTop: '1px dashed #000', paddingTop: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', width: '80%', padding: '2px 0', fontSize: '12px' }}>Item</th>
                <th style={{ textAlign: 'right', width: '20%', padding: '2px 0', fontSize: '12px' }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'left', width: '80%', padding: '3px 0', fontSize: '13px', fontWeight: 'bold', wordBreak: 'break-word', verticalAlign: 'top' }}>
                    {item.name}
                  </td>
                  <td style={{ textAlign: 'right', width: '20%', padding: '3px 0', fontSize: '13px', fontWeight: 'bold', verticalAlign: 'top' }}>
                    x{item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {order.specialInstructions && (
          <div style={{ marginTop: '6px', borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '11px' }}>
            <strong>Note:</strong> {order.specialInstructions}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', borderTop: '1px dashed #000', paddingTop: '4px' }}>
          *** KOT — Kitchen Copy ***
        </div>
      </div>
    );
  }

  // Full bill
  return (
    <div style={{ fontFamily: 'monospace', width: '280px', margin: '0 auto', fontSize: '12px', padding: '4px', color: '#000', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h2 style={{ margin: '0 0 3px 0', fontSize: '16px', fontWeight: 'bold' }}>{restaurantName}</h2>
        <div style={{ fontSize: '11px', lineHeight: '1.2' }}>
          GADE WASTI, NEXT TO PERFECT<br />
          VAJAN KATA, NAGAR ROAD,<br />
          WAGHOLI , PUNE -412207
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
      <div style={{ padding: '2px 0', fontSize: '12px', fontWeight: 'bold' }}>
        Name: {order.user?.name || 'Walk-In'}
      </div>
      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Order Info */}
      <div style={{ marginBottom: '6px', fontSize: '11px', lineHeight: '1.4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
          <span>Dine In: {tableLabel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }}>Cashier: {cashierName}</span>
          <span>Bill No.: {order.tokenNumber}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', width: '50%', padding: '2px 0', fontSize: '11px', fontWeight: 'bold' }}>Item</th>
            <th style={{ textAlign: 'right', width: '12%', padding: '2px 0', fontSize: '11px', fontWeight: 'bold' }}>Qty</th>
            <th style={{ textAlign: 'right', width: '18%', padding: '2px 0', fontSize: '11px', fontWeight: 'bold' }}>Price</th>
            <th style={{ textAlign: 'right', width: '20%', padding: '2px 0', fontSize: '11px', fontWeight: 'bold' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderTop: '1px dashed #000' }}><td colSpan={4} style={{ padding: 0 }}></td></tr>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '3px 0', width: '50%', textAlign: 'left', wordBreak: 'break-word', verticalAlign: 'top' }}>
                {item.name}
              </td>
              <td style={{ padding: '3px 0', width: '12%', textAlign: 'right', verticalAlign: 'top' }}>
                {item.quantity}
              </td>
              <td style={{ padding: '3px 0', width: '18%', textAlign: 'right', verticalAlign: 'top' }}>
                {item.price.toFixed(2)}
              </td>
              <td style={{ padding: '3px 0', width: '20%', textAlign: 'right', verticalAlign: 'top' }}>
                {(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Totals Summary */}
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span>Total Qty: {totalQty}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>Sub Total:</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount (if applicable) */}
        {order.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span></span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span>Discount:</span>
              <span>- {order.discountAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* GST (if applicable) */}
        {order.taxAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span></span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span>GST:</span>
              <span>+ {order.taxAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Grand Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '15px', fontWeight: 'bold' }}>
        <span>Grand Total</span>
        <span>₹ {order.totalAmount.toFixed(2)}</span>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', fontSize: '12px' }}>
        THANK YOU VISIT AGAIN !!
      </div>
    </div>
  );
}
