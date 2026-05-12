import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import User from '../models/User';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import Reservation from '../models/Reservation';
import Settings from '../models/Settings';
import Cart from '../models/Cart';
import Offer from '../models/Offer';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/premacha-wada';

const getRelevantImage = (item: any) => {
  const textToSearch = `${item.name} ${item.category} ${item.subCategory}`.toLowerCase();
  if (textToSearch.includes('thali')) return 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('soup')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('chinese') || textToSearch.includes('manchurian') || textToSearch.includes('rice') || textToSearch.includes('noodles')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('raan') || textToSearch.includes('mutton')) return 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('chicken') || textToSearch.includes('murgh')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('paneer') || textToSearch.includes('veg')) return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('drink') || textToSearch.includes('beverage') || textToSearch.includes('lassi')) return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80';
  return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
};

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // ─────────────────────────────────────────────
    // WIPE DATABASE
    // ─────────────────────────────────────────────
    console.log('\n--- Wiping Database ---');
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({}),
      Reservation.deleteMany({}),
      Settings.deleteMany({}),
      Cart.deleteMany({}),
      Offer.deleteMany({}),
    ]);
    console.log('✓ All collections wiped.');

    // ─────────────────────────────────────────────
    // SEED USERS
    // ─────────────────────────────────────────────
    console.log('\n--- Seeding Users ---');
    const commonPasswordHash = await bcrypt.hash('Test@123', 12);
    const kitchenPasswordHash = await bcrypt.hash('kitchen123', 12);
    const deliveryPasswordHash = await bcrypt.hash('delivery123', 12);

    const users = [
      {
        name: 'Premacha Wada Admin',
        email: 'admin@test.com',
        password: commonPasswordHash,
        phone: '9876543210',
        role: 'admin',
      },
      {
        name: 'Kitchen Staff',
        email: 'kitchen@gmail.com',
        password: kitchenPasswordHash,
        phone: '9876543211',
        role: 'kitchen',
      },
      {
        name: 'Delivery Boy',
        email: 'delivery@gmail.com',
        password: deliveryPasswordHash,
        phone: '9876543212',
        role: 'delivery',
      }
    ];

    await User.insertMany(users);
    console.log('✓ Admin, Kitchen, and Delivery users created.');

    // ─────────────────────────────────────────────
    // SEED SETTINGS
    // ─────────────────────────────────────────────
    console.log('\n--- Seeding Default Settings ---');
    await Settings.create({
      storeStatus: 'open',
      minOrderAmount: 200,
      taxRate: 5,
      deliveryFee: 40,
      isPaymentEnabled: true,
      contactPhone: '9876543210',
      contactEmail: 'contact@premachawada.com',
      address: 'Near Main Square, Pune, Maharashtra',
    });
    console.log('✓ Default store settings created.');

    // ─────────────────────────────────────────────
    // SEED MENU
    // ─────────────────────────────────────────────
    console.log('\n--- Seeding Menu Items ---');
    const jsonPath = path.resolve(__dirname, '../../../menuItems.json');
    
    if (fs.existsSync(jsonPath)) {
      const menuData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const processedItems = menuData.map((item: any) => ({
        ...item,
        image: item.image || getRelevantImage(item),
      }));
      await MenuItem.insertMany(processedItems);
      console.log(`✓ Successfully seeded ${processedItems.length} menu items.`);
    } else {
      console.log('⚠ menuItems.json not found, skipping menu seed.');
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('Logins:');
    console.log('  Admin:    admin@test.com / Test@123');
    console.log('  Kitchen:  kitchen@gmail.com / kitchen123');
    console.log('  Delivery: delivery@gmail.com / delivery123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
