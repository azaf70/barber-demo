const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/barber-demo');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const testUsers = async () => {
  try {
    await connectDB();
    
    // Check if admin user exists
    const admin = await User.findOne({ email: 'admin@barbermarketplace.com' }).select('+password');
    console.log('Admin user found:', admin ? 'YES' : 'NO');
    
    if (admin) {
      console.log('Admin email:', admin.email);
      console.log('Admin role:', admin.role);
      console.log('Admin isActive:', admin.isActive);
      console.log('Admin password hash:', admin.password);
      
      // Test password
      const isMatch = await bcrypt.compare('admin123', admin.password);
      console.log('Password match:', isMatch);
    }
    
    // Check all users
    const allUsers = await User.find({}).select('email role isActive');
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testUsers(); 