const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Service = require('../models/Service');
const Shop = require('../models/Shop');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get all services (public)
// @route   GET /api/services
// @access  Public
router.get('/', [
  query('category').optional().isString().withMessage('Category must be a string'),
  query('shop').optional().isMongoId().withMessage('Valid shop ID is required'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
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
      category, 
      shop, 
      minPrice, 
      maxPrice,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { isActive: true };
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (shop) {
      filter.shop = shop;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Math.round(parseFloat(minPrice) * 100); // Convert to cents
      if (maxPrice) filter.price.$lte = Math.round(parseFloat(maxPrice) * 100); // Convert to cents
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const services = await Service.find(filter)
      .populate('shop', 'name slug address')
      .sort({ category: 1, name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      data: services,
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
      message: 'Error fetching services',
      error: error.message
    });
  }
});

// @desc    Get service categories (public)
// @route   GET /api/services/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service categories',
      error: error.message
    });
  }
});

// @desc    Get service by ID (public)
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('shop', 'name slug address businessHours contact');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
});

// @desc    Get services by shop
// @route   GET /api/services/shop/:shopId
// @access  Public
router.get('/shop/:shopId', async (req, res) => {
  try {
    const services = await Service.find({ 
      shop: req.params.shopId, 
      isActive: true 
    })
    .populate('shop', 'name slug')
    .sort({ isPopular: -1, price: 1 });

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

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const services = await Service.find({ 
      isPopular: true, 
      isActive: true 
    })
    .populate('shop', 'name slug rating')
    .sort({ 'stats.totalBookings': -1 })
    .limit(10);

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular services',
      error: error.message
    });
  }
});

// @desc    Create service
// @route   POST /api/services
// @access  Private (Admin/Barber)
router.post('/', auth.protect, auth.authorize('admin', 'barber'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('shop').isMongoId().withMessage('Valid shop ID is required'),
  body('category').isIn(['haircut', 'beard-trim', 'shave', 'hair-coloring', 'styling', 'kids-cut', 'fade', 'pompadour', 'undercut', 'textured-cut', 'consultation', 'product']).withMessage('Valid category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes')
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
        message: 'Not authorized to create services for this shop'
      });
    }

    const service = await Service.create(req.body);

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

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin/Barber)
router.put('/:id', auth.protect, auth.authorize('admin', 'barber'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').optional().isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes')
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

    // Check if user can manage this service's shop
    if (!req.user.canManageShop(service.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('shop', 'name slug');

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

// @desc    Update service status
// @route   PATCH /api/services/:id/status
// @access  Private (Admin/Barber)
router.patch('/:id/status', auth.protect, auth.authorize('admin', 'barber'), [
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  body('isPopular').optional().isBoolean().withMessage('isPopular must be boolean'),
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

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user can manage this service's shop
    if (!req.user.canManageShop(service.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('shop', 'name slug');

    res.json({
      success: true,
      message: 'Service status updated successfully',
      data: updatedService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service status',
      error: error.message
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
router.delete('/:id', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user can manage this service's shop
    if (!req.user.canManageShop(service.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
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

// @desc    Get service analytics
// @route   GET /api/services/:id/analytics
// @access  Private (Admin/Barber)
router.get('/:id/analytics', auth.protect, auth.authorize('admin', 'barber'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user can manage this service's shop
    if (!req.user.canManageShop(service.shop)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view service analytics'
      });
    }

    const analytics = {
      totalBookings: service.stats.totalBookings,
      totalRevenue: service.stats.totalRevenue,
      averageRating: service.stats.averageRating,
      totalReviews: service.stats.totalReviews
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service analytics',
      error: error.message
    });
  }
});

module.exports = router; 