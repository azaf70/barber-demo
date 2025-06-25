const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');
const Appointment = require('../../../models/Appointment');
const Shop = require('../../../models/Shop');
const Service = require('../../../models/Service');
const auth = require('../../../middleware/auth');
const router = express.Router();

// @desc    Get current customer profile
// @route   GET /api/customers/profile
// @access  Private (customer)
router.get('/profile', auth.protect, auth.authorize('customer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favoriteShops', 'name slug rating images');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Update customer profile
// @route   PUT /api/customers/profile
// @access  Private (customer)
router.put('/profile', [
  auth.protect,
  auth.authorize('customer'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
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
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Get customer bookings
// @route   GET /api/customers/bookings
// @access  Private (customer)
router.get('/bookings', auth.protect, auth.authorize('customer'), async (req, res) => {
  try {
    const { 
      status, 
      limit = 20,
      page = 1
    } = req.query;

    const filter = { customer: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(filter)
      .populate('barber', 'user specialties experience')
      .populate('barber.user', 'firstName lastName email phone')
      .populate('service', 'name price duration category')
      .populate('shop', 'name slug address images')
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

// @desc    Create customer booking
// @route   POST /api/customers/bookings
// @access  Private (customer)
router.post('/bookings', [
  auth.protect,
  auth.authorize('customer'),
  body('shop').isMongoId().withMessage('Valid shop ID is required'),
  body('barber').isMongoId().withMessage('Valid barber ID is required'),
  body('service').isMongoId().withMessage('Valid service ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid appointment time is required'),
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

    const { shop, barber, service, appointmentDate, appointmentTime, notes } = req.body;

    // Check if shop exists and is active
    const shopDoc = await Shop.findById(shop);
    if (!shopDoc || shopDoc.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Shop not found or inactive'
      });
    }

    // Check if barber exists and is available
    const barberDoc = await Barber.findById(barber);
    if (!barberDoc || !barberDoc.isAvailable || barberDoc.shop.toString() !== shop) {
      return res.status(400).json({
        success: false,
        message: 'Barber not found or unavailable'
      });
    }

    // Check if service exists and is active
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc || !serviceDoc.isActive || serviceDoc.shop.toString() !== shop) {
      return res.status(400).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // Check if appointment time is available
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const existingAppointment = await Appointment.findOne({
      barber,
      appointmentDate: appointmentDateTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      customer: req.user._id,
      shop,
      barber,
      service,
      appointmentDate: appointmentDateTime,
      notes,
      status: 'pending',
      payment: {
        totalAmount: serviceDoc.price,
        depositAmount: Math.round(serviceDoc.price * 0.2), // 20% deposit
        status: 'pending'
      }
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('barber', 'user specialties experience')
      .populate('barber.user', 'firstName lastName email phone')
      .populate('service', 'name price duration category')
      .populate('shop', 'name slug address');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// @desc    Update customer booking
// @route   PUT /api/customers/bookings/:id
// @access  Private (customer)
router.put('/bookings/:id', [
  auth.protect,
  auth.authorize('customer'),
  body('appointmentDate').optional().isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid appointment time is required'),
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

    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled booking'
      });
    }

    const updateData = { ...req.body };
    
    if (req.body.appointmentDate && req.body.appointmentTime) {
      updateData.appointmentDate = new Date(`${req.body.appointmentDate}T${req.body.appointmentTime}`);
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('barber', 'user specialties experience')
     .populate('barber.user', 'firstName lastName email phone')
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

// @desc    Cancel customer booking
// @route   DELETE /api/customers/bookings/:id
// @access  Private (customer)
router.delete('/bookings/:id', auth.protect, auth.authorize('customer'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or already cancelled booking'
      });
    }

    // Check if within cancellation window (48 hours)
    const appointmentTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 48) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking within 48 hours of appointment'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = 'customer';
    appointment.cancellationReason = req.body.reason || 'Cancelled by customer';
    await appointment.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// @desc    Get customer favorites
// @route   GET /api/customers/favorites
// @access  Private (customer)
router.get('/favorites', auth.protect, auth.authorize('customer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteShops', 'name slug rating images address businessHours');

    res.json({
      success: true,
      data: user.favoriteShops || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
});

// @desc    Add shop to favorites
// @route   POST /api/customers/favorites
// @access  Private (customer)
router.post('/favorites', [
  auth.protect,
  auth.authorize('customer'),
  body('shopId').isMongoId().withMessage('Valid shop ID is required')
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

    const { shopId } = req.body;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user.favoriteShops.includes(shopId)) {
      return res.status(400).json({
        success: false,
        message: 'Shop already in favorites'
      });
    }

    user.favoriteShops.push(shopId);
    await user.save();

    res.json({
      success: true,
      message: 'Shop added to favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
      error: error.message
    });
  }
});

// @desc    Remove shop from favorites
// @route   DELETE /api/customers/favorites/:shopId
// @access  Private (customer)
router.delete('/favorites/:shopId', auth.protect, auth.authorize('customer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const shopIndex = user.favoriteShops.indexOf(req.params.shopId);
    if (shopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not in favorites'
      });
    }

    user.favoriteShops.splice(shopIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Shop removed from favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
      error: error.message
    });
  }
});

module.exports = router; 