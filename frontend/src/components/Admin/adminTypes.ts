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

// ─── POS Types ────────────────────────────────────────────────────────────────
export type POSTableZone = 'INSIDE' | 'OUTSIDE' | 'PARCEL';
export type POSTableStatusType = 'blank' | 'running' | 'kot' | 'printed' | 'paid' | 'reserved';

export interface POSTableStatus {
  tableNumber: number;
  label: string; // e.g. T1, T18, P1
  zone: POSTableZone;
  status: POSTableStatusType;
  orderId?: string;
  totalAmount?: number;
  itemCount?: number;
  minutesElapsed?: number;
  orderCategory?: 'pos' | 'delivery';
  customerName?: string;
  reservedFor?: {
    guestName: string;
    guests: number;
    timeSlot: string;
  };
}

export interface POSOrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface POSActiveOrder {
  _id: string;
  tableNumber: number;
  items: POSOrderItem[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  deliveryFee: number;
  status: AdminOrderStatus;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'failed';
  isKotPrinted: boolean;
  isBillPrinted: boolean;
  tokenNumber: number;
  specialInstructions: string;
  createdAt: string;
  user?: { name?: string; phone?: string; email?: string } | null;
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