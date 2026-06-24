import { AdminMenuItemRecord, AdminOrderRecord, AdminUserRecord, AdminSettingsState, AdminOfferRecord, AdminReservationRecord, POSTableStatus, POSActiveOrder } from './adminTypes';

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
export async function fetchAdminOrders(category?: string): Promise<AdminOrderRecord[]> {
  const url = category ? `/api/orders/admin/all?category=${category}` : '/api/orders/admin/all';
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to load admin orders');
  }
  return response.json();
}

// createAdminPOSOrder is superseded by createPOSOrder in the billing section below

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
// POS & BILLING APIs
// ─────────────────────────────────────────────
export async function fetchPOSTables(): Promise<POSTableStatus[]> {
  const response = await fetch('/api/billing/tables', { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to load table status');
  return response.json();
}

export async function fetchTableActiveOrder(tableNumber: number): Promise<POSActiveOrder | null> {
  const response = await fetch(`/api/billing/table/${tableNumber}/order`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to load table order');
  const data = await response.json();
  return data.order;
}

export async function createPOSOrder(payload: {
  tableNumber: number;
  items: { menuItemId: string; quantity: number }[];
  paymentMethod?: string;
  discountAmount?: number;
  specialInstructions?: string;
}): Promise<POSActiveOrder> {
  const response = await fetch('/api/billing/pos/order', {
    ...fetchOptions,
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create POS order');
  }
  const data = await response.json();
  return data.order;
}

export async function addItemsToPOSOrder(
  orderId: string,
  payload: { items: { menuItemId: string; quantity: number }[]; discountAmount?: number }
): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/add-items`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add items');
  }
  return (await response.json()).order;
}

export async function updatePOSDiscount(orderId: string, discountAmount: number): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/discount`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ discountAmount }),
  });
  if (!response.ok) throw new Error('Failed to update discount');
  return (await response.json()).order;
}

export async function removeItemFromPOSOrder(orderId: string, menuItemId: string | null, delta: number, customItemName?: string): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/remove-item`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ menuItemId, customItemName, delta }),
  });
  if (!response.ok) throw new Error('Failed to update item quantity');
  return (await response.json()).order;
}

export async function markKOTPrinted(orderId: string): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/kot`, {
    ...fetchOptions,
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to mark KOT');
  return (await response.json()).order;
}

export async function markBillPrinted(orderId: string): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/bill-printed`, {
    ...fetchOptions,
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to mark bill printed');
  return (await response.json()).order;
}

export async function processPOSPayment(orderId: string, paymentMethod: string): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/payment`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ paymentMethod }),
  });
  if (!response.ok) throw new Error('Failed to process payment');
  return (await response.json()).order;
}

export async function cleanPOSTable(orderId: string): Promise<POSActiveOrder> {
  const response = await fetch(`/api/billing/pos/order/${orderId}/clean`, {
    ...fetchOptions,
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to clean table');
  return (await response.json()).order;
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