const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');
const Barber = require('../../../models/Barber');
const Shop = require('../../../models/Shop');
const Service = require('../../../models/Service');
const Appointment = require('../../../models/Appointment');
const auth = require('../../../middleware/auth');
const router = express.Router();

// @desc    Get all barbers (public)
// @route   GET /api/barbers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      shop, 
      specialty, 
      isAvailable = true, 
      isVerified = true,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { isAvailable, isVerified };
    
    if (shop) {
      filter.shop = shop;
    }
    
    if (specialty) {
      filter.specialties = { $in: [specialty] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const barbers = await Barber.find(filter)
      .populate('user', 'firstName lastName email phone bio')
      .populate('shop', 'name slug rating')
      .populate('services.service', 'name price duration category')
      .sort({ 'rating.average': -1, experience: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Barber.countDocuments(filter);

    res.json({
      success: true,
      data: barbers,
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
      message: 'Error fetching barbers',
      error: error.message
    });
  }
});

// @desc    Get barber profile
// @route   GET /api/barbers/profile
// @access  Private (barber)
router.get('/profile', auth.protect, auth.authorize('barber'), async (req, res) => {
  try {
    const barber = await Barber.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email phone')
      .populate('shops', 'name slug status rating');

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found'
      });
    }

    res.json({
      success: true,
      data: barber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Update barber profile
// @route   PUT /api/barbers/profile
// @access  Private (barber)
router.put('/profile', [
  auth.protect,
  auth.authorize('barber'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('availability').optional().isObject().withMessage('Availability must be an object')
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

    const barber = await Barber.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone')
     .populate('shops', 'name slug status rating');

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: barber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Get barber shops
// @route   GET /api/barbers/shops
// @access  Private (barber)
router.get('/shops', auth.protect, auth.authorize('barber'), async (req, res) => {
  try {
    const barber = await Barber.findOne({ user: req.user._id })
      .populate('shops', 'name slug status rating address businessHours contact');

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found'
      });
    }

    res.json({
      success: true,
      data: barber.shops || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message
    });
  }
});

// @desc    Create barber shop
// @route   POST /api/barbers/shops
// @access  Private (barber)
router.post('/shops', [
  auth.protect,
  auth.authorize('barber'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('address').trim().isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('businessHours').isObject().withMessage('Business hours must be an object'),
  body('services').optional().isArray().withMessage('Services must be an array')
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

    const { name, description, address, phone, email, website, businessHours, services } = req.body;

    // Check if shop name already exists
    const existingShop = await Shop.findOne({ name });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'Shop with this name already exists'
      });
    }

    // Create shop
    const shop = await Shop.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      owner: req.user._id,
      description,
      address,
      contact: { phone, email, website },
      businessHours,
      status: 'pending',
      services: services || []
    });

    // Update barber profile to include new shop
    await Barber.findOneAndUpdate(
      { user: req.user._id },
      { $push: { shops: shop._id } }
    );

    const populatedShop = await Shop.findById(shop._id)
      .populate('owner', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: populatedShop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shop',
      error: error.message
    });
  }
});

// @desc    Update barber shop
// @route   PUT /api/barbers/shops/:id
// @access  Private (barber)
router.put('/shops/:id', [
  auth.protect,
  auth.authorize('barber'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('address').optional().trim().isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('businessHours').optional().isObject().withMessage('Business hours must be an object')
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

    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: updatedShop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shop',
      error: error.message
    });
  }
});

// @desc    Delete barber shop
// @route   DELETE /api/barbers/shops/:id
// @access  Private (barber)
router.delete('/shops/:id', auth.protect, auth.authorize('barber'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this shop'
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

    // Remove shop from barber profile
    await Barber.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { shops: req.params.id } }
    );

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

// @desc    Get barber bookings
// @route   GET /api/barbers/bookings
// @access  Private (barber)
router.get('/bookings', auth.protect, auth.authorize('barber'), async (req, res) => {
  try {
    const { 
      status, 
      shop,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { barber: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (shop) {
      filter.shop = shop;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('service', 'name price duration category')
      .populate('shop', 'name slug address')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: appointments,
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
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// @desc    Update booking status
// @route   PUT /api/barbers/bookings/:id
// @access  Private (barber)
router.put('/bookings/:id', [
  auth.protect,
  auth.authorize('barber'),
  body('status').isIn(['confirmed', 'completed', 'cancelled']).withMessage('Valid status is required'),
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

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (appointment.barber.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    appointment.status = req.body.status;
    if (req.body.notes) {
      appointment.notes = req.body.notes;
    }

    if (req.body.status === 'cancelled') {
      appointment.cancelledBy = 'barber';
      appointment.cancellationReason = req.body.reason || 'Cancelled by barber';
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('service', 'name price duration category')
      .populate('shop', 'name slug address');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
});

// @desc    Get barber earnings
// @route   GET /api/barbers/earnings
// @access  Private (barber)
router.get('/earnings', auth.protect, auth.authorize('barber'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { 
      barber: req.user._id,
      status: 'completed'
    };

    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(filter)
      .populate('service', 'price')
      .populate('shop', 'name');

    const totalEarnings = appointments.reduce((sum, appointment) => {
      return sum + (appointment.service.price || 0);
    }, 0);

    const earningsByShop = appointments.reduce((acc, appointment) => {
      const shopName = appointment.shop.name;
      if (!acc[shopName]) {
        acc[shopName] = 0;
      }
      acc[shopName] += appointment.service.price || 0;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalEarnings,
        totalAppointments: appointments.length,
        earningsByShop,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings',
      error: error.message
    });
  }
});

// @desc    Create barber service
// @route   POST /api/barbers/services
// @access  Private (barber)
router.post('/services', [
  auth.protect,
  auth.authorize('barber'),
  body('shop').isMongoId().withMessage('Valid shop ID is required'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
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

    const { shop, name, description, category, duration, price } = req.body;

    // Check if barber owns this shop
    const barber = await Barber.findOne({ user: req.user._id });
    if (!barber || !barber.shops.includes(shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add services to this shop'
      });
    }

    const service = await Service.create({
      shop,
      name,
      description,
      category,
      duration,
      price: Math.round(price * 100), // Convert to cents
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
});

// @desc    Update barber service
// @route   PUT /api/barbers/services/:id
// @access  Private (barber)
router.put('/services/:id', [
  auth.protect,
  auth.authorize('barber'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('category').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if barber owns the shop that has this service
    const barber = await Barber.findOne({ user: req.user._id });
    if (!barber || !barber.shops.includes(service.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const updateData = { ...req.body };
    if (req.body.price) {
      updateData.price = Math.round(req.body.price * 100); // Convert to cents
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
});

// @desc    Delete barber service
// @route   DELETE /api/barbers/services/:id
// @access  Private (barber)
router.delete('/services/:id', auth.protect, auth.authorize('barber'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if barber owns the shop that has this service
    const barber = await Barber.findOne({ user: req.user._id });
    if (!barber || !barber.shops.includes(service.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    // Check if service has active appointments
    const activeAppointments = await Appointment.countDocuments({
      service: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active appointments'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
});

module.exports = router; 