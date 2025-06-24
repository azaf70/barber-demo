const express = require('express');
const { body, validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all shops (public)
router.get('/', async (req, res) => {
  try {
    const { 
      status = 'active', 
      city, 
      specialty, 
      rating, 
      featured,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { status };
    
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (specialty) {
      filter.specialties = specialty;
    }
    
    if (rating) {
      filter['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const shops = await Shop.find(filter)
      .populate('owner', 'firstName lastName email phone')
      .sort({ isFeatured: -1, 'rating.average': -1, createdAt: -1 })
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

module.exports = router; 