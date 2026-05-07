import { AdminOrderRecord } from '../Admin/adminTypes';

const fetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function fetchKitchenOrders(): Promise<AdminOrderRecord[]> {
  const response = await fetch('/api/orders/kitchen/active', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load kitchen orders');
  }
  return response.json();
}

export async function updateKitchenOrderStatus(orderId: string, status: 'preparing' | 'ready'): Promise<AdminOrderRecord> {
  const response = await fetch(`/api/orders/kitchen/${orderId}/status`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }

  const result = await response.json();
  return result.order;
}
