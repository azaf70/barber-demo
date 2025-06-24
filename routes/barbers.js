import express from 'express';
import { body, validationResult } from 'express-validator';
import Barber from '../models/Barber.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all barbers
// @route   GET /api/barbers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isAvailable, specialty } = req.query;
    const filter = {};

    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (specialty) filter.specialties = specialty;

    const barbers = await Barber.find(filter)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('services', 'name price duration category');

    res.json({
      success: true,
      count: barbers.length,
      data: barbers
    });
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Get single barber
// @route   GET /api/barbers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('services', 'name price duration category');

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
    console.error('Get barber error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Create barber profile
// @route   POST /api/barbers
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('specialties').isArray().withMessage('Specialties must be an array'),
  body('specialties.*').isIn(['haircut', 'shave', 'beard-trim', 'hair-coloring', 'styling', 'kids-cut']).withMessage('Invalid specialty'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { user, specialties, experience, bio, workingHours } = req.body;

    // Check if user exists and is not already a barber
    const userDoc = await User.findById(user);
    if (!userDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const existingBarber = await Barber.findOne({ user });
    if (existingBarber) {
      return res.status(400).json({ 
        success: false,
        message: 'User is already a barber' 
      });
    }

    // Update user role to barber
    userDoc.role = 'barber';
    await userDoc.save();

    const barber = await Barber.create({
      user,
      specialties,
      experience,
      bio,
      workingHours
    });

    const populatedBarber = await Barber.findById(barber._id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('services', 'name price duration category');

    res.status(201).json({
      success: true,
      data: populatedBarber
    });
  } catch (error) {
    console.error('Create barber error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Update barber profile
// @route   PUT /api/barbers/:id
// @access  Private (Barber/Admin)
router.put('/:id', protect, authorize('barber', 'admin'), [
  body('specialties').optional().isArray(),
  body('specialties.*').optional().isIn(['haircut', 'shave', 'beard-trim', 'hair-coloring', 'styling', 'kids-cut']),
  body('experience').optional().isInt({ min: 0 }),
  body('bio').optional().isLength({ max: 500 }),
  body('isAvailable').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
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

    // Check if user can update this barber profile
    if (req.user.role === 'barber' && barber.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this barber profile' 
      });
    }

    const updatedBarber = await Barber.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone avatar')
     .populate('services', 'name price duration category');

    res.json({
      success: true,
      data: updatedBarber
    });
  } catch (error) {
    console.error('Update barber error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Update barber working hours
// @route   PUT /api/barbers/:id/hours
// @access  Private (Barber/Admin)
router.put('/:id/hours', protect, authorize('barber', 'admin'), async (req, res) => {
  try {
    const { workingHours } = req.body;

    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({ 
        success: false,
        message: 'Barber not found' 
      });
    }

    // Check if user can update this barber profile
    if (req.user.role === 'barber' && barber.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this barber profile' 
      });
    }

    barber.workingHours = workingHours;
    const updatedBarber = await barber.save();

    const populatedBarber = await Barber.findById(updatedBarber._id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('services', 'name price duration category');

    res.json({
      success: true,
      data: populatedBarber
    });
  } catch (error) {
    console.error('Update barber hours error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Add service to barber
// @route   PUT /api/barbers/:id/services
// @access  Private (Admin)
router.put('/:id/services', protect, authorize('admin'), [
  body('serviceId').isMongoId().withMessage('Valid service ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { serviceId } = req.body;

    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({ 
        success: false,
        message: 'Barber not found' 
      });
    }

    if (!barber.services.includes(serviceId)) {
      barber.services.push(serviceId);
      await barber.save();
    }

    const updatedBarber = await Barber.findById(barber._id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('services', 'name price duration category');

    res.json({
      success: true,
      data: updatedBarber
    });
  } catch (error) {
    console.error('Add service to barber error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Remove service from barber
// @route   DELETE /api/barbers/:id/services/:serviceId
// @access  Private (Admin)
router.delete('/:id/services/:serviceId', protect, authorize('admin'), async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({ 
        success: false,
        message: 'Barber not found' 
      });
    }

    barber.services = barber.services.filter(
      service => service.toString() !== req.params.serviceId
    );
    await barber.save();

    const updatedBarber = await Barber.findById(barber._id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('services', 'name price duration category');

    res.json({
      success: true,
      data: updatedBarber
    });
  } catch (error) {
    console.error('Remove service from barber error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router; 