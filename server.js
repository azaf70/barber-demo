const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Import models
const User = require('./models/User');
const Shop = require('./models/Shop');
const Service = require('./models/Service');
const Barber = require('./models/Barber');
const Appointment = require('./models/Appointment');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const shopsRoutes = require('./routes/shops');
const servicesRoutes = require('./routes/services');
const barbersRoutes = require('./routes/barbers');
const appointmentsRoutes = require('./routes/appointments');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/barber-demo');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Barber Marketplace API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Super admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalShops: await Shop.countDocuments(),
      totalServices: await Service.countDocuments(),
      totalBarbers: await Barber.countDocuments(),
      totalAppointments: await Appointment.countDocuments(),
      pendingShops: await Shop.countDocuments({ status: 'pending' }),
      activeShops: await Shop.countDocuments({ status: 'active' }),
      suspendedShops: await Shop.countDocuments({ status: 'suspended' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin dashboard data',
      error: error.message
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer(); 