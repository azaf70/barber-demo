import express from 'express';
import { body, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Barber from '../models/Barber.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all appointments (filtered by user role)
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, date, barber } = req.query;
    const filter = {};

    // Filter by user role
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'barber') {
      const barberDoc = await Barber.findOne({ user: req.user._id });
      if (barberDoc) {
        filter.barber = barberDoc._id;
      }
    }

    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    if (barber) filter.barber = barber;

    const appointments = await Appointment.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties')
      .populate('service', 'name price duration')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties')
      .populate('service', 'name price duration');

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
router.post('/', protect, [
  body('barber').isMongoId().withMessage('Valid barber ID is required'),
  body('service').isMongoId().withMessage('Valid service ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { barber, service, date, startTime, notes } = req.body;

    // Check if service exists
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    // Check if barber exists
    const barberDoc = await Barber.findById(barber);
    if (!barberDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'Barber not found' 
      });
    }

    // Calculate end time based on service duration
    const startDateTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + serviceDoc.duration * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      barber,
      date: new Date(date),
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        success: false,
        message: 'Time slot is not available' 
      });
    }

    const appointment = await Appointment.create({
      customer: req.user._id,
      barber,
      service,
      date: new Date(date),
      startTime,
      endTime,
      totalPrice: serviceDoc.price,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties')
      .populate('service', 'name price duration');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Barber/Admin)
router.put('/:id/status', protect, authorize('barber', 'admin'), [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
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

    appointment.status = req.body.status;
    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties')
      .populate('service', 'name price duration');

    res.json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
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

    appointment.status = 'cancelled';
    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('barber', 'user specialties')
      .populate('service', 'name price duration');

    res.json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router; 