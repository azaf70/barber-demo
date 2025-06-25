const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Shop = require('../models/Shop');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get all appointments (filtered by user role)
// @route   GET /api/appointments
// @access  Private
router.get('/', auth.protect, async (req, res) => {
  try {
    const { 
      status, 
      shop, 
      barber, 
      service,
      startDate,
      endDate,
      limit = 20,
      page = 1
    } = req.query;

    const filter = {};
    
    // Filter by user role
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'barber') {
      filter.barber = req.user._id;
    } else if (req.user.role === 'shop_owner') {
      // Get shops owned by this user
      const ownedShops = req.user.ownedShops || [];
      if (ownedShops.length > 0) {
        filter.shop = { $in: ownedShops };
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 }
        });
      }
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (shop) {
      filter.shop = shop;
    }
    
    if (barber) {
      filter.barber = barber;
    }
    
    if (service) {
      filter.service = service;
    }
    
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties experience')
      .populate('barber.user', 'firstName lastName email phone')
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
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties experience')
      .populate('barber.user', 'firstName lastName email phone')
      .populate('service', 'name price duration category description')
      .populate('shop', 'name slug address businessHours contact');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'customer' && appointment.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    if (req.user.role === 'barber' && appointment.barber._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    if (req.user.role === 'shop_owner' && !req.user.canManageShop(appointment.shop._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', auth.protect, [
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

    // Check if barber offers this service
    const barberService = barberDoc.services.find(s => s.service.toString() === service && s.isActive);
    if (!barberService) {
      return res.status(400).json({
        success: false,
        message: 'Barber does not offer this service'
      });
    }

    // Check if appointment time is available
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const endTime = new Date(appointmentDateTime.getTime() + serviceDoc.duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      barber,
      appointmentDate,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          appointmentTime: { $lt: appointmentTime },
          endTime: { $gt: appointmentTime }
        },
        {
          appointmentTime: { $lt: endTime.toTimeString().slice(0, 5) },
          endTime: { $gt: endTime.toTimeString().slice(0, 5) }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time is not available'
      });
    }

    // Check if shop is open at this time
    const dayOfWeek = appointmentDateTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const shopHours = shopDoc.businessHours[dayOfWeek];
    
    if (!shopHours.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Shop is closed on this day'
      });
    }

    if (appointmentTime < shopHours.start || appointmentTime > shopHours.end) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time is outside shop hours'
      });
    }

    const appointment = await Appointment.create({
      customer: req.user._id,
      shop,
      barber,
      service,
      appointmentDate,
      appointmentTime,
      endTime: endTime.toTimeString().slice(0, 5),
      notes,
      price: serviceDoc.price,
      duration: serviceDoc.duration
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties experience')
      .populate('barber.user', 'firstName lastName email phone')
      .populate('service', 'name price duration category')
      .populate('shop', 'name slug address');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Barber/Admin)
router.put('/:id/status', auth.protect, auth.authorize('barber', 'admin'), [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
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
        message: 'Appointment not found'
      });
    }

    // Check if user can update this appointment
    if (req.user.role === 'barber' && appointment.barber.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    if (req.user.role === 'shop_owner' && !req.user.canManageShop(appointment.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('customer', 'firstName lastName email phone')
    .populate('barber', 'user specialties experience')
    .populate('barber.user', 'firstName lastName email phone')
    .populate('service', 'name price duration category')
    .populate('shop', 'name slug address');

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
router.put('/:id/cancel', auth.protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Check if user can cancel this appointment
    if (req.user.role === 'customer' && appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to cancel this appointment' 
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled'
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    )
    .populate('customer', 'firstName lastName email phone')
    .populate('barber', 'user specialties experience')
    .populate('barber.user', 'firstName lastName email phone')
    .populate('service', 'name price duration category')
    .populate('shop', 'name slug address');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
});

// @desc    Get appointment analytics (shop owner only)
// @route   GET /api/appointments/analytics/shop/:shopId
// @access  Private
router.get('/analytics/shop/:shopId', auth.protect, auth.authorize('shop_owner', 'super_admin'), async (req, res) => {
  try {
    // Check if user can manage this shop
    if (!req.user.canManageShop(req.params.shopId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this shop'
      });
    }

    const { startDate, endDate } = req.query;
    const filter = { shop: req.params.shopId };

    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(filter);
    
    const analytics = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      noShow: appointments.filter(a => a.status === 'no-show').length,
      totalRevenue: appointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.price, 0),
      averageRating: appointments
        .filter(a => a.rating)
        .reduce((sum, a) => sum + a.rating, 0) / appointments.filter(a => a.rating).length || 0
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment analytics',
      error: error.message
    });
  }
});

module.exports = router; 