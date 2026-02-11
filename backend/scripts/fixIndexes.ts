import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User';

dotenv.config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Drop all indexes except _id
    await User.collection.dropIndexes();
    console.log('Dropped all indexes');

    // Recreate indexes using the schema
    await User.createIndexes();
    console.log('Recreated indexes from schema');

    console.log('✅ Indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
