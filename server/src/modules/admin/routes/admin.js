const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');
const Shop = require('../../../models/Shop');
const Appointment = require('../../../models/Appointment');
const Service = require('../../../models/Service');
const Barber = require('../../../models/Barber');
const auth = require('../../../middleware/auth');
const router = express.Router();

// @desc    Get all users (super admin only)
// @route   GET /api/admin/users
// @access  Private (super admin)
router.get('/users', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const { 
      role, 
      isActive, 
      isVerified,
      limit = 20,
      page = 1
    } = req.query;

    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .populate('ownedShops', 'name slug status')
      .populate('employedAt', 'name slug status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get users by role (super admin only)
// @route   GET /api/admin/users/role/:role
// @access  Private (super admin)
router.get('/users/role/:role', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role })
      .select('-password')
      .populate('ownedShops', 'name slug status')
      .populate('employedAt', 'name slug status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users by role',
      error: error.message
    });
  }
});

// @desc    Get user by ID (super admin only)
// @route   GET /api/admin/users/:id
// @access  Private (super admin)
router.get('/users/:id', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('ownedShops', 'name slug status rating')
      .populate('employedAt', 'name slug status rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Create user (super admin only)
// @route   POST /api/admin/users
// @access  Private (super admin)
router.post('/users', [
  auth.protect,
  auth.authorize('super_admin'),
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('role').isIn(['customer', 'barber', 'shop_owner', 'super_admin']).withMessage('Valid role is required'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      isVerified: true,
      isActive: true
    });

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('ownedShops', 'name slug status')
      .populate('employedAt', 'name slug status');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @desc    Update user (super admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (super admin)
router.put('/users/:id', [
  auth.protect,
  auth.authorize('super_admin'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('role').optional().isIn(['customer', 'barber', 'shop_owner', 'super_admin']).withMessage('Valid role is required'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password')
     .populate('ownedShops', 'name slug status')
     .populate('employedAt', 'name slug status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Delete user (super admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (super admin)
router.delete('/users/:id', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active shops or appointments
    const activeShops = await Shop.countDocuments({ owner: req.params.id, status: 'active' });
    const activeAppointments = await Appointment.countDocuments({
      $or: [
        { customer: req.params.id, status: { $in: ['pending', 'confirmed'] } },
        { barber: req.params.id, status: { $in: ['pending', 'confirmed'] } }
      ]
    });

    if (activeShops > 0 || activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active shops or appointments'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Get all shops (super admin only)
// @route   GET /api/admin/shops
// @access  Private (super admin)
router.get('/shops', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const { 
      status, 
      owner,
      limit = 20,
      page = 1
    } = req.query;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (owner) {
      filter.owner = owner;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const shops = await Shop.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Shop.countDocuments(filter);

    res.json({
      success: true,
      data: shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message
    });
  }
});

// @desc    Get shop by ID (super admin only)
// @route   GET /api/admin/shops/:id
// @access  Private (super admin)
router.get('/shops/:id', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate('employees', 'firstName lastName email phone');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shop',
      error: error.message
    });
  }
});

// @desc    Update shop status (super admin only)
// @route   PUT /api/admin/shops/:id
// @access  Private (super admin)
router.put('/shops/:id', [
  auth.protect,
  auth.authorize('super_admin'),
  body('status').isIn(['pending', 'active', 'suspended', 'inactive']).withMessage('Valid status is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shop',
      error: error.message
    });
  }
});

// @desc    Delete shop (super admin only)
// @route   DELETE /api/admin/shops/:id
// @access  Private (super admin)
router.delete('/shops/:id', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if shop has active appointments
    const activeAppointments = await Appointment.countDocuments({
      shop: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete shop with active appointments'
      });
    }

    await Shop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shop',
      error: error.message
    });
  }
});

// @desc    Get platform analytics (super admin only)
// @route   GET /api/admin/analytics
// @access  Private (super admin)
router.get('/analytics', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // User statistics
    const totalUsers = await User.countDocuments(filter);
    const customers = await User.countDocuments({ ...filter, role: 'customer' });
    const barbers = await User.countDocuments({ ...filter, role: 'barber' });
    const shopOwners = await User.countDocuments({ ...filter, role: 'shop_owner' });

    // Shop statistics
    const totalShops = await Shop.countDocuments(filter);
    const activeShops = await Shop.countDocuments({ ...filter, status: 'active' });
    const pendingShops = await Shop.countDocuments({ ...filter, status: 'pending' });

    // Appointment statistics
    const totalAppointments = await Appointment.countDocuments(filter);
    const completedAppointments = await Appointment.countDocuments({ ...filter, status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ ...filter, status: 'pending' });
    const cancelledAppointments = await Appointment.countDocuments({ ...filter, status: 'cancelled' });

    // Revenue statistics
    const completedAppointmentsData = await Appointment.find({ ...filter, status: 'completed' })
      .populate('service', 'price');
    
    const totalRevenue = completedAppointmentsData.reduce((sum, appointment) => {
      return sum + (appointment.service?.price || 0);
    }, 0);

    // Monthly growth
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });

    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const userGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers,
          barbers,
          shopOwners,
          growth: userGrowth
        },
        shops: {
          total: totalShops,
          active: activeShops,
          pending: pendingShops
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments
        },
        revenue: {
          total: totalRevenue,
          averagePerAppointment: completedAppointments > 0 ? totalRevenue / completedAppointments : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// @desc    Get revenue data (super admin only)
// @route   GET /api/admin/revenue
// @access  Private (super admin)
router.get('/revenue', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const filter = { status: 'completed' };
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(filter)
      .populate('service', 'price')
      .populate('shop', 'name')
      .populate('barber', 'user')
      .populate('barber.user', 'firstName lastName');

    // Group by time period
    const revenueByPeriod = {};
    appointments.forEach(appointment => {
      const date = new Date(appointment.appointmentDate);
      let period;
      
      if (groupBy === 'day') {
        period = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        period = weekStart.toISOString().split('T')[0];
      } else {
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!revenueByPeriod[period]) {
        revenueByPeriod[period] = {
          revenue: 0,
          appointments: 0,
          shops: new Set(),
          barbers: new Set()
        };
      }

      revenueByPeriod[period].revenue += appointment.service?.price || 0;
      revenueByPeriod[period].appointments += 1;
      revenueByPeriod[period].shops.add(appointment.shop?.name || 'Unknown');
      revenueByPeriod[period].barbers.add(
        `${appointment.barber?.user?.firstName || ''} ${appointment.barber?.user?.lastName || ''}`
      );
    });

    // Convert sets to counts
    Object.keys(revenueByPeriod).forEach(period => {
      revenueByPeriod[period].shops = revenueByPeriod[period].shops.size;
      revenueByPeriod[period].barbers = revenueByPeriod[period].barbers.size;
    });

    // Revenue by shop
    const revenueByShop = {};
    appointments.forEach(appointment => {
      const shopName = appointment.shop?.name || 'Unknown';
      if (!revenueByShop[shopName]) {
        revenueByShop[shopName] = { revenue: 0, appointments: 0 };
      }
      revenueByShop[shopName].revenue += appointment.service?.price || 0;
      revenueByShop[shopName].appointments += 1;
    });

    const totalRevenue = appointments.reduce((sum, appointment) => {
      return sum + (appointment.service?.price || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalAppointments: appointments.length,
        revenueByPeriod,
        revenueByShop
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
      error: error.message
    });
  }
});

// @desc    Update commission rate for shop (super admin only)
// @route   PUT /api/admin/commission/:shopId
// @access  Private (super admin)
router.put('/commission/:shopId', [
  auth.protect,
  auth.authorize('super_admin'),
  body('commissionRate').isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const shop = await Shop.findById(req.params.shopId);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    shop.commissionRate = req.body.commissionRate;
    await shop.save();

    res.json({
      success: true,
      message: 'Commission rate updated successfully',
      data: { shopId: shop._id, commissionRate: shop.commissionRate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating commission rate',
      error: error.message
    });
  }
});

module.exports = router; 