import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStatusHistoryEntry {
  status: string;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  appliedPromoCode?: string;
  /** Online delivery only — dine_in removed */
  orderType: 'delivery';
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'failed';
  paymentReferenceId?: string;
  tokenNumber: number;
  deliveryAddress: string;
  phone: string;
  specialInstructions: string;
  /** Delivery boy assigned to this order */
  assignedTo: mongoose.Types.ObjectId | null;
  /** Full audit trail of status changes */
  statusHistory: IStatusHistoryEntry[];
  /** Estimated delivery time set by kitchen when marking ready */
  estimatedDeliveryTime?: Date;
  /** Cancellation reason set by admin */
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const OrderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    appliedPromoCode: { type: String, default: '' },
    orderType: {
      type: String,
      enum: ['delivery'],
      default: 'delivery',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'pending_verification', 'paid', 'failed'],
      default: 'pending',
    },
    paymentReferenceId: { type: String, default: '' },
    tokenNumber: { type: Number, required: true, unique: true },
    deliveryAddress: { type: String, required: true, default: '' },
    phone: { type: String, default: '' },
    specialInstructions: { type: String, default: '' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    estimatedDeliveryTime: { type: Date, default: null },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for efficient queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ assignedTo: 1, status: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
