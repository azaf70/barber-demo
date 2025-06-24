const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Appointment = require('../models/Appointment');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/barber-demo');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Create super admin
    const admin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@barbermarketplace.com',
      password: 'admin123',
      phone: '+44123456789',
      role: 'super_admin',
      isVerified: true,
      isActive: true
    });

    // Create shop owners
    const owner1 = await User.create({
      firstName: 'John',
      lastName: 'Smith',
      email: 'shopowner1@example.com',
      password: 'owner123',
      phone: '+44123456790',
      role: 'shop_owner',
      isVerified: true,
      isActive: true,
      bio: 'Experienced barber shop owner with 10+ years in the industry'
    });

    const owner2 = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'shopowner2@example.com',
      password: 'owner123',
      phone: '+44123456791',
      role: 'shop_owner',
      isVerified: true,
      isActive: true,
      bio: 'Passionate about modern barbering and customer experience'
    });

    // Create barbers
    const barber1 = await User.create({
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'barber1@example.com',
      password: 'barber123',
      phone: '+44123456792',
      role: 'barber',
      isVerified: true,
      isActive: true,
      bio: 'Specialist in modern fades and contemporary cuts'
    });

    const barber2 = await User.create({
      firstName: 'David',
      lastName: 'Brown',
      email: 'barber2@example.com',
      password: 'barber123',
      phone: '+44123456793',
      role: 'barber',
      isVerified: true,
      isActive: true,
      bio: 'Expert in traditional cuts and beard grooming'
    });

    const barber3 = await User.create({
      firstName: 'Alex',
      lastName: 'Taylor',
      email: 'barber3@example.com',
      password: 'barber123',
      phone: '+44123456794',
      role: 'barber',
      isVerified: true,
      isActive: true,
      bio: 'Creative stylist specializing in unique cuts and coloring'
    });

    // Create customers
    const customer1 = await User.create({
      firstName: 'James',
      lastName: 'Davis',
      email: 'customer1@example.com',
      password: 'customer123',
      phone: '+44123456795',
      role: 'customer',
      isVerified: true,
      isActive: true
    });

    const customer2 = await User.create({
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'customer2@example.com',
      password: 'customer123',
      phone: '+44123456796',
      role: 'customer',
      isVerified: true,
      isActive: true
    });

    console.log('Users seeded successfully');
    return { admin, owner1, owner2, barber1, barber2, barber3, customer1, customer2 };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedShops = async (users) => {
  try {
    // Clear existing shops
    await Shop.deleteMany();

    const shops = await Shop.create([
      {
        name: 'Classic Cuts Barbershop',
        description: 'Traditional men\'s barbershop offering classic cuts, beard trims, and hot shaves. We pride ourselves on attention to detail and customer satisfaction.',
        owner: users.owner1._id,
        contact: {
          email: 'info@classiccuts.com',
          phone: '+44123456797',
          website: 'https://classiccuts.com'
        },
        address: {
          street: '123 High Street',
          city: 'London',
          state: 'Greater London',
          zipCode: 'SW1A 1AA',
          country: 'United Kingdom'
        },
        businessHours: {
          monday: { start: '09:00', end: '18:00', isOpen: true },
          tuesday: { start: '09:00', end: '18:00', isOpen: true },
          wednesday: { start: '09:00', end: '18:00', isOpen: true },
          thursday: { start: '09:00', end: '18:00', isOpen: true },
          friday: { start: '09:00', end: '18:00', isOpen: true },
          saturday: { start: '09:00', end: '16:00', isOpen: true },
          sunday: { start: '10:00', end: '14:00', isOpen: false }
        },
        specialties: ['haircut', 'beard-trim', 'shave', 'styling'],
        amenities: ['wifi', 'parking', 'card-payment', 'appointments', 'consultation'],
        status: 'active',
        isVerified: true,
        isFeatured: true,
        rating: {
          average: 4.8,
          totalReviews: 45,
          totalRating: 216
        },
        subscription: {
          plan: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      },
      {
        name: 'Modern Fade Studio',
        description: 'Contemporary barber studio specializing in modern fades, undercuts, and trendy styles. We stay ahead of the latest trends in men\'s grooming.',
        owner: users.owner2._id,
        contact: {
          email: 'hello@modernfade.com',
          phone: '+44123456798',
          website: 'https://modernfade.com'
        },
        address: {
          street: '456 Oxford Street',
          city: 'London',
          state: 'Greater London',
          zipCode: 'W1C 1AP',
          country: 'United Kingdom'
        },
        businessHours: {
          monday: { start: '10:00', end: '19:00', isOpen: true },
          tuesday: { start: '10:00', end: '19:00', isOpen: true },
          wednesday: { start: '10:00', end: '19:00', isOpen: true },
          thursday: { start: '10:00', end: '19:00', isOpen: true },
          friday: { start: '10:00', end: '19:00', isOpen: true },
          saturday: { start: '09:00', end: '17:00', isOpen: true },
          sunday: { start: '11:00', end: '15:00', isOpen: false }
        },
        specialties: ['fade', 'undercut', 'textured-cut', 'hair-coloring', 'styling'],
        amenities: ['wifi', 'parking', 'card-payment', 'appointments', 'product-sales'],
        status: 'active',
        isVerified: true,
        isFeatured: true,
        rating: {
          average: 4.9,
          totalReviews: 32,
          totalRating: 157
        },
        subscription: {
          plan: 'enterprise',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      }
    ]);

    console.log('Shops seeded successfully');
    return shops;
  } catch (error) {
    console.error('Error seeding shops:', error);
    throw error;
  }
};

const seedServices = async (shops) => {
  try {
    // Clear existing services
    await Service.deleteMany();

    const services = await Service.create([
      // Classic Cuts Barbershop Services
      {
        name: 'Classic Haircut',
        description: 'Traditional men\'s haircut with wash and style',
        shop: shops[0]._id,
        category: 'haircut',
        price: 25.00,
        duration: 30,
        isActive: true,
        isPopular: true,
        availability: {
          monday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          tuesday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          wednesday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          thursday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          friday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          saturday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'] },
          sunday: { isAvailable: false, slots: [] }
        }
      },
      {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        shop: shops[0]._id,
        category: 'beard-trim',
        price: 15.00,
        duration: 20,
        isActive: true,
        isPopular: true,
        availability: {
          monday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          tuesday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          wednesday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          thursday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          friday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'] },
          saturday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'] },
          sunday: { isAvailable: false, slots: [] }
        }
      },
      {
        name: 'Hot Shave',
        description: 'Traditional hot towel straight razor shave',
        shop: shops[0]._id,
        category: 'shave',
        price: 35.00,
        duration: 45,
        isActive: true,
        isPopular: false,
        availability: {
          monday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
          tuesday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
          wednesday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
          thursday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
          friday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] },
          saturday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'] },
          sunday: { isAvailable: false, slots: [] }
        }
      },
      // Modern Fade Studio Services
      {
        name: 'Modern Fade',
        description: 'Contemporary fade with precision cutting',
        shop: shops[1]._id,
        category: 'fade',
        price: 30.00,
        duration: 40,
        isActive: true,
        isPopular: true,
        availability: {
          monday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          tuesday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          wednesday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          thursday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          friday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          saturday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
          sunday: { isAvailable: false, slots: [] }
        }
      },
      {
        name: 'Hair Coloring',
        description: 'Professional hair coloring and highlights',
        shop: shops[1]._id,
        category: 'hair-coloring',
        price: 60.00,
        duration: 90,
        isActive: true,
        isPopular: false,
        availability: {
          monday: { isAvailable: true, slots: ['10:00', '12:00', '14:00', '16:00'] },
          tuesday: { isAvailable: true, slots: ['10:00', '12:00', '14:00', '16:00'] },
          wednesday: { isAvailable: true, slots: ['10:00', '12:00', '14:00', '16:00'] },
          thursday: { isAvailable: true, slots: ['10:00', '12:00', '14:00', '16:00'] },
          friday: { isAvailable: true, slots: ['10:00', '12:00', '14:00', '16:00'] },
          saturday: { isAvailable: true, slots: ['09:00', '11:00', '13:00', '15:00'] },
          sunday: { isAvailable: false, slots: [] }
        }
      },
      {
        name: 'Styling',
        description: 'Hair styling for special occasions',
        shop: shops[1]._id,
        category: 'styling',
        price: 25.00,
        duration: 30,
        isActive: true,
        isPopular: true,
        availability: {
          monday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          tuesday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          wednesday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          thursday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          friday: { isAvailable: true, slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] },
          saturday: { isAvailable: true, slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
          sunday: { isAvailable: false, slots: [] }
        }
      }
    ]);

    console.log('Services seeded successfully');
    return services;
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
};

const seedBarbers = async (users, shops, services) => {
  try {
    // Clear existing barbers
    await Barber.deleteMany();

    const barbers = await Barber.create([
      {
        user: users.barber1._id,
        shop: shops[0]._id,
        specialties: ['haircut', 'beard-trim', 'styling'],
        experience: 5,
        bio: 'Experienced barber with 5 years of experience in modern and classic cuts.',
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
        services: [
          { service: services[0]._id, isActive: true },
          { service: services[1]._id, isActive: true },
          { service: services[2]._id, isActive: true }
        ],
        rating: {
          average: 4.8,
          totalReviews: 25,
          totalRating: 120
        },
        status: 'active',
        isVerified: true
      },
      {
        user: users.barber2._id,
        shop: shops[0]._id,
        specialties: ['haircut', 'shave', 'beard-trim'],
        experience: 8,
        bio: 'Master barber specializing in traditional cuts and modern techniques.',
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
        services: [
          { service: services[0]._id, isActive: true },
          { service: services[1]._id, isActive: true },
          { service: services[2]._id, isActive: true }
        ],
        rating: {
          average: 4.9,
          totalReviews: 42,
          totalRating: 206
        },
        status: 'active',
        isVerified: true
      },
      {
        user: users.barber3._id,
        shop: shops[1]._id,
        specialties: ['fade', 'undercut', 'hair-coloring', 'styling'],
        experience: 6,
        bio: 'Creative stylist with expertise in modern fades and hair coloring.',
        workingHours: {
          monday: { start: '10:00', end: '19:00', isWorking: true },
          tuesday: { start: '10:00', end: '19:00', isWorking: true },
          wednesday: { start: '10:00', end: '19:00', isWorking: true },
          thursday: { start: '10:00', end: '19:00', isWorking: true },
          friday: { start: '10:00', end: '19:00', isWorking: true },
          saturday: { start: '09:00', end: '17:00', isWorking: true },
          sunday: { start: '11:00', end: '15:00', isWorking: false }
        },
        isAvailable: true,
        services: [
          { service: services[3]._id, isActive: true },
          { service: services[4]._id, isActive: true },
          { service: services[5]._id, isActive: true }
        ],
        rating: {
          average: 4.7,
          totalReviews: 18,
          totalRating: 85
        },
        status: 'active',
        isVerified: true
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
    const shops = await seedShops(users);
    const services = await seedServices(shops);
    const barbers = await seedBarbers(users, shops, services);
    
    // Update shops with barbers
    await Shop.findByIdAndUpdate(shops[0]._id, { $set: { barbers: [barbers[0]._id, barbers[1]._id] } });
    await Shop.findByIdAndUpdate(shops[1]._id, { $set: { barbers: [barbers[2]._id] } });
    
    // Update users with shop relationships
    await User.findByIdAndUpdate(users.owner1._id, { ownedShops: [shops[0]._id] });
    await User.findByIdAndUpdate(users.owner2._id, { ownedShops: [shops[1]._id] });
    await User.findByIdAndUpdate(users.barber1._id, { employedAt: shops[0]._id });
    await User.findByIdAndUpdate(users.barber2._id, { employedAt: shops[0]._id });
    await User.findByIdAndUpdate(users.barber3._id, { employedAt: shops[1]._id });
    
    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Super Admin: admin@barbermarketplace.com / admin123');
    console.log('Shop Owner 1: shopowner1@example.com / owner123');
    console.log('Shop Owner 2: shopowner2@example.com / owner123');
    console.log('Barber 1: barber1@example.com / barber123');
    console.log('Barber 2: barber2@example.com / barber123');
    console.log('Barber 3: barber3@example.com / barber123');
    console.log('Customer 1: customer1@example.com / customer123');
    console.log('Customer 2: customer2@example.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 