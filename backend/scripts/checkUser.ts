import mongoose from 'mongoose';
import { config } from '../src/config';
import { User } from '../src/models/User';

async function checkUser() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'student1@college.edu' }).select('+password');
    
    if (user) {
      console.log('\n✅ User found:');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Password (hashed):', user.password);
      console.log('Password starts with $2:', user.password.startsWith('$2')); // Bcrypt hashes start with $2
      
      // Test password comparison
      const testPassword = 'Student@123';
      const isValid = await user.comparePassword(testPassword);
      console.log(`\n🔐 Password "${testPassword}" is ${isValid ? 'VALID ✅' : 'INVALID ❌'}`);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
