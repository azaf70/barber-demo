const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Barber = require('../models/Barber');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get all users (super admin only)
// @route   GET /api/users
// @access  Private (super admin)
router.get('/', auth.protect, auth.authorize('super_admin'), async (req, res) => {
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
// @route   GET /api/users/role/:role
// @access  Private (super admin)
router.get('/role/:role', auth.protect, auth.authorize('super_admin'), async (req, res) => {
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

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private (user)
router.get('/profile', auth.protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('ownedShops', 'name slug status rating')
      .populate('employedAt', 'name slug status rating');

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

// @desc    Get user by ID (super admin only)
// @route   GET /api/users/:id
// @access  Private (super admin)
router.get('/:id', auth.protect, auth.authorize('super_admin'), async (req, res) => {
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
// @route   POST /api/users
// @access  Private (super admin)
router.post('/', [
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (user)
router.put('/profile', [
  auth.protect,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
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

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('ownedShops', 'name slug status rating')
    .populate('employedAt', 'name slug status rating');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Update user (super admin only)
// @route   PUT /api/users/:id
// @access  Private (super admin)
router.put('/:id', [
  auth.protect,
  auth.authorize('super_admin'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('role').optional().isIn(['customer', 'barber', 'shop_owner', 'super_admin']).withMessage('Valid role is required'),
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('ownedShops', 'name slug status rating')
    .populate('employedAt', 'name slug status rating');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Update user status (super admin only)
// @route   PATCH /api/users/:id/status
// @access  Private (super admin)
router.patch('/:id/status', [
  auth.protect,
  auth.authorize('super_admin'),
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be boolean')
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('ownedShops', 'name slug status rating')
    .populate('employedAt', 'name slug status rating');

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// @desc    Change password
// @route   PATCH /api/users/change-password
// @access  Private (user)
router.patch('/change-password', [
  auth.protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});

// Delete user (super admin only)
router.delete('/:id', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user owns shops
    if (user.role === 'shop_owner' && user.ownedShops && user.ownedShops.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user who owns shops'
      });
    }

    // Check if user is employed at a shop
    if (user.employedAt) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user who is employed at a shop'
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

// Get user analytics (super admin only)
router.get('/analytics/overview', auth.protect, auth.authorize('super_admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const barbers = await User.countDocuments({ role: 'barber' });
    const shopOwners = await User.countDocuments({ role: 'shop_owner' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    const analytics = {
      totalUsers,
      customers,
      barbers,
      shopOwners,
      activeUsers,
      verifiedUsers,
      activePercentage: (activeUsers / totalUsers * 100).toFixed(2),
      verifiedPercentage: (verifiedUsers / totalUsers * 100).toFixed(2)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
});

module.exports = router; 