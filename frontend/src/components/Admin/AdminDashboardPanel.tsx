'use client';

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { AdminMetricCard, AdminSectionHeader, AdminBadge, AdminEmptyState } from './AdminUi';
import { formatCurrency, formatShortDateTime, getDashboardSnapshot, getOrderTypeMix, getPaymentMix, getStatusLabel, getStatusTone, getTopCombos, getWeeklyTrend, isActiveOrder } from './adminUtils';
import { useAdminOrdersData } from './useAdminOrdersData';
import styles from './Admin.module.css';

const chartColors = ['#FF6B35', '#FFD700', '#2ECC71', '#7CB9FF'];

export default function AdminDashboardPanel() {
  const { orders, loading, error, lastUpdated, refresh } = useAdminOrdersData(30000);
  const snapshot = getDashboardSnapshot(orders);
  const topCombos = getTopCombos(orders);
  const weeklyTrend = getWeeklyTrend(orders);
  const paymentMix = getPaymentMix(orders);
  const orderTypes = getOrderTypeMix(orders);

  return (
    <>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <p className={styles.heroEyebrow}>Live Restaurant Operations</p>
          <h2 className={styles.heroTitle}>A premium control room for the entire Premacha Wada business.</h2>
          <p className={styles.heroDescription}>
            Track revenue, orders, kitchen flow, and menu performance from one operational dashboard. The data refreshes automatically every 30 seconds.
          </p>
        </div>
        <div className={styles.boardActions}>
          <AdminBadge tone="info">Polling: 30s</AdminBadge>
          <AdminBadge tone="promo">Last update: {lastUpdated}</AdminBadge>
          <button className={styles.primaryButton} onClick={refresh}>
            Refresh Now
          </button>
        </div>
      </section>

      <section className={styles.cardGrid}>
        <AdminMetricCard icon="₹" label="Today Revenue" value={formatCurrency(snapshot.todayRevenue)} hint="Orders completed or placed today" tone="success" />
        <AdminMetricCard icon="#" label="Total Orders" value={String(snapshot.totalOrders)} hint="All orders captured by the system" tone="info" />
        <AdminMetricCard icon="!" label="Pending Orders" value={String(snapshot.pendingOrders)} hint="Waiting for kitchen confirmation" tone="warning" />
        <AdminMetricCard icon="◉" label="Active Orders" value={String(snapshot.activeOrders)} hint="In-flight kitchen and service work" tone="default" />
      </section>

      <section className={styles.chartGrid}>
        <article className={styles.chartCard}>
          <AdminSectionHeader eyebrow="Revenue Trend" title="Weekly revenue pulse" description="Revenue and order volume for the last 7 days." />
          {loading ? (
            <div style={{ minHeight: 280, display: 'grid', placeItems: 'center' }}>
              <div className="spinner" />
            </div>
          ) : weeklyTrend.length === 0 ? (
            <AdminEmptyState icon="📈" title="No order data yet" description="Once orders arrive, the weekly revenue trend will appear here automatically." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className={styles.chartCard}>
          <AdminSectionHeader eyebrow="Fulfilment Mix" title="Order composition" description="See how dine-in and delivery traffic is balanced." />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={orderTypes} dataKey="value" nameKey="name" outerRadius={104} innerRadius={58} paddingAngle={3}>
                {orderTypes.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className={styles.chartGrid}>
        <article className={styles.chartCard}>
          <AdminSectionHeader eyebrow="Payment Mix" title="Collection methods" description="Online vs cash on delivery split." />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentMix} dataKey="value" nameKey="name" outerRadius={96} innerRadius={48}>
                {paymentMix.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[(index + 1) % chartColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className={styles.chartCard}>
          <AdminSectionHeader eyebrow="Kitchen Flow" title="Order health by status" description="Active status distribution in the live board." />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={snapshot.statusCounts}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="status" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip />
              <Bar dataKey="count" fill="#FFD700" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className={styles.panelCard}>
        <AdminSectionHeader eyebrow="Top Combos" title="Best-selling combinations" description="Heuristically derived from the most frequently paired items in the order stream." />
        <div className={styles.cardGrid}>
          {topCombos.length === 0 ? (
            <AdminEmptyState icon="🍽" title="No combos yet" description="As soon as more orders are captured, the most frequent item combinations will appear here." />
          ) : (
            topCombos.map((combo) => (
              <article key={combo.label} className={styles.compactCard}>
                <div className={styles.metricMeta}>
                  <AdminBadge tone="promo">Combo</AdminBadge>
                  <span className={styles.subtlePill}>{combo.count} orders</span>
                </div>
                <h3 style={{ marginTop: 10, fontSize: 18 }}>{combo.label}</h3>
                <p className={styles.panelCopy}>Common menu pairing currently driving repeat purchases.</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className={styles.panelCard}>
        <AdminSectionHeader eyebrow="Recent Activity" title="Recent orders feed" description="The latest orders in the system, shown newest first." />
        {error ? (
          <AdminEmptyState icon="⚠" title="Unable to load orders" description={error} action={<button className={styles.primaryButton} onClick={refresh}>Retry</button>} />
        ) : loading ? (
          <div style={{ minHeight: 180, display: 'grid', placeItems: 'center' }}><div className="spinner" /></div>
        ) : snapshot.recentOrders.length === 0 ? (
          <AdminEmptyState icon="🧾" title="No recent orders" description="Once customers place new orders, they will stream into this feed automatically." />
        ) : (
          <div className={styles.boardList}>
            {snapshot.recentOrders.map((order) => (
              <article key={order._id} className={styles.orderCard}>
                <div className={styles.orderMeta}>
                  <div>
                    <div className={styles.orderToken}>#{order.tokenNumber}</div>
                    <p className={styles.orderItemText}>{order.user?.name || 'Walk-in Customer'} • {formatShortDateTime(order.createdAt)}</p>
                  </div>
                  <AdminBadge tone={getStatusTone(order.status) as any}>{getStatusLabel(order.status)}</AdminBadge>
                </div>
                <div className={styles.orderItems}>
                  <span className={styles.subtlePill}>{order.items.length} item(s)</span>
                  <span className={styles.subtlePill}>Delivery</span>
                  <span className={styles.subtlePill}>{isActiveOrder(order.status) ? 'Active' : 'Closed'}</span>
                </div>
                <div className={styles.orderFooter}>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                  <span className={styles.orderItemText}>{order.paymentMethod === 'online' ? 'Online' : 'COD'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}