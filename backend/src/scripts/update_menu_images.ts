import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import MenuItem from '../models/MenuItem';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const updateMenuImages = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Read the JSON file
    const jsonPath = path.resolve(__dirname, 'menu_images.json');
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ File not found: ${jsonPath}`);
      process.exit(1);
    }

    console.log('Reading menu_images.json...');
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const items = JSON.parse(fileContent) as { name: string; image: string }[];

    let updatedCount = 0;
    let skippedCount = 0;

    console.log(`Found ${items.length} items in JSON. Starting update process...`);

    for (const item of items) {
      if (item.image && item.image.trim() !== '') {
        // Update the item in the database
        const result = await MenuItem.updateOne(
          { name: item.name },
          { $set: { image: item.image.trim() } }
        );

        if (result.matchedCount > 0) {
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated image for: ${item.name}`);
            updatedCount++;
          } else {
            console.log(`➖ Image already up to date for: ${item.name}`);
            skippedCount++;
          }
        } else {
          console.warn(`⚠️ Warning: Menu item not found in DB: ${item.name}`);
        }
      } else {
        // Skip items without an image URL in the JSON
        skippedCount++;
      }
    }

    console.log('\n--- Summary ---');
    console.log(`Total items processed: ${items.length}`);
    console.log(`Items updated: ${updatedCount}`);
    console.log(`Items skipped (empty URL or already up to date): ${skippedCount}`);
    console.log('---------------');

  } catch (error) {
    console.error('❌ Error updating menu images:', error);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
    process.exit(0);
  }
};

updateMenuImages();
