import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description: string;
  tag?: string;
  image?: string;
  isActive: boolean;
  discountCode?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema<IOffer> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tag: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    discountCode: { type: String, trim: true, uppercase: true, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    discountValue: { type: Number, default: 0, min: 0 },
    minimumOrderValue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// If there's a discount code, it should be unique (but only if it's not empty)
OfferSchema.index(
  { discountCode: 1 },
  { unique: true, partialFilterExpression: { discountCode: { $type: 'string', $ne: '' } } }
);

const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
