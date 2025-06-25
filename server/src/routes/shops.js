const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Shop = require('../models/Shop');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Get all shops (public)
router.get('/', [
  query('lat').optional().isFloat().withMessage('Latitude must be a number'),
  query('lng').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
  query('services').optional().isString().withMessage('Services must be a string'),
  query('available').optional().isBoolean().withMessage('Available must be a boolean'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number')
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

    const { 
      lat, 
      lng, 
      radius = 10, 
      services, 
      available,
      rating,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { status: 'active' };
    
    // Geospatial search
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }
    
    // Service filtering
    if (services) {
      const serviceArray = services.split(',').map(s => s.trim());
      filter['services.name'] = { $in: serviceArray };
    }
    
    // Rating filtering
    if (rating) {
      filter['rating.average'] = { $gte: parseFloat(rating) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let shops = await Shop.find(filter)
      .populate('owner', 'firstName lastName')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Filter by availability if requested
    if (available === 'true') {
      const now = new Date();
      const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      shops = shops.filter(shop => {
        const hours = shop.businessHours[today];
        if (!hours || !hours.isOpen) return false;
        
        const currentTime = now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        return currentTime >= hours.open && currentTime <= hours.close;
      });
    }

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

// Get featured shops
router.get('/featured', async (req, res) => {
  try {
    const shops = await Shop.find({ 
      isFeatured: true, 
      status: 'active' 
    })
    .populate('owner', 'firstName lastName')
    .sort({ 'rating.average': -1 })
    .limit(6);

    res.json({
      success: true,
      data: shops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured shops',
      error: error.message
    });
  }
});

// Get shop by slug
router.get('/:slug', async (req, res) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug })
      .populate('owner', 'firstName lastName email phone')
      .populate({
        path: 'barbers',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        }
      });

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

// Create shop (shop owner only)
router.post('/', [
  auth.protect,
  auth.authorize('shop_owner', 'super_admin'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('contact.email').isEmail().withMessage('Valid contact email is required'),
  body('contact.phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Valid contact phone is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State/County is required'),
  body('address.zipCode').notEmpty().withMessage('Postal code is required'),
  body('specialties').isArray().withMessage('Specialties must be an array'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array')
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

    // Check if user is shop owner or super admin
    if (!req.user.isShopOwner() && !req.user.isSuperAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Only shop owners can create shops'
      });
    }

    const shopData = {
      ...req.body,
      owner: req.user._id
    };

    const shop = await Shop.create(shopData);

    // Update user's owned shops
    await User.findByIdAndUpdate(req.user._id, {
      $push: { ownedShops: shop._id }
    });

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shop',
      error: error.message
    });
  }
});

// Update shop (owner or super admin only)
router.put('/:id', [
  auth.protect,
  auth.authorize('shop_owner', 'super_admin'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('contact.email').optional().isEmail().withMessage('Valid contact email is required'),
  body('contact.phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Valid contact phone is required')
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

    // Check if user can manage this shop
    if (!req.user.canManageShop(shop._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email phone');

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

// Update shop status (super admin only)
router.patch('/:id/status', [
  auth.protect,
  auth.authorize('super_admin'),
  body('status').isIn(['pending', 'active', 'suspended', 'closed']).withMessage('Invalid status'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean')
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

    if (!req.user.isSuperAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can update shop status'
      });
    }

    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email phone');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Shop status updated successfully',
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shop status',
      error: error.message
    });
  }
});

// Get shop analytics (owner or super admin only)
router.get('/:id/analytics', auth.protect, auth.authorize('shop_owner', 'super_admin'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (!req.user.canManageShop(shop._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view shop analytics'
      });
    }

    // Get analytics data (this would include appointments, revenue, etc.)
    const analytics = {
      totalAppointments: shop.analytics.totalAppointments,
      totalRevenue: shop.analytics.totalRevenue,
      monthlyVisitors: shop.analytics.monthlyVisitors,
      averageRating: shop.rating.average,
      totalReviews: shop.rating.totalReviews
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shop analytics',
      error: error.message
    });
  }
});

// Delete shop (owner or super admin only)
router.delete('/:id', auth.protect, auth.authorize('shop_owner', 'super_admin'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (!req.user.canManageShop(shop._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this shop'
      });
    }

    await Shop.findByIdAndDelete(req.params.id);

    // Remove shop from user's owned shops
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { ownedShops: shop._id }
    });

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

// @desc    Search shops (public)
// @route   GET /api/shops/search
// @access  Public
router.get('/search', [
  query('q').trim().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('lat').optional().isFloat().withMessage('Latitude must be a number'),
  query('lng').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const { q, lat, lng, radius = 10, limit = 20 } = req.query;

    const filter = {
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'services.name': { $regex: q, $options: 'i' } }
      ]
    };

    // Geospatial search
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }

    const shops = await Shop.find(filter)
      .populate('owner', 'firstName lastName')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: shops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching shops',
      error: error.message
    });
  }
});

// @desc    Get shop by ID (public)
// @route   GET /api/shops/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('employees', 'firstName lastName email phone specialties');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.status !== 'active') {
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

// @desc    Get shop services (public)
// @route   GET /api/shops/:id/services
// @access  Public
router.get('/:id/services', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop || shop.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const services = await Service.find({
      shop: req.params.id,
      isActive: true
    }).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shop services',
      error: error.message
    });
  }
});

// @desc    Get shop employees (public)
// @route   GET /api/shops/:id/employees
// @access  Public
router.get('/:id/employees', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop || shop.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const barbers = await Barber.find({
      shop: req.params.id,
      isAvailable: true
    }).populate('user', 'firstName lastName email phone');

    res.json({
      success: true,
      data: barbers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shop employees',
      error: error.message
    });
  }
});

// @desc    Get shop availability (public)
// @route   GET /api/shops/:id/availability
// @access  Public
router.get('/:id/availability', [
  query('date').isISO8601().withMessage('Valid date is required'),
  query('barber').optional().isMongoId().withMessage('Valid barber ID is required'),
  query('service').optional().isMongoId().withMessage('Valid service ID is required')
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

    const { date, barber, service } = req.query;

    const shop = await Shop.findById(req.params.id);
    
    if (!shop || shop.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const businessHours = shop.businessHours[dayOfWeek];

    if (!businessHours || !businessHours.isOpen) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: 'Shop is closed on this day',
          timeSlots: []
        }
      });
    }

    // Get service duration if service is specified
    let serviceDuration = 60; // Default 1 hour
    if (service) {
      const serviceDoc = await Service.findById(service);
      if (serviceDoc) {
        serviceDuration = serviceDoc.duration;
      }
    }

    // Generate time slots
    const timeSlots = [];
    const startTime = new Date(`2000-01-01T${businessHours.open}`);
    const endTime = new Date(`2000-01-01T${businessHours.close}`);
    
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Check if this time slot is available
      const slotEndTime = new Date(currentTime.getTime() + serviceDuration * 60000);
      const slotEndString = slotEndTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (slotEndTime <= endTime) {
        timeSlots.push({
          start: timeString,
          end: slotEndString,
          available: true
        });
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
    }

    // Filter by barber availability if specified
    if (barber) {
      const barberDoc = await Barber.findById(barber);
      if (barberDoc && barberDoc.availability && barberDoc.availability[dayOfWeek]) {
        const barberHours = barberDoc.availability[dayOfWeek];
        if (!barberHours.isAvailable) {
          timeSlots.forEach(slot => slot.available = false);
        } else {
          // Apply barber-specific availability
          timeSlots.forEach(slot => {
            const slotStart = new Date(`2000-01-01T${slot.start}`);
            const slotEnd = new Date(`2000-01-01T${slot.end}`);
            
            const isAvailable = barberHours.slots.some(barberSlot => {
              const barberStart = new Date(`2000-01-01T${barberSlot.start}`);
              const barberEnd = new Date(`2000-01-01T${barberSlot.end}`);
              return slotStart >= barberStart && slotEnd <= barberEnd;
            });
            
            slot.available = isAvailable;
          });
        }
      }
    }

    // Check existing appointments
    const existingAppointments = await Appointment.find({
      shop: req.params.id,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Mark conflicting time slots as unavailable
    existingAppointments.forEach(appointment => {
      const appointmentStart = new Date(appointment.appointmentDate);
      const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.service?.duration || 60) * 60000);
      
      timeSlots.forEach(slot => {
        const slotStart = new Date(`2000-01-01T${slot.start}`);
        const slotEnd = new Date(`2000-01-01T${slot.end}`);
        
        if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
          slot.available = false;
        }
      });
    });

    res.json({
      success: true,
      data: {
        available: timeSlots.some(slot => slot.available),
        businessHours: businessHours,
        timeSlots: timeSlots.filter(slot => slot.available)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: error.message
    });
  }
});

// @desc    Get shop reviews (public)
// @route   GET /api/shops/:id/reviews
// @access  Public
router.get('/:id/reviews', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number')
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

    const { limit = 10, page = 1 } = req.query;

    const shop = await Shop.findById(req.params.id);
    
    if (!shop || shop.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // For now, return mock reviews since we don't have a Review model yet
    const mockReviews = [
      {
        id: '1',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          avatar: null
        },
        rating: 5,
        comment: 'Great service! Very professional and clean.',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        customer: {
          firstName: 'Jane',
          lastName: 'Smith',
          avatar: null
        },
        rating: 4,
        comment: 'Good haircut, friendly staff.',
        createdAt: new Date('2024-01-10')
      }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReviews = mockReviews.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockReviews.length,
        pages: Math.ceil(mockReviews.length / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shop reviews',
      error: error.message
    });
  }
});

module.exports = router; 