import { AdminOrderRecord, AdminOrderStatus, AdminPaymentMethod } from './adminTypes';

const boardOrder: AdminOrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

export function formatShortDateTime(value: string | number | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatLongDate(value: string | number | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function getStatusLabel(status: AdminOrderStatus) {
  const labels: Record<AdminOrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return labels[status];
}

export function getStatusTone(status: AdminOrderStatus) {
  if (status === 'delivered') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'preparing' || status === 'out_for_delivery') return 'warning';
  if (status === 'ready' || status === 'confirmed') return 'info';
  return 'muted';
}

export function getPaymentLabel(method: AdminPaymentMethod) {
  return method === 'online' ? 'Online' : 'Cash on Delivery';
}

export function getBoardStatus(order: AdminOrderRecord) {
  if (order.status === 'out_for_delivery') {
    return 'ready' as const;
  }

  if (!boardOrder.includes(order.status as AdminOrderStatus)) {
    return 'ready' as const;
  }

  return order.status as AdminOrderStatus;
}

export function getNextWorkflowStatus(order: AdminOrderRecord): AdminOrderStatus {
  if (order.status === 'pending') return 'confirmed';
  if (order.status === 'confirmed') return 'preparing';
  if (order.status === 'preparing') return order.orderType === 'delivery' ? 'out_for_delivery' : 'ready';
  if (order.status === 'out_for_delivery') return 'delivered';
  if (order.status === 'ready') return 'delivered';
  return order.status;
}

export function isActiveOrder(status: AdminOrderStatus) {
  return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(status);
}

export function groupOrdersByDay(orders: AdminOrderRecord[]) {
  const map = new Map<string, number>();

  for (const order of orders) {
    const key = new Intl.DateTimeFormat('en-IN', { month: 'short', day: '2-digit' }).format(new Date(order.createdAt));
    map.set(key, (map.get(key) || 0) + order.totalAmount);
  }

  return Array.from(map.entries()).map(([day, revenue]) => ({ day, revenue }));
}

export function getWeeklyTrend(orders: AdminOrderRecord[]) {
  const today = new Date();
  const trend = [] as Array<{ day: string; revenue: number; orders: number }>;

  for (let index = 6; index >= 0; index -= 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - index);
    current.setHours(0, 0, 0, 0);

    const next = new Date(current);
    next.setDate(current.getDate() + 1);

    const filtered = orders.filter((order) => {
      const placed = new Date(order.createdAt);
      return placed >= current && placed < next;
    });

    trend.push({
      day: new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(current),
      revenue: filtered.reduce((sum, order) => sum + order.totalAmount, 0),
      orders: filtered.length,
    });
  }

  return trend;
}

export function getPaymentMix(orders: AdminOrderRecord[]) {
  const online = orders.filter((order) => order.paymentMethod === 'online').length;
  const cod = orders.length - online;

  return [
    { name: 'Online', value: online },
    { name: 'COD', value: cod },
  ];
}

export function getOrderTypeMix(orders: AdminOrderRecord[]) {
  const dineIn = orders.filter((order) => order.orderType === 'dine_in').length;
  const delivery = orders.length - dineIn;

  return [
    { name: 'Dine-In', value: dineIn },
    { name: 'Delivery', value: delivery },
  ];
}

export function getTopItems(orders: AdminOrderRecord[]) {
  const counts = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = counts.get(item.name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        counts.set(item.name, {
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }
  }

  return Array.from(counts.values())
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);
}

export function getTopCombos(orders: AdminOrderRecord[]) {
  const combos = new Map<string, { label: string; count: number }>();

  for (const order of orders) {
    const topNames = order.items
      .slice(0, 2)
      .map((item) => item.name)
      .join(' + ');

    if (!topNames) continue;

    const existing = combos.get(topNames);
    if (existing) {
      existing.count += 1;
    } else {
      combos.set(topNames, { label: topNames, count: 1 });
    }
  }

  return Array.from(combos.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
}

export function getDashboardSnapshot(orders: AdminOrderRecord[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter((order) => new Date(order.createdAt) >= today);
  const activeOrders = orders.filter((order) => isActiveOrder(order.status));

  return {
    todayRevenue: todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    activeOrders: activeOrders.length,
    recentOrders: [...orders].sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt)).slice(0, 6),
    statusCounts: boardOrder.map((status) => ({
      status,
      count: orders.filter((order) => getBoardStatus(order) === status).length,
    })),
  };
}