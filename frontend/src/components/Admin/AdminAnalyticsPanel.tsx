'use client';

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAdminOrdersData } from './useAdminOrdersData';
import { AdminBadge, AdminEmptyState, AdminSectionHeader } from './AdminUi';
import { formatCurrency, getOrderTypeMix, getPaymentMix, getTopItems, getWeeklyTrend } from './adminUtils';
import styles from './Admin.module.css';

const chartColors = ['#FF6B35', '#FFD700', '#2ECC71', '#7CB9FF'];

export default function AdminAnalyticsPanel() {
  const { orders, loading, error, refresh } = useAdminOrdersData(30000);
  const weeklyTrend = getWeeklyTrend(orders);
  const orderTypes = getOrderTypeMix(orders);
  const payments = getPaymentMix(orders);
  const topItems = getTopItems(orders);

  return (
    <>
      <section className={styles.panelCard}>
        <AdminSectionHeader
          eyebrow="Analytics"
          title="Revenue, mix, and product performance"
          description="Understand revenue trends, service mix, and the items driving the highest volume."
          action={<AdminBadge tone="info">Auto-refresh: 30s</AdminBadge>}
        />

        <div className={styles.chartGrid}>
          <article className={styles.chartCard}>
            <AdminSectionHeader eyebrow="Weekly revenue" title="Trend analysis" description="A 7-day pulse of restaurant revenue and order count." />
            {loading ? (
              <div style={{ minHeight: 280, display: 'grid', placeItems: 'center' }}><div className="spinner" /></div>
            ) : weeklyTrend.length === 0 ? (
              <AdminEmptyState icon="📈" title="No analytics data" description="Charts will appear once the first few orders are recorded." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" stroke="#A0A0A0" />
                  <YAxis stroke="#A0A0A0" />
                  <Tooltip contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6B35" fill="url(#analyticsFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </article>

          <article className={styles.chartCard}>
            <AdminSectionHeader eyebrow="Order Type" title="Dine-in vs delivery" description="Mix of service modes across the current order set." />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orderTypes} dataKey="value" nameKey="name" innerRadius={62} outerRadius={102} paddingAngle={4}>
                  {orderTypes.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </article>
        </div>

        <div className={styles.chartGrid}>
          <article className={styles.chartCard}>
            <AdminSectionHeader eyebrow="Payments" title="COD vs online" description="Track payment behavior and cash collection needs." />
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={payments} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48}>
                  {payments.map((entry, index) => <Cell key={entry.name} fill={chartColors[(index + 1) % chartColors.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </article>

          <article className={styles.chartCard}>
            <AdminSectionHeader eyebrow="Top Items" title="Best sellers" description="The menu items generating the most quantity and revenue." />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#A0A0A0" />
                <YAxis type="category" dataKey="name" stroke="#A0A0A0" width={110} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Bar dataKey="revenue" fill="#FFD700" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </div>

        <article className={styles.panelCard}>
          <AdminSectionHeader eyebrow="Key Winners" title="Top selling items" description="These items are the current demand leaders in the kitchen." action={<button className={styles.secondaryButton} onClick={refresh}>Refresh data</button>} />

          {error ? (
            <AdminEmptyState icon="⚠" title="Analytics unavailable" description={error} action={<button className={styles.primaryButton} onClick={refresh}>Retry</button>} />
          ) : topItems.length === 0 ? (
            <AdminEmptyState icon="🍛" title="Waiting for order history" description="The top items section will populate once enough orders are present." />
          ) : (
            <div className={styles.boardList}>
              {topItems.map((item, index) => (
                <div key={item.name} className={styles.orderCard}>
                  <div className={styles.orderMeta}>
                    <div>
                      <p className={styles.boardEyebrow}>#{index + 1}</p>
                      <h3 className={styles.boardTitle}>{item.name}</h3>
                    </div>
                    <AdminBadge tone="promo">{item.quantity} sold</AdminBadge>
                  </div>
                  <div className={styles.orderFooter}>
                    <span className={styles.orderItemText}>Revenue contribution</span>
                    <strong>{formatCurrency(item.revenue)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );
}