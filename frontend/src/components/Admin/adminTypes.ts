export type AdminOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type AdminPaymentMethod = 'online' | 'cod';
export type AdminOrderType = 'delivery' | 'dine_in';

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'kitchen' | 'delivery';
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
  tableNumber?: number;
  status: AdminOrderStatus;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'failed';
  paymentReferenceId?: string;
  tokenNumber: number;
  deliveryAddress: string;
  phone?: string;
  specialInstructions: string;
  assignedTo?: {
    _id: string;
    name: string;
    phone?: string;
  } | null;
  statusHistory?: {
    status: string;
    changedAt: string;
    note?: string;
  }[];
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettingsState {
  isOpen: boolean;
  deliveryCharge: number;
  taxRate: number;
  minimumOrderAmount: number;
  allowOnlinePayments: boolean;
  estimatedPrepTime: number;
  tableCount: number;
  reservationTimeSlots: string[];
}

export interface AdminReservationRecord {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  tableNumber: number;
  date: string;
  timeSlot: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests: string;
  createdAt: string;
}

export interface AdminBillingStats {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalTax: number;
    totalDeliveryFees: number;
    totalDiscounts: number;
  };
  revenueByDay: {
    _id: string;
    revenue: number;
    orders: number;
  }[];
  paymentSplit: {
    _id: string;
    value: number;
    count: number;
  }[];
  typeSplit: {
    _id: string;
    value: number;
    count: number;
  }[];
}

export interface AdminOfferRecord {
  _id: string;
  title: string;
  description: string;
  tag?: string;
  image?: string;
  isActive: boolean;
  discountCode?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
}