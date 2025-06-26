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

// Import feature-based routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./modules/customers/routes/customers');
const barberRoutes = require('./modules/barbers/routes/barbers');
const adminRoutes = require('./modules/admin/routes/admin');

// Import shared routes
const shopRoutes = require('./routes/shops');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for testing)
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

// Body parsing middleware with better error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('❌ Invalid JSON detected:', buf.toString());
      throw new Error('Invalid JSON format');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/barber-demo');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will start without database connection');
    console.log('   Some features may not work properly');
    return false;
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BarberHub API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);

// Feature-based routes
app.use('/api/customers', customerRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/admin', adminRoutes);

// Shared routes
app.use('/api/shops', shopRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Super admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        error: 'MongoDB connection required for admin dashboard'
      });
    }

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

// Defensive middleware: convert string errors to Error objects
app.use((err, req, res, next) => {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  next(err);
});

// Error handling middleware
app.use(errorHandler);

// Final catch-all error handler to ensure all errors return JSON
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err && err.message ? err.message : String(err)
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('🚀 Starting BarberHub API Server...');
  
  // Try to connect to database
  const dbConnected = await connectDB();
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    
    if (!dbConnected) {
      console.log('⚠️  To enable full functionality, start MongoDB and restart the server');
    }
  });
};

startServer();

module.exports = app; 