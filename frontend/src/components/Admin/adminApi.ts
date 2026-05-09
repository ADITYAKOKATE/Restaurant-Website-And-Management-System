import { AdminMenuItemRecord, AdminOrderRecord, AdminUserRecord, AdminSettingsState, AdminOfferRecord, AdminBillingStats, AdminReservationRecord } from './adminTypes';

const fetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

type AdminSettingsApiPayload = {
  storeOpen: boolean;
  deliveryCharge: number;
  minimumOrder: number;
  taxRate: number;
  onlinePaymentsEnabled: boolean;
  estimatedPrepTime: number;
  tableCount: number;
  reservationTimeSlots: string[];
};

function mapSettingsFromApi(payload: AdminSettingsApiPayload): AdminSettingsState {
  return {
    isOpen: payload.storeOpen,
    deliveryCharge: Number(payload.deliveryCharge) || 0,
    minimumOrderAmount: Number(payload.minimumOrder) || 0,
    taxRate: Number(payload.taxRate) || 0,
    allowOnlinePayments: payload.onlinePaymentsEnabled,
    estimatedPrepTime: Number(payload.estimatedPrepTime) || 30,
    tableCount: Number(payload.tableCount) || 25,
    reservationTimeSlots: payload.reservationTimeSlots || [],
  };
}

function mapSettingsToApi(settings: AdminSettingsState): AdminSettingsApiPayload {
  return {
    storeOpen: settings.isOpen,
    deliveryCharge: settings.deliveryCharge,
    minimumOrder: settings.minimumOrderAmount,
    taxRate: settings.taxRate,
    onlinePaymentsEnabled: settings.allowOnlinePayments,
    estimatedPrepTime: settings.estimatedPrepTime,
    tableCount: settings.tableCount,
    reservationTimeSlots: settings.reservationTimeSlots,
  };
}

// ─────────────────────────────────────────────
// ORDER APIs
// ─────────────────────────────────────────────
export async function fetchAdminOrders(): Promise<AdminOrderRecord[]> {
  const response = await fetch('/api/orders/admin/all', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load admin orders');
  }
  return response.json();
}

export async function createAdminPOSOrder(payload: {
  items: { menuItemId: string; quantity: number }[];
  paymentMethod: 'online' | 'cod';
  tableNumber?: number;
  discountAmount?: number;
}): Promise<AdminOrderRecord> {
  const response = await fetch('/api/orders/admin/create', {
    ...fetchOptions,
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create POS order');
  }

  const result = await response.json();
  return result.order;
}

export async function acceptAdminOrder(orderId: string): Promise<AdminOrderRecord> {
  const response = await fetch(`/api/orders/admin/${orderId}/accept`, {
    ...fetchOptions,
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to accept order');
  }

  const result = await response.json();
  return result.order;
}

export async function cancelAdminOrder(orderId: string, reason: string): Promise<AdminOrderRecord> {
  const response = await fetch(`/api/orders/admin/${orderId}/cancel`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }

  const result = await response.json();
  return result.order;
}

export async function verifyAdminPayment(orderId: string, action: 'approve' | 'reject'): Promise<AdminOrderRecord> {
  const response = await fetch(`/api/orders/admin/${orderId}/verify-payment`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  const result = await response.json();
  return result.order;
}

// ─────────────────────────────────────────────
// MENU APIs
// ─────────────────────────────────────────────
export async function fetchAdminMenu(): Promise<AdminMenuItemRecord[]> {
  const response = await fetch('/api/menu', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load menu');
  }
  return response.json();
}

export async function createAdminMenuItem(item: Omit<AdminMenuItemRecord, '_id'>): Promise<AdminMenuItemRecord> {
  const response = await fetch('/api/menu', {
    ...fetchOptions,
    method: 'POST',
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }

  const result = await response.json();
  return result.item;
}

export async function updateAdminMenuItem(
  itemId: string,
  updates: Partial<AdminMenuItemRecord>
): Promise<AdminMenuItemRecord> {
  const response = await fetch(`/api/menu/${itemId}`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }

  const result = await response.json();
  return result.item;
}

export async function deleteAdminMenuItem(itemId: string): Promise<void> {
  const response = await fetch(`/api/menu/${itemId}`, {
    ...fetchOptions,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
}

// ─────────────────────────────────────────────
// USER APIs
// ─────────────────────────────────────────────
export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const response = await fetch('/api/users', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load users');
  }
  return response.json();
}

export async function updateAdminUserRole(userId: string, role: 'user' | 'admin' | 'kitchen' | 'delivery'): Promise<AdminUserRecord> {
  const response = await fetch(`/api/users/${userId}/role`, {
    ...fetchOptions,
    method: 'PUT',
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  const result = await response.json();
  return result.user;
}

export async function updateAdminUserBlockStatus(userId: string, isBlocked: boolean): Promise<AdminUserRecord> {
  const response = await fetch(`/api/users/${userId}/block`, {
    ...fetchOptions,
    method: 'PUT',
    body: JSON.stringify({ isBlocked }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user block status');
  }

  const result = await response.json();
  return result.user;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    ...fetchOptions,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}

// ─────────────────────────────────────────────
// SETTINGS APIs
// ─────────────────────────────────────────────
export async function fetchAdminSettings(): Promise<AdminSettingsState> {
  const response = await fetch('/api/settings', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load settings');
  }

  const result = await response.json();
  return mapSettingsFromApi(result.settings as AdminSettingsApiPayload);
}

export async function saveAdminSettings(settings: AdminSettingsState): Promise<AdminSettingsState> {
  const response = await fetch('/api/settings', {
    ...fetchOptions,
    method: 'PUT',
    body: JSON.stringify(mapSettingsToApi(settings)),
  });

  if (!response.ok) {
    throw new Error('Failed to save settings');
  }

  const result = await response.json();
  return mapSettingsFromApi(result.settings as AdminSettingsApiPayload);
}

// ─────────────────────────────────────────────
// OFFER APIs
// ─────────────────────────────────────────────
export async function fetchAdminOffers(): Promise<AdminOfferRecord[]> {
  const response = await fetch('/api/offers/all', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load offers');
  }
  return response.json();
}

export async function createAdminOffer(offer: Omit<AdminOfferRecord, '_id'>): Promise<AdminOfferRecord> {
  const response = await fetch('/api/offers', {
    ...fetchOptions,
    method: 'POST',
    body: JSON.stringify(offer),
  });

  if (!response.ok) {
    throw new Error('Failed to create offer');
  }

  return response.json();
}

export async function updateAdminOffer(
  offerId: string,
  updates: Partial<AdminOfferRecord>
): Promise<AdminOfferRecord> {
  const response = await fetch(`/api/offers/${offerId}`, {
    ...fetchOptions,
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update offer');
  }

  return response.json();
}

export async function deleteAdminOffer(offerId: string): Promise<void> {
  const response = await fetch(`/api/offers/${offerId}`, {
    ...fetchOptions,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete offer');
  }
}

// ─────────────────────────────────────────────
// BILLING APIs
// ─────────────────────────────────────────────
export async function fetchAdminBillingStats(startDate?: string, endDate?: string): Promise<AdminBillingStats> {
  const query = new URLSearchParams();
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);
  
  const response = await fetch(`/api/billing/stats?${query.toString()}`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load billing stats');
  }
  return response.json();
}

// ─────────────────────────────────────────────
// RESERVATION APIs
// ─────────────────────────────────────────────
export async function fetchAdminReservations(date?: string, status?: string): Promise<AdminReservationRecord[]> {
  const query = new URLSearchParams();
  if (date) query.append('date', date);
  if (status) query.append('status', status);
  
  const response = await fetch(`/api/reservations/admin/all?${query.toString()}`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load reservations');
  }
  return response.json();
}

export async function updateAdminReservationStatus(reservationId: string, status: string): Promise<AdminReservationRecord> {
  const response = await fetch(`/api/reservations/admin/${reservationId}/status`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update reservation status');
  }

  const result = await response.json();
  return result.reservation;
}