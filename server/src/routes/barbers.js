const express = require('express');
const { body, validationResult } = require('express-validator');
const Barber = require('../models/Barber');
const User = require('../models/User');
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get all barbers
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

// @desc    Get barbers by shop
// @route   GET /api/barbers/shop/:shopId
// @access  Public
router.get('/shop/:shopId', async (req, res) => {
  try {
    const barbers = await Barber.find({ 
      shop: req.params.shopId, 
      isAvailable: true,
      isVerified: true
    })
    .populate('user', 'firstName lastName email phone bio')
    .populate('services.service', 'name price duration category')
    .sort({ 'rating.average': -1, experience: -1 });

    res.json({
      success: true,
      data: barbers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shop barbers',
      error: error.message
    });
  }
});

// @desc    Get top rated barbers
// @route   GET /api/barbers/top-rated
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const barbers = await Barber.find({ 
      isAvailable: true, 
      isVerified: true,
      'rating.average': { $gte: 4.5 }
    })
    .populate('user', 'firstName lastName bio')
    .populate('shop', 'name slug')
    .sort({ 'rating.average': -1, 'rating.totalReviews': -1 })
    .limit(10);

    res.json({
      success: true,
      data: barbers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top rated barbers',
      error: error.message
    });
  }
});

// @desc    Get single barber
// @route   GET /api/barbers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id)
      .populate('user', 'firstName lastName email phone bio')
      .populate('shop', 'name slug address businessHours rating')
      .populate('services.service', 'name price duration category description');

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    res.json({
      success: true,
      data: barber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching barber',
      error: error.message
    });
  }
});

// @desc    Create barber profile
// @route   POST /api/barbers
// @access  Private (Shop Owner)
router.post('/', [
  auth.protect,
  auth.authorize('shop_owner', 'super_admin'),
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('shop').isMongoId().withMessage('Valid shop ID is required'),
  body('specialties').isArray({ min: 1 }).withMessage('At least one specialty is required'),
  body('experience').isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('bio').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Bio must be between 10 and 500 characters')
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

    // Check if user can manage this shop
    if (!req.user.canManageShop(req.body.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add barbers to this shop'
      });
    }

    // Check if user exists and is a barber
    const user = await User.findById(req.body.user);
    if (!user || user.role !== 'barber') {
      return res.status(400).json({
        success: false,
        message: 'User must be a barber'
      });
    }

    // Check if barber already exists for this shop
    const existingBarber = await Barber.findOne({ 
      user: req.body.user, 
      shop: req.body.shop 
    });
    if (existingBarber) {
      return res.status(400).json({
        success: false,
        message: 'Barber already exists for this shop'
      });
    }

    const barber = await Barber.create(req.body);

    // Update user's employedAt field
    await User.findByIdAndUpdate(req.body.user, { 
      employedAt: req.body.shop 
    });

    res.status(201).json({
      success: true,
      message: 'Barber added successfully',
      data: barber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating barber',
      error: error.message
    });
  }
});

// @desc    Update barber profile
// @route   PUT /api/barbers/:id
// @access  Private (Shop Owner)
router.put('/:id', [
  auth.protect,
  auth.authorize('shop_owner', 'super_admin'),
  body('specialties').optional().isArray({ min: 1 }).withMessage('At least one specialty is required'),
  body('experience').optional().isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('bio').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Bio must be between 10 and 500 characters')
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

    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    // Check if user can manage this barber's shop
    if (!req.user.canManageShop(barber.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this barber'
      });
    }

    const updatedBarber = await Barber.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone bio')
    .populate('shop', 'name slug');

    res.json({
      success: true,
      message: 'Barber updated successfully',
      data: updatedBarber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating barber',
      error: error.message
    });
  }
});

// @desc    Update barber status
// @route   PATCH /api/barbers/:id/status
// @access  Private (Shop Owner)
router.patch('/:id/status', [
  auth.protect,
  auth.authorize('shop_owner', 'super_admin'),
  body('isAvailable').isBoolean().withMessage('isAvailable must be boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be boolean'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
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

    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    // Check if user can manage this barber's shop
    if (!req.user.canManageShop(barber.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this barber'
      });
    }

    const updatedBarber = await Barber.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone bio')
    .populate('shop', 'name slug');

    res.json({
      success: true,
      message: 'Barber status updated successfully',
      data: updatedBarber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating barber status',
      error: error.message
    });
  }
});

// @desc    Remove barber from shop
// @route   DELETE /api/barbers/:id
// @access  Private (Shop Owner)
router.delete('/:id', auth.protect, auth.authorize('shop_owner', 'super_admin'), async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    // Check if user can manage this barber's shop
    if (!req.user.canManageShop(barber.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this barber'
      });
    }

    // Update user's employedAt field
    await User.findByIdAndUpdate(barber.user, { 
      employedAt: null 
    });

    await Barber.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Barber removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing barber',
      error: error.message
    });
  }
});

// @desc    Get barber analytics
// @route   GET /api/barbers/:id/analytics
// @access  Private (Shop Owner)
router.get('/:id/analytics', auth.protect, auth.authorize('shop_owner', 'super_admin'), async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    // Check if user can manage this barber's shop
    if (!req.user.canManageShop(barber.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view barber analytics'
      });
    }

    const analytics = {
      totalAppointments: barber.stats.totalAppointments,
      totalRevenue: barber.stats.totalRevenue,
      averageRating: barber.rating.average,
      totalReviews: barber.rating.totalReviews,
      completionRate: barber.stats.completionRate,
      averageServiceTime: barber.stats.averageServiceTime
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching barber analytics',
      error: error.message
    });
  }
});

module.exports = router; 