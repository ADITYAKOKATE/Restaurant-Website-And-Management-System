import { AdminMenuItemRecord, AdminOrderRecord, AdminUserRecord, AdminSettingsState } from './adminTypes';

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
  kitchenDisplayMode: 'full' | 'compact';
};

function mapSettingsFromApi(payload: AdminSettingsApiPayload): AdminSettingsState {
  return {
    isOpen: payload.storeOpen,
    deliveryCharge: Number(payload.deliveryCharge) || 0,
    minimumOrderAmount: Number(payload.minimumOrder) || 0,
    taxRate: Number(payload.taxRate) || 0,
    allowOnlinePayments: payload.onlinePaymentsEnabled,
    kitchenDisplayMode: payload.kitchenDisplayMode,
  };
}

function mapSettingsToApi(settings: AdminSettingsState): AdminSettingsApiPayload {
  return {
    storeOpen: settings.isOpen,
    deliveryCharge: settings.deliveryCharge,
    minimumOrder: settings.minimumOrderAmount,
    taxRate: settings.taxRate,
    onlinePaymentsEnabled: settings.allowOnlinePayments,
    kitchenDisplayMode: settings.kitchenDisplayMode,
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

export async function updateAdminOrderStatus(orderId: string, status: AdminOrderRecord['status']) {
  const response = await fetch(`/api/orders/admin/${orderId}/status`, {
    ...fetchOptions,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }

  return response.json();
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

export async function updateAdminUserRole(userId: string, role: 'user' | 'admin'): Promise<AdminUserRecord> {
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