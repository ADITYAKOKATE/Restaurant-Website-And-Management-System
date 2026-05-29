'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from './adminUtils';
import {
  fetchPOSTables, fetchTableActiveOrder, fetchAdminMenu,
  createPOSOrder, addItemsToPOSOrder, removeItemFromPOSOrder,
  updatePOSDiscount, markKOTPrinted, markBillPrinted,
  processPOSPayment, cleanPOSTable, fetchAdminOrders,
} from './adminApi';
import { POSTableStatus, POSActiveOrder, AdminMenuItemRecord, AdminOrderRecord } from './adminTypes';
import { PrintableBill } from './PrintableBill';
import { printHtmlReceipt } from './qzTrayUtils';
import { renderToStaticMarkup } from 'react-dom/server';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

type MainView = 'tables' | 'pos' | 'online';
type OnlineTab = 'walkin' | 'reserved' | 'delivery';
type PayMethod = 'cod' | 'online' | 'card' | 'upi';

const PAYMENT_OPTS: { key: PayMethod; label: string; icon: string }[] = [
  { key: 'cod', label: 'Cash', icon: '💵' },
  { key: 'card', label: 'Card', icon: '💳' },
  { key: 'upi', label: 'UPI', icon: '📱' },
  { key: 'online', label: 'Other', icon: '🔗' },
];

const STATUS_COLOR: Record<string, string> = {
  blank: 'var(--border-subtle)',
  reserved: '#9B59B6', // Purple
  running: '#F39C12',
  kot: '#3498DB',
  printed: '#E67E22',
  paid: '#2ECC71',
};

export default function AdminBillingPanel() {
  const { user } = useAuth();
  const [view, setView] = useState<MainView>('tables');

  // Table grid state
  const [tables, setTables] = useState<POSTableStatus[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);

  // POS order state
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeOrder, setActiveOrder] = useState<POSActiveOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [menu, setMenu] = useState<AdminMenuItemRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pendingItems, setPendingItems] = useState<{ menuItemId: string; quantity: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>('cod');
  const [processing, setProcessing] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);

  // Online orders state
  const [onlineTab, setOnlineTab] = useState<OnlineTab>('walkin');
  const [onlineOrders, setOnlineOrders] = useState<AdminOrderRecord[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);

  // Removed old printOrder state since we print directly via QZ Tray

  // ── Data Loaders ──────────────────────────────────────────────────────────
  const loadTables = useCallback(async () => {
    setTablesLoading(true);
    try { setTables(await fetchPOSTables()); } catch { /* silent */ } finally { setTablesLoading(false); }
  }, []);

  const loadOnlineOrders = useCallback(async (tabToLoad: OnlineTab = onlineTab) => {
    setOnlineLoading(true);
    try { setOnlineOrders(await fetchAdminOrders(tabToLoad)); } catch { /* silent */ } finally { setOnlineLoading(false); }
  }, [onlineTab]);

  useEffect(() => { loadTables(); fetchAdminMenu().then(setMenu); }, [loadTables]);

  // Auto-refresh tables every 30s
  useEffect(() => {
    const id = setInterval(() => { if (view === 'tables') loadTables(); }, 30000);
    return () => clearInterval(id);
  }, [view, loadTables]);

  // (Old print trigger useEffect removed)

  // ── Table Click ───────────────────────────────────────────────────────────
  const openTable = async (t: POSTableStatus) => {
    setSelectedTable(t.tableNumber);
    setActiveOrder(null);
    setPendingItems([]);
    setDiscount(0);
    setPosError(null);
    setOrderLoading(true);
    setView('pos');
    try {
      const order = await fetchTableActiveOrder(t.tableNumber);
      setActiveOrder(order);
      if (order) setDiscount(order.discountAmount);
      const cats = [...new Set((await fetchAdminMenu()).map(i => i.category))];
      if (cats.length) setSelectedCategory(cats[0]);
    } catch { setPosError('Failed to load table data'); }
    finally { setOrderLoading(false); }
  };

  const openNewTable = (tableNum: number) => openTable({ tableNumber: tableNum, label: tableNum >= 101 ? `P${tableNum - 100}` : `T${tableNum}`, zone: tableNum >= 101 ? 'PARCEL' : tableNum >= 19 ? 'OUTSIDE' : 'INSIDE', status: 'blank' });

  // ── Menu helpers ──────────────────────────────────────────────────────────
  const categories = [...new Set(menu.map(i => i.category))];
  const filteredItems = menu.filter(i => i.category === selectedCategory && i.isAvailable);

  const getPendingQty = (menuItemId: string) => pendingItems.find(p => p.menuItemId === menuItemId)?.quantity || 0;

  const addPending = (menuItemId: string) => {
    setPendingItems(prev => {
      const ex = prev.find(p => p.menuItemId === menuItemId);
      return ex ? prev.map(p => p.menuItemId === menuItemId ? { ...p, quantity: p.quantity + 1 } : p)
        : [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const removePending = (menuItemId: string) => {
    setPendingItems(prev => prev.map(p => p.menuItemId === menuItemId ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p).filter(p => p.quantity > 0));
  };

  // ── Order actions ─────────────────────────────────────────────────────────
  const saveItems = useCallback(async () => {
    if (!selectedTable) return;
    if (pendingItems.length === 0) return;
    setProcessing(true); setPosError(null);
    try {
      let order: POSActiveOrder;
      if (!activeOrder) {
        order = await createPOSOrder({ tableNumber: selectedTable, items: pendingItems, paymentMethod: payMethod, discountAmount: discount });
      } else {
        order = await addItemsToPOSOrder(activeOrder._id, { items: pendingItems });
      }
      setActiveOrder(order);
      setPendingItems([]);
    } catch (e: any) { setPosError(e.message); }
    finally { setProcessing(false); }
  }, [selectedTable, activeOrder, pendingItems, payMethod, discount]);

  const removeFromOrder = async (menuItemId: string, delta: number) => {
    if (!activeOrder) return;
    setProcessing(true);
    try { setActiveOrder(await removeItemFromPOSOrder(activeOrder._id, menuItemId, delta)); }
    catch (e: any) { setPosError(e.message); }
    finally { setProcessing(false); }
  };

  const applyDiscount = async (val: number) => {
    setDiscount(val);
    if (!activeOrder) return;
    try { setActiveOrder(await updatePOSDiscount(activeOrder._id, val)); }
    catch { /* silent */ }
  };

  const handleKOT = async (andPrint = false) => {
    if (!activeOrder && pendingItems.length === 0) return;
    setProcessing(true); setPosError(null);
    try {
      // Save any pending items first
      if (pendingItems.length > 0) await saveItems();
      const order = activeOrder || await fetchTableActiveOrder(selectedTable!);
      if (!order) return;
      const updated = await markKOTPrinted(order._id);
      setActiveOrder(updated);
      if (andPrint) { 
        try {
          const html = renderToStaticMarkup(<PrintableBill order={updated} type="kot" cashierName={user?.name} />);
          await printHtmlReceipt(html);
        } catch (printErr: any) {
          setPosError(printErr.message);
        }
      }
      await loadTables();
    } catch (e: any) { setPosError(e.message); }
    finally { setProcessing(false); }
  };

  const handlePrintBill = async () => {
    if (!activeOrder && pendingItems.length === 0) return;
    setProcessing(true); setPosError(null);
    try {
      let currentOrder = activeOrder;
      
      if (pendingItems.length > 0) {
        if (!currentOrder) {
          currentOrder = await createPOSOrder({ tableNumber: selectedTable!, items: pendingItems, paymentMethod: payMethod, discountAmount: discount });
        } else {
          currentOrder = await addItemsToPOSOrder(currentOrder._id, { items: pendingItems });
        }
        setPendingItems([]);
      }

      if (currentOrder) {
        const updated = await markBillPrinted(currentOrder._id);
        setActiveOrder(updated);
        try {
          const html = renderToStaticMarkup(<PrintableBill order={updated} type="bill" cashierName={user?.name} />);
          await printHtmlReceipt(html);
        } catch (printErr: any) {
          setPosError(printErr.message);
        }
        await loadTables();
      }
    } catch (e: any) { setPosError(e.message); }
    finally { setProcessing(false); }
  };

  const handleMarkPaid = async () => {
    if (!activeOrder) return;
    setProcessing(true);
    try {
      const updated = await processPOSPayment(activeOrder._id, payMethod);
      setActiveOrder(updated);
      await loadTables();
      // We don't close the view anymore, let the admin click "Clean Table"
    } catch (e: any) { setPosError(e.message); }
    finally { setProcessing(false); }
  };

  const handleCleanTable = async () => {
    if (!activeOrder) return;
    setProcessing(true);
    try {
      await cleanPOSTable(activeOrder._id);
      await loadTables();
      setView('tables');
      setSelectedTable(null);
      setActiveOrder(null);
    } catch (e: any) { setPosError(e.message); }
    finally { setProcessing(false); }
  };

  // ── Computed order totals (merged active + pending) ───────────────────────
  const allDisplayItems = (() => {
    const map = new Map<string, { name: string; price: number; quantity: number; menuItem: string }>();
    activeOrder?.items.forEach(i => map.set(i.menuItem, { ...i, menuItem: i.menuItem }));
    pendingItems.forEach(p => {
      const mItem = menu.find(m => m._id === p.menuItemId);
      if (!mItem) return;
      const ex = map.get(p.menuItemId);
      map.set(p.menuItemId, ex ? { ...ex, quantity: ex.quantity + p.quantity } : { name: mItem.name, price: mItem.price, quantity: p.quantity, menuItem: p.menuItemId });
    });
    return [...map.values()];
  })();

  const subtotal = allDisplayItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmt = activeOrder ? activeOrder.taxAmount : Math.round(subtotal * 0.05);
  const total = subtotal + taxAmt - discount;

  // ── Zone grouping ─────────────────────────────────────────────────────────
  const insideTables = tables.filter(t => t.zone === 'INSIDE');
  const outsideTables = tables.filter(t => t.zone === 'OUTSIDE');
  const parcelTables = tables.filter(t => t.zone === 'PARCEL');

  const tableLabel = selectedTable ? (selectedTable >= 101 ? `P${selectedTable - 100}` : `T${selectedTable}`) : '';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── TABLE VIEW ───────────────────────────────────────────────────── */}
      {view === 'tables' && (
        <div className={styles.posTableView}>
          {/* Header */}
          <div className={styles.posTableHeader}>
            <div>
              <p className={styles.heroEyebrow}>Restaurant POS</p>
              <h2 className={styles.heroTitle} style={{ margin: '6px 0' }}>Table View</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className={styles.posLegend}>
                {Object.entries({ Blank: 'blank', Reserved: 'reserved', Running: 'running', KOT: 'kot', Printed: 'printed', Paid: 'paid' }).map(([label, key]) => (
                  <span key={key} className={styles.posLegendItem}>
                    <span className={styles.posLegendDot} style={{ background: STATUS_COLOR[key] }} />
                    {label}
                  </span>
                ))}
              </div>
              <button className={styles.ghostButton} onClick={loadTables} style={{ padding: '10px 14px' }}>↻ Refresh</button>
              <button className={styles.primaryButton} onClick={() => { setOnlineLoading(true); setView('online'); loadOnlineOrders(onlineTab); }} style={{ padding: '10px 16px' }}>Orders List</button>
            </div>
          </div>

          {tablesLoading ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><div className="spinner" /></div>
          ) : (
            <div className={styles.posFloor}>
              {/* INSIDE */}
              <div className={styles.posZone}>
                <div className={styles.posZoneLabel}>🏠 INSIDE</div>
                <div className={styles.posTableGrid}>
                  {insideTables.map(t => <TableCard key={t.tableNumber} table={t} onClick={() => openTable(t)} />)}
                </div>
              </div>
              {/* OUTSIDE */}
              <div className={styles.posZone}>
                <div className={styles.posZoneLabel}>🌿 OUTSIDE</div>
                <div className={styles.posTableGrid}>
                  {outsideTables.map(t => <TableCard key={t.tableNumber} table={t} onClick={() => openTable(t)} />)}
                </div>
              </div>
              {/* PARCEL */}
              <div className={styles.posZone}>
                <div className={styles.posZoneLabel}>📦 PARCEL</div>
                <div className={styles.posTableGrid}>
                  {parcelTables.map(t => <TableCard key={t.tableNumber} table={t} onClick={() => openTable(t)} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── POS ORDER INTERFACE ──────────────────────────────────────────── */}
      {view === 'pos' && (
        <div className={styles.posShell}>
          {/* Top bar */}
          <div className={styles.posTopbar}>
            <button className={styles.ghostButton} onClick={() => { setView('tables'); loadTables(); }} style={{ padding: '8px 14px' }}>← Tables</button>
            <span className={styles.posTopbarTitle}>
              {tableLabel} — {activeOrder ? `Order #${activeOrder.tokenNumber}` : 'New Order'}
            </span>
            {activeOrder?.isKotPrinted && <span className={styles.warningPill}>KOT Sent</span>}
            {activeOrder?.isBillPrinted && <span className={styles.infoPill}>Bill Printed</span>}
            {activeOrder?.paymentStatus === 'paid' && <span className={styles.successPill}>✓ Paid</span>}
            {posError && <span className={styles.dangerPill}>⚠ {posError}</span>}
          </div>

          {orderLoading ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 400 }}><div className="spinner" /></div>
          ) : (
            <div className={styles.posLayout}>
              {/* LEFT — Categories */}
              <div className={styles.posCategories}>
                <div className={styles.posCategoryLabel}>Menu</div>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.posCategoryBtn} ${selectedCategory === cat ? styles.posCategoryBtnActive : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* CENTER — Items */}
              <div className={styles.posItems}>
                <div className={styles.posItemsGrid}>
                  {filteredItems.map(item => {
                    const qty = getPendingQty(item._id);
                    return (
                      <div key={item._id} className={styles.posItemCard} onClick={() => addPending(item._id)}>
                        <div className={styles.posItemName}>{item.name}</div>
                        <div className={styles.posItemPrice}>{formatCurrency(item.price)}</div>
                        {qty > 0 && (
                          <div className={styles.posItemBadge} onClick={e => { e.stopPropagation(); removePending(item._id); }}>
                            {qty}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', paddingTop: '2rem' }}>No items in this category</p>
                  )}
                </div>
              </div>

              {/* RIGHT — Order Panel */}
              <div className={styles.posOrderPanel}>
                <div className={styles.posOrderHeader}>
                  <span>Order Items</span>
                  {pendingItems.length > 0 && (
                    <button className={styles.primaryButton} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={saveItems} disabled={processing}>
                      {processing ? '...' : '+ Add to Order'}
                    </button>
                  )}
                </div>

                {/* Items list */}
                <div className={styles.posOrderItems}>
                  {allDisplayItems.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '14px' }}>
                      Select items from the menu →
                    </p>
                  )}
                  {allDisplayItems.map((item, i) => {
                    const isPending = !activeOrder?.items.find(ai => ai.menuItem === item.menuItem);
                    return (
                      <div key={i} className={`${styles.posOrderItem} ${isPending ? styles.posOrderItemPending : ''}`}>
                        <div className={styles.posOrderItemName}>{item.name}</div>
                        <div className={styles.posOrderItemControls}>
                          <button className={styles.posQtyBtn} onClick={() => activeOrder ? removeFromOrder(item.menuItem, -1) : removePending(item.menuItem)}>−</button>
                          <span className={styles.posQty}>{item.quantity}</span>
                          <button className={styles.posQtyBtn} onClick={() => {
                            if (activeOrder) {
                              addItemsToPOSOrder(activeOrder._id, { items: [{ menuItemId: item.menuItem, quantity: 1 }] })
                                .then(setActiveOrder)
                                .catch((e: any) => setPosError(e.message));
                            } else {
                              addPending(item.menuItem);
                            }
                          }}>+</button>
                        </div>
                        <div className={styles.posOrderItemAmt}>{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill summary */}
                <div className={styles.posBillSummary}>
                  <div className={styles.posBillRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className={styles.posBillRow}><span>Tax</span><span>{formatCurrency(taxAmt)}</span></div>
                  <div className={styles.posBillRow}>
                    <span>Discount (₹)</span>
                    <input
                      type="number" min="0"
                      className={styles.posDiscountInput}
                      value={discount}
                      onChange={e => applyDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div className={`${styles.posBillRow} ${styles.posBillTotal}`}>
                    <span>TOTAL</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className={styles.posPaymentRow}>
                  {PAYMENT_OPTS.map(opt => (
                    <button
                      key={opt.key}
                      className={`${styles.posPayBtn} ${payMethod === opt.key ? styles.posPayBtnActive : ''}`}
                      onClick={() => setPayMethod(opt.key)}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <div className={styles.posActions}>
                  <button className={styles.posActionBtn} onClick={() => handleKOT(false)} disabled={processing || allDisplayItems.length === 0}>
                    KOT
                  </button>
                  <button className={styles.posActionBtn} onClick={() => handleKOT(true)} disabled={processing || allDisplayItems.length === 0}>
                    KOT & Print
                  </button>
                  <button className={`${styles.posActionBtn} ${styles.posActionBtnPrint}`} onClick={handlePrintBill} disabled={processing || (!activeOrder && allDisplayItems.length === 0)}>
                    🖨 Save & Print Bill
                  </button>
                  <button className={`${styles.posActionBtn} ${styles.posActionBtnPaid}`} onClick={handleMarkPaid} disabled={processing || !activeOrder || activeOrder.paymentStatus === 'paid'}>
                    ✓ Mark as Paid
                  </button>
                  {activeOrder?.paymentStatus === 'paid' && (
                    <button className={`${styles.posActionBtn}`} onClick={handleCleanTable} disabled={processing} style={{ background: 'var(--surface-sunken)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                      ✨ Clean Table
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ONLINE ORDERS ────────────────────────────────────────────────── */}
      {view === 'online' && (
        <div className={styles.posTableView}>
          <div className={styles.posTableHeader}>
            <div>
              <p className={styles.heroEyebrow}>Billing</p>
              <h2 className={styles.heroTitle} style={{ margin: '6px 0' }}>Orders List</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className={styles.ghostButton} onClick={() => loadOnlineOrders(onlineTab)} style={{ padding: '10px 14px' }}>↻ Refresh</button>
              <button className={styles.primaryButton} onClick={() => setView('tables')} style={{ padding: '10px 16px' }}>← Table View</button>
            </div>
          </div>

          <div className={styles.tabs} style={{ padding: '0 24px', marginBottom: '-10px' }}>
            {(['walkin', 'reserved', 'delivery'] as OnlineTab[]).map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${onlineTab === tab ? styles.tabActive : ''}`}
                onClick={() => { setOnlineTab(tab); loadOnlineOrders(tab); }}
              >
                {tab === 'walkin' ? 'Walk-in Dine-in' : tab === 'reserved' ? 'Reserved Dine-in' : 'Online Delivery'}
              </button>
            ))}
          </div>

          {onlineLoading ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><div className="spinner" /></div>
          ) : (
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th><th>Date</th><th>Customer</th>
                    <th>Type</th><th>Payment</th><th>Status</th><th>Amount</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineOrders.map(order => (
                    <tr key={order._id}>
                      <td><strong>#{order.tokenNumber}</strong></td>
                      <td style={{ fontSize: '12px' }}>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{order.user?.name || 'Walk-in'}</td>
                      <td><span className={styles.subtlePill}>{order.orderType.replace('_', ' ')}</span></td>
                      <td><span className={styles.subtlePill}>{order.paymentMethod?.toUpperCase()}</span></td>
                      <td>
                        <span className={order.paymentStatus === 'paid' ? styles.successPill : styles.warningPill}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                      <td>
                        <button
                          className={styles.ghostButton}
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => {
                            const pos: POSActiveOrder = {
                              _id: order._id, tableNumber: order.tableNumber || 0,
                              items: order.items.map(i => ({ menuItem: i.name, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
                              totalAmount: order.totalAmount, taxAmount: order.taxAmount,
                              discountAmount: 0, deliveryFee: order.deliveryFee,
                              status: order.status, paymentMethod: order.paymentMethod,
                              paymentStatus: order.paymentStatus, isKotPrinted: false,
                              isBillPrinted: false, tokenNumber: order.tokenNumber,
                              specialInstructions: order.specialInstructions, createdAt: order.createdAt,
                              user: order.user,
                            };
                            try {
                              const html = renderToStaticMarkup(<PrintableBill order={pos} type="bill" cashierName={user?.name} />);
                              printHtmlReceipt(html).catch(e => alert(e.message));
                            } catch (e: any) {
                              alert(e.message);
                            }
                          }}
                        >
                          🖨 Print
                        </button>
                      </td>
                    </tr>
                  ))}
                  {onlineOrders.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── TableCard sub-component ────────────────────────────────────────────────────
function TableCard({ table, onClick }: { table: POSTableStatus; onClick: () => void }) {
  const color = STATUS_COLOR[table.status] || 'var(--border-subtle)';
  const isActive = table.status !== 'blank';
  return (
    <button className={styles.posTableCell} onClick={onClick} style={{ borderColor: color, background: isActive ? `${color}18` : 'transparent' }}>
      {table.orderCategory === 'delivery' && (
        <div className={styles.posParcelDelivery}>DELIVERY</div>
      )}
      <div className={styles.posTableCellLabel} style={{ color: isActive ? color : 'var(--text-muted)' }}>{table.label}</div>
      {table.status === 'reserved' && table.reservedFor && (
        <div className={styles.posTableCellMetaReserved}>
          👤 {table.reservedFor.guestName}<br />
          {table.reservedFor.guests} guests · {table.reservedFor.timeSlot}
        </div>
      )}
      {isActive && table.status !== 'reserved' && (
        <>
          <div className={styles.posTableCellAmt}>{formatCurrency(table.totalAmount || 0)}</div>
          <div className={styles.posTableCellMeta}>
            {table.orderCategory === 'delivery' ? table.customerName : `${table.itemCount} items`}
            {table.minutesElapsed !== undefined && ` · ${table.minutesElapsed}m`}
          </div>
          <div className={styles.posTableCellStatus} style={{ color }}>{table.status.toUpperCase()}</div>
        </>
      )}
    </button>
  );
}
