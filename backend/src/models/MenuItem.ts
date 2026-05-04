import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  image: string;
  isAvailable: boolean;
  isVeg: boolean;
  isBestseller: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema<IMenuItem> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
