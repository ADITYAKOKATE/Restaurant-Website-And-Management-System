import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReservation extends Document {
  user: mongoose.Types.ObjectId;
  tableNumber: number;
  date: Date;
  timeSlot: string; // e.g. "18:00"
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema: Schema<IReservation> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tableNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    specialRequests: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index to prevent double booking of the same table at the same time
// Only applies to pending and confirmed reservations
ReservationSchema.index(
  { tableNumber: 1, date: 1, timeSlot: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } 
  }
);
ReservationSchema.index({ user: 1, date: -1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);

export default Reservation;
