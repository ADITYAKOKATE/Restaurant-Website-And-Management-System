import { AdminOrderRecord } from '../Admin/adminTypes';

const fetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function fetchDeliveryOrders(): Promise<AdminOrderRecord[]> {
  const response = await fetch('/api/orders/delivery/active', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load delivery orders');
  }
  return response.json();
}

export async function pickupOrder(orderId: string): Promise<AdminOrderRecord> {
  const response = await fetch(`/api/orders/delivery/${orderId}/pickup`, {
    ...fetchOptions,
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to pick up order');
  }

  const result = await response.json();
  return result.order;
}

export async function deliverOrder(orderId: string, paymentCollected: boolean, paymentNote?: string): Promise<AdminOrderRecord> {
  const response = await fetch(`/api/orders/delivery/${orderId}/delivered`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ paymentCollected, paymentNote }),
  });

  if (!response.ok) {
    throw new Error('Failed to deliver order');
  }

  const result = await response.json();
  return result.order;
}
