import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import MenuItem from '../models/MenuItem';
import User from '../models/User';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/premacha-vada';

const getRelevantImage = (item: any) => {
  const textToSearch = `${item.name} ${item.category} ${item.subCategory}`.toLowerCase();
  
  if (textToSearch.includes('thali')) return 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('soup')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('chinese') || textToSearch.includes('manchurian') || textToSearch.includes('rice') || textToSearch.includes('noodles')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('raan') || textToSearch.includes('mutton')) return 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('chicken') || textToSearch.includes('murgh')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('paneer') || textToSearch.includes('veg')) return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  if (textToSearch.includes('drink') || textToSearch.includes('beverage') || textToSearch.includes('lassi')) return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80';
  
  // Default authentic maharashtrian food image
  return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
};

const seedMenu = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // ─────────────────────────────────────────────
    // Seed Admin User
    // ─────────────────────────────────────────────
    console.log('\n--- Seeding Admin User ---');
    const adminEmail = 'admin@test.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('Test@123', 12);
      
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        phone: '9876543210',
        address: '123 Admin Street',
        role: 'admin',
      });
      
      console.log(`✓ Admin user created successfully!`);
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Password: Test@123`);
      console.log(`  Role: ${adminUser.role}`);
    }

    // ─────────────────────────────────────────────
    // Seed Menu Items
    // ─────────────────────────────────────────────
    console.log('\n--- Seeding Menu Items ---');
    console.log('Wiping existing MenuItem collection...');
    await MenuItem.deleteMany({});
    console.log('MenuItem collection wiped.');

    // Read JSON file
    const jsonPath = path.resolve(__dirname, '../../../menuItems.json');
    console.log(`Reading menu items from: ${jsonPath}`);
    const menuData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`Found ${menuData.length} items. Processing images...`);
    const processedItems = menuData.map((item: any) => ({
      ...item,
      image: item.image || getRelevantImage(item),
    }));

    console.log('Inserting items into MongoDB...');
    await MenuItem.insertMany(processedItems);
    console.log('✓ Successfully seeded all menu items!');

    console.log('\n--- Seed Complete ---');
    console.log('You can now login with:');
    console.log('  Email: admin@test.com');
    console.log('  Password: Test@123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedMenu();
