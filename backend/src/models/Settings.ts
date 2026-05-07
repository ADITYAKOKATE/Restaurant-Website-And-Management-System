import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  storeOpen: boolean;
  deliveryCharge: number;
  minimumOrder: number;
  taxRate: number;
  onlinePaymentsEnabled: boolean;
  estimatedPrepTime: number; // minutes
  updatedAt: Date;
}

const SettingsSchema: Schema<ISettings> = new Schema(
  {
    storeOpen: { type: Boolean, default: true },
    deliveryCharge: { type: Number, default: 40 },
    minimumOrder: { type: Number, default: 200 },
    taxRate: { type: Number, default: 5 },
    onlinePaymentsEnabled: { type: Boolean, default: true },
    estimatedPrepTime: { type: Number, default: 30 }, // 30 minutes default
  },
  { timestamps: true }
);

/**
 * Returns the single settings document, creating it with defaults if it doesn't exist.
 */
export async function getOrCreateSettings(): Promise<ISettings> {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
