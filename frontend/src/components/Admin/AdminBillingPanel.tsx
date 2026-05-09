'use client';

import React, { useState, useEffect } from 'react';
import { AdminSectionHeader, AdminEmptyState, AdminBadge } from './AdminUi';
import { formatCurrency } from './adminUtils';
import { fetchAdminOrders, fetchAdminMenu, createAdminPOSOrder } from './adminApi';
import { AdminOrderRecord, AdminMenuItemRecord } from './adminTypes';
import { PrintableBill } from './PrintableBill';
import styles from './Admin.module.css';

type TabType = 'online' | 'offline' | 'pos';

export default function AdminBillingPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('online');
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [menu, setMenu] = useState<AdminMenuItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // POS State
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [posItems, setPosItems] = useState<{ menuItemId: string; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Print State
  const [printOrder, setPrintOrder] = useState<AdminOrderRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, menuData] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminMenu()
      ]);
      setOrders(ordersData);
      setMenu(menuData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (printOrder) {
      setTimeout(() => {
        window.print();
        setPrintOrder(null);
      }, 500); // Small delay to allow the DOM to render the printable bill
    }
  }, [printOrder]);

  const handleCreatePOSOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posItems.length === 0) {
      alert('Please add at least one item.');
      return;
    }
    
    setIsCreatingOrder(true);
    try {
      const newOrder = await createAdminPOSOrder({
        items: posItems,
        paymentMethod,
        tableNumber: selectedTable ? parseInt(selectedTable, 10) : undefined,
        discountAmount,
      });
      await loadData();
      // Clear form
      setPosItems([]);
      setSelectedTable('');
      setDiscountAmount(0);
      setPrintOrder(newOrder); // Automatically print the new order
    } catch (err: any) {
      alert(err.message || 'Error creating POS order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const addItemToPOS = (menuItemId: string) => {
    if (!menuItemId) return;
    setPosItems(prev => {
      const existing = prev.find(item => item.menuItemId === menuItemId);
      if (existing) {
        return prev.map(item => item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const updatePOSItemQuantity = (menuItemId: string, delta: number) => {
    setPosItems(prev => {
      return prev.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  if (loading && orders.length === 0) {
    return <div style={{ minHeight: 400, display: 'grid', placeItems: 'center' }}><div className="spinner" /></div>;
  }

  const onlineOrders = orders.filter(o => o.paymentMethod === 'online');
  const offlineOrders = orders.filter(o => o.paymentMethod === 'cod');

  const calculatePOSTotal = () => {
    const subtotal = posItems.reduce((acc, curr) => {
      const mItem = menu.find(m => m._id === curr.menuItemId);
      return acc + (mItem?.price || 0) * curr.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.05); // Assuming 5% tax for display, backend handles actual
    return subtotal + tax - discountAmount;
  };

  return (
    <>
      {/* Hidden printable bill container */}
      <div className={styles.printArea}>
        {printOrder && <PrintableBill order={printOrder} />}
      </div>

      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <p className={styles.heroEyebrow}>Financial Control</p>
          <h2 className={styles.heroTitle}>Billing & POS</h2>
          <p className={styles.heroDescription}>
            Manage online and offline payments, create new table orders, and generate print-ready bills.
          </p>
        </div>
      </section>

      {error && (
        <section style={{ marginBottom: '2rem' }}>
          <AdminEmptyState icon="⚠" title="Error loading data" description={error} action={<button onClick={loadData} className={styles.primaryButton}>Retry</button>} />
        </section>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          className={activeTab === 'online' ? styles.primaryButton : styles.ghostButton}
          onClick={() => setActiveTab('online')}
          style={{ padding: '10px 20px', borderRadius: '12px 12px 0 0' }}
        >
          Online Payments
        </button>
        <button
          className={activeTab === 'offline' ? styles.primaryButton : styles.ghostButton}
          onClick={() => setActiveTab('offline')}
          style={{ padding: '10px 20px', borderRadius: '12px 12px 0 0' }}
        >
          Offline Payments (COD)
        </button>
        <button
          className={activeTab === 'pos' ? styles.primaryButton : styles.ghostButton}
          onClick={() => setActiveTab('pos')}
          style={{ padding: '10px 20px', borderRadius: '12px 12px 0 0', marginLeft: 'auto', background: activeTab === 'pos' ? '#FF6B35' : '' }}
        >
          + New POS Order
        </button>
      </div>

      {activeTab === 'pos' && (
        <section className={styles.panelCard}>
          <AdminSectionHeader title="Point of Sale" description="Create a new dine-in order and print the bill." />
          <form onSubmit={handleCreatePOSOrder} className={styles.formGrid}>
            <div>
              <label className={styles.settingsEyebrow} style={{ display: 'block', marginBottom: '8px' }}>Table Number</label>
              <input
                type="number"
                className={styles.textInput}
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className={styles.settingsEyebrow} style={{ display: 'block', marginBottom: '8px' }}>Payment Method</label>
              <select
                className={styles.selectInput}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cod')}
              >
                <option value="cod">Cash / Offline</option>
                <option value="online">Online / UPI</option>
              </select>
            </div>
            
            <div className={styles.fullSpan} style={{ marginTop: '1rem' }}>
              <label className={styles.settingsEyebrow} style={{ display: 'block', marginBottom: '8px' }}>Add Items</label>
              <select
                className={styles.selectInput}
                onChange={(e) => { addItemToPOS(e.target.value); e.target.value = ''; }}
                defaultValue=""
              >
                <option value="" disabled>Select a menu item...</option>
                {menu.map(item => (
                  <option key={item._id} value={item._id}>{item.name} - {formatCurrency(item.price)}</option>
                ))}
              </select>
            </div>

            {posItems.length > 0 && (
              <div className={styles.fullSpan}>
                <div className={styles.tableCard}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posItems.map(item => {
                        const mItem = menu.find(m => m._id === item.menuItemId);
                        if (!mItem) return null;
                        return (
                          <tr key={item.menuItemId}>
                            <td>{mItem.name}</td>
                            <td>{formatCurrency(mItem.price)}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button type="button" onClick={() => updatePOSItemQuantity(item.menuItemId, -1)} className={styles.ghostButton} style={{ padding: '4px 8px' }}>-</button>
                                <span>{item.quantity}</span>
                                <button type="button" onClick={() => updatePOSItemQuantity(item.menuItemId, 1)} className={styles.ghostButton} style={{ padding: '4px 8px' }}>+</button>
                              </div>
                            </td>
                            <td>{formatCurrency(mItem.price * item.quantity)}</td>
                            <td>
                              <button type="button" onClick={() => updatePOSItemQuantity(item.menuItemId, -item.quantity)} className={styles.dangerButton} style={{ padding: '4px 8px' }}>Remove</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingRight: '1rem', gap: '2rem' }}>
                     <div>
                       <label className={styles.settingsEyebrow}>Discount (₹)</label>
                       <input type="number" className={styles.textInput} style={{ width: '100px', marginLeft: '10px' }} value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} />
                     </div>
                     <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                       Est. Total: {formatCurrency(calculatePOSTotal())}
                     </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.fullSpan} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className={styles.primaryButton} disabled={isCreatingOrder || posItems.length === 0}>
                {isCreatingOrder ? 'Creating...' : 'Create Order & Print Bill'}
              </button>
            </div>
          </form>
        </section>
      )}

      {(activeTab === 'online' || activeTab === 'offline') && (
        <section className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order / Table</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'online' ? onlineOrders : offlineOrders).map((order) => (
                <tr key={order._id}>
                  <td>
                    <div><strong>#{order.tokenNumber}</strong></div>
                    {order.tableNumber && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Table: {order.tableNumber}</div>}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.orderType.replace('_', ' ')}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{order.user?.name || 'Walk-in'}</td>
                  <td>
                    <AdminBadge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {order.paymentStatus}
                    </AdminBadge>
                  </td>
                  <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                  <td>
                    <button 
                      className={styles.ghostButton} 
                      onClick={() => setPrintOrder(order)}
                    >
                      🖨 Print Bill
                    </button>
                  </td>
                </tr>
              ))}
              {(activeTab === 'online' ? onlineOrders : offlineOrders).length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No {activeTab} payment orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
