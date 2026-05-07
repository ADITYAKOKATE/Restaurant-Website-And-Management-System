export type AdminOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type AdminPaymentMethod = 'online' | 'cod';
export type AdminOrderType = 'dine_in' | 'delivery';

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminMenuItemRecord {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  image: string;
  isAvailable: boolean;
  isVeg: boolean;
  isBestseller: boolean;
  promotionLabel?: string;
  comboGroup?: string;
}

export interface AdminOrderItemRecord {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminOrderRecord {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  items: AdminOrderItemRecord[];
  totalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  orderType: AdminOrderType;
  status: AdminOrderStatus;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  tokenNumber: number;
  deliveryAddress: string;
  specialInstructions: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettingsState {
  isOpen: boolean;
  deliveryCharge: number;
  taxRate: number;
  minimumOrderAmount: number;
  allowOnlinePayments: boolean;
  kitchenDisplayMode: 'full' | 'compact';
}