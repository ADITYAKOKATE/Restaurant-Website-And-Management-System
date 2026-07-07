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

  const tableLabel =
    order.tableNumber >= 101
      ? `${order.tableNumber - 100}`
      : `${order.tableNumber}`;

  const subtotal = order.items.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const totalQty = order.items.reduce(
    (s, i) => s + i.quantity,
    0
  );

  if (type === 'kot') {
    return (
      <div
        style={{
          fontFamily: '"Courier New", monospace',
          width: '280px',
          margin: '0 auto',
          fontSize: '15px',
          fontWeight: 700,
          padding: '6px',
          color: '#000',
          boxSizing: 'border-box',
          WebkitFontSmoothing: 'none',
          textRendering: 'geometricPrecision',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            borderBottom: '2px dashed #000',
            paddingBottom: '8px',
            marginBottom: '8px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              letterSpacing: '2px',
              fontWeight: 900,
            }}
          >
            KOT
          </h3>

          <p
            style={{
              margin: '4px 0',
              fontWeight: 900,
              fontSize: '15px',
            }}
          >
            {restaurantName}
          </p>
        </div>

        <div
          style={{
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              <strong>Token:</strong> #{order.tokenNumber}
            </span>

            <span>
              <strong>
                {order.tableNumber >= 101
                  ? `P${tableLabel}`
                  : `Table ${tableLabel}`}
              </strong>
            </span>
          </div>

          <div style={{ marginTop: '4px' }}>
            <strong>Time:</strong>{' '}
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <div
          style={{
            borderTop: '2px dashed #000',
            paddingTop: '8px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '2px dashed #000',
                }}
              >
                <th
                  style={{
                    textAlign: 'left',
                    width: '80%',
                    padding: '3px 0',
                    fontSize: '14px',
                    fontWeight: 900,
                  }}
                >
                  Item
                </th>

                <th
                  style={{
                    textAlign: 'right',
                    width: '20%',
                    padding: '3px 0',
                    fontSize: '14px',
                    fontWeight: 900,
                  }}
                >
                  Qty
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td
                    style={{
                      textAlign: 'left',
                      width: '80%',
                      padding: '5px 0',
                      fontSize: '15px',
                      fontWeight: 900,
                      wordBreak: 'break-word',
                      verticalAlign: 'top',
                      color: '#000',
                    }}
                  >
                    {item.name}
                  </td>

                  <td
                    style={{
                      textAlign: 'right',
                      width: '20%',
                      padding: '5px 0',
                      fontSize: '15px',
                      fontWeight: 900,
                      verticalAlign: 'top',
                      color: '#000',
                    }}
                  >
                    x{item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.specialInstructions && (
          <div
            style={{
              marginTop: '8px',
              borderTop: '2px dashed #000',
              paddingTop: '6px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <strong>Note:</strong> {order.specialInstructions}
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '10px',
            fontSize: '13px',
            fontWeight: 900,
            borderTop: '2px dashed #000',
            paddingTop: '6px',
          }}
        >
          *** KOT — Kitchen Copy ***
        </div>
      </div>
    );
  }

  // Full bill starts here...
// Full bill
return (
  <div
    style={{
      fontFamily: '"Courier New", monospace',
      width: '280px',
      margin: '0 auto',
      fontSize: '15px',
      fontWeight: 700,
      padding: '6px',
      color: '#000',
      boxSizing: 'border-box',
      WebkitFontSmoothing: 'none',
      textRendering: 'geometricPrecision',
    }}
  >
    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <h2
        style={{
          margin: '0 0 4px 0',
          fontSize: '18px',
          fontWeight: 900,
        }}
      >
        {restaurantName}
      </h2>

      <div
        style={{
          fontSize: '13px',
          lineHeight: '1.4',
          fontWeight: 700,
        }}
      >
        GADE WASTI, NEXT TO PERFECT
        <br />
        VAJAN KATA, NAGAR ROAD,
        <br />
        WAGHOLI, PUNE - 412207
      </div>
    </div>

    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

    <div
      style={{
        padding: '4px 0',
        fontSize: '14px',
        fontWeight: 900,
      }}
    >
      Name: {order.user?.name || 'Walk-In'}
    </div>

    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

    {/* Order Info */}

    <div
      style={{
        marginBottom: '8px',
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          Date:{' '}
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}
        </span>

        <span>Dine In: {tableLabel}</span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '3px',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '170px',
          }}
        >
          Cashier: {cashierName}
        </span>

        <span>Bill No.: {order.tokenNumber}</span>
      </div>
    </div>

    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

    {/* Items */}

    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              textAlign: 'left',
              width: '50%',
              padding: '4px 0',
              fontSize: '14px',
              fontWeight: 900,
            }}
          >
            Item
          </th>

          <th
            style={{
              textAlign: 'right',
              width: '12%',
              padding: '4px 0',
              fontSize: '14px',
              fontWeight: 900,
            }}
          >
            Qty
          </th>

          <th
            style={{
              textAlign: 'right',
              width: '18%',
              padding: '4px 0',
              fontSize: '14px',
              fontWeight: 900,
            }}
          >
            Price
          </th>

          <th
            style={{
              textAlign: 'right',
              width: '20%',
              padding: '4px 0',
              fontSize: '14px',
              fontWeight: 900,
            }}
          >
            Amount
          </th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td
            colSpan={4}
            style={{
              borderTop: '2px dashed #000',
            }}
          />
        </tr>

        {order.items.map((item, i) => (
          <tr key={i}>
            <td
              style={{
                padding: '5px 0',
                fontSize: '15px',
                fontWeight: 700,
                wordBreak: 'break-word',
              }}
            >
              {item.name}
            </td>

            <td
              style={{
                padding: '5px 0',
                textAlign: 'right',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {item.quantity}
            </td>

            <td
              style={{
                padding: '5px 0',
                textAlign: 'right',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {item.price.toFixed(2)}
            </td>

            <td
              style={{
                padding: '5px 0',
                textAlign: 'right',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

    {/* Totals */}

    <div
      style={{
        fontSize: '14px',
        lineHeight: '1.6',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Total Qty : {totalQty}</span>

        <span>₹ {subtotal.toFixed(2)}</span>
      </div>

      {order.discountAmount > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Discount</span>

          <span>-₹ {order.discountAmount.toFixed(2)}</span>
        </div>
      )}

      {order.taxAmount > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>GST</span>

          <span>₹ {order.taxAmount.toFixed(2)}</span>
        </div>
      )}
    </div>

    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

    {/* Grand Total */}

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '18px',
        fontWeight: 900,
        padding: '5px 0',
      }}
    >
      <span>GRAND TOTAL</span>

      <span>₹ {order.totalAmount.toFixed(2)}</span>
    </div>

    <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

    <div
      style={{
        textAlign: 'center',
        marginTop: '10px',
        fontSize: '14px',
        fontWeight: 900,
      }}
    >
      THANK YOU
      <br />
      VISIT AGAIN !!
    </div>
  </div>
);
}
