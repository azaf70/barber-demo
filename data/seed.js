import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Barber from '../models/Barber.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/barber-demo');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@barberdemo.com',
      password: adminPassword,
      phone: '+1234567890',
      role: 'admin'
    });

    // Create barber users
    const barber1Password = await bcrypt.hash('barber123', 10);
    const barber1 = await User.create({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@barberdemo.com',
      password: barber1Password,
      phone: '+1234567891',
      role: 'barber'
    });

    const barber2Password = await bcrypt.hash('barber123', 10);
    const barber2 = await User.create({
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@barberdemo.com',
      password: barber2Password,
      phone: '+1234567892',
      role: 'barber'
    });

    // Create customer users
    const customer1Password = await bcrypt.hash('customer123', 10);
    const customer1 = await User.create({
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david@example.com',
      password: customer1Password,
      phone: '+1234567893',
      role: 'customer'
    });

    const customer2Password = await bcrypt.hash('customer123', 10);
    const customer2 = await User.create({
      firstName: 'Sarah',
      lastName: 'Brown',
      email: 'sarah@example.com',
      password: customer2Password,
      phone: '+1234567894',
      role: 'customer'
    });

    console.log('Users seeded successfully');
    return { admin, barber1, barber2, customer1, customer2 };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedServices = async () => {
  try {
    // Clear existing services
    await Service.deleteMany();

    const services = await Service.create([
      {
        name: 'Classic Haircut',
        description: 'Traditional men\'s haircut with wash and style',
        price: 25.00,
        duration: 30,
        category: 'haircut',
        image: ''
      },
      {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        price: 15.00,
        duration: 20,
        category: 'beard-trim',
        image: ''
      },
      {
        name: 'Hot Shave',
        description: 'Traditional hot towel straight razor shave',
        price: 35.00,
        duration: 45,
        category: 'shave',
        image: ''
      },
      {
        name: 'Kids Haircut',
        description: 'Haircut for children under 12',
        price: 18.00,
        duration: 25,
        category: 'kids-cut',
        image: ''
      },
      {
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        price: 60.00,
        duration: 90,
        category: 'hair-coloring',
        image: ''
      },
      {
        name: 'Styling',
        description: 'Hair styling for special occasions',
        price: 20.00,
        duration: 30,
        category: 'styling',
        image: ''
      }
    ]);

    console.log('Services seeded successfully');
    return services;
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
};

const seedBarbers = async (users, services) => {
  try {
    // Clear existing barbers
    await Barber.deleteMany();

    const barbers = await Barber.create([
      {
        user: users.barber1._id,
        specialties: ['haircut', 'beard-trim', 'styling'],
        experience: 5,
        bio: 'Experienced barber with 5 years of experience in modern and classic cuts.',
        rating: 4.8,
        totalReviews: 25,
        workingHours: {
          monday: { start: '09:00', end: '18:00', isWorking: true },
          tuesday: { start: '09:00', end: '18:00', isWorking: true },
          wednesday: { start: '09:00', end: '18:00', isWorking: true },
          thursday: { start: '09:00', end: '18:00', isWorking: true },
          friday: { start: '09:00', end: '18:00', isWorking: true },
          saturday: { start: '09:00', end: '16:00', isWorking: true },
          sunday: { start: '10:00', end: '14:00', isWorking: false }
        },
        isAvailable: true,
        services: [services[0]._id, services[1]._id, services[5]._id] // Classic Haircut, Beard Trim, Styling
      },
      {
        user: users.barber2._id,
        specialties: ['haircut', 'shave', 'hair-coloring'],
        experience: 8,
        bio: 'Master barber specializing in traditional cuts and modern techniques.',
        rating: 4.9,
        totalReviews: 42,
        workingHours: {
          monday: { start: '10:00', end: '19:00', isWorking: true },
          tuesday: { start: '10:00', end: '19:00', isWorking: true },
          wednesday: { start: '10:00', end: '19:00', isWorking: true },
          thursday: { start: '10:00', end: '19:00', isWorking: true },
          friday: { start: '10:00', end: '19:00', isWorking: true },
          saturday: { start: '09:00', end: '17:00', isWorking: true },
          sunday: { start: '10:00', end: '15:00', isWorking: false }
        },
        isAvailable: true,
        services: [services[0]._id, services[2]._id, services[4]._id] // Classic Haircut, Hot Shave, Hair Coloring
      }
    ]);

    console.log('Barbers seeded successfully');
    return barbers;
  } catch (error) {
    console.error('Error seeding barbers:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const users = await seedUsers();
    const services = await seedServices();
    const barbers = await seedBarbers(users, services);
    
    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@barberdemo.com / admin123');
    console.log('Barber 1: john@barberdemo.com / barber123');
    console.log('Barber 2: mike@barberdemo.com / barber123');
    console.log('Customer 1: david@example.com / customer123');
    console.log('Customer 2: sarah@example.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 