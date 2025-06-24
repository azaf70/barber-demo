const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop is required']
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: [true, 'Barber is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
    trim: true
  },
  customerNotes: {
    type: String,
    maxlength: [500, 'Customer notes cannot be more than 500 characters'],
    trim: true
  },
  barberNotes: {
    type: String,
    maxlength: [500, 'Barber notes cannot be more than 500 characters'],
    trim: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot be more than 1000 characters'],
    trim: true
  },
  reviewDate: {
    type: Date
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'online', 'pending'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true
    },
    transactionId: String,
    paidAt: Date
  },
  commission: {
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 10
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidAt: Date
  },
  cancellation: {
    reason: {
      type: String,
      enum: ['customer_request', 'barber_unavailable', 'shop_closed', 'weather', 'emergency', 'other']
    },
    notes: {
      type: String,
      maxlength: [500, 'Cancellation notes cannot be more than 500 characters']
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'barber', 'shop_owner', 'system']
    },
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  reminders: {
    sent24h: {
      type: Boolean,
      default: false
    },
    sent1h: {
      type: Boolean,
      default: false
    },
    sent15min: {
      type: Boolean,
      default: false
    }
  },
  checkIn: {
    time: Date,
    method: {
      type: String,
      enum: ['manual', 'qr_code', 'app']
    }
  },
  checkOut: {
    time: Date,
    method: {
      type: String,
      enum: ['manual', 'qr_code', 'app']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ customer: 1 });
appointmentSchema.index({ shop: 1 });
appointmentSchema.index({ barber: 1 });
appointmentSchema.index({ service: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ appointmentTime: 1 });
appointmentSchema.index({ 'payment.status': 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  return `${this.appointmentTime} - ${this.endTime}`;
});

// Virtual for formatted price
appointmentSchema.virtual('formattedPrice').get(function() {
  return `£${this.price.toFixed(2)}`;
});

// Virtual for appointment status color
appointmentSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
    'no-show': 'gray'
  };
  return colors[this.status] || 'gray';
});

// Method to calculate commission
appointmentSchema.methods.calculateCommission = function() {
  this.commission.amount = (this.price * this.commission.percentage) / 100;
  return this.save();
};

// Method to mark as paid
appointmentSchema.methods.markAsPaid = function(paymentMethod, transactionId = null) {
  this.payment.method = paymentMethod;
  this.payment.status = 'paid';
  this.payment.paidAt = new Date();
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason, notes, cancelledBy, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    notes,
    cancelledBy,
    cancelledAt: new Date(),
    refundAmount
  };
  
  if (refundAmount > 0) {
    this.payment.status = 'refunded';
  }
  
  return this.save();
};

// Method to complete appointment
appointmentSchema.methods.complete = function() {
  this.status = 'completed';
  this.checkOut = {
    time: new Date(),
    method: 'manual'
  };
  return this.save();
};

// Method to add rating and review
appointmentSchema.methods.addReview = function(rating, review) {
  this.rating = rating;
  this.review = review;
  this.reviewDate = new Date();
  return this.save();
};

// Method to mark check in
appointmentSchema.methods.markCheckIn = function(method = 'manual') {
  this.checkIn = {
    time: new Date(),
    method
  };
  return this.save();
};

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  appointmentDateTime.setHours(
    parseInt(this.appointmentTime.split(':')[0]),
    parseInt(this.appointmentTime.split(':')[1])
  );
  return appointmentDateTime < now;
};

// Method to check if appointment is today
appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return today.toDateString() === appointmentDate.toDateString();
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  appointmentDateTime.setHours(
    parseInt(this.appointmentTime.split(':')[0]),
    parseInt(this.appointmentTime.split(':')[1])
  );
  return appointmentDateTime > now && this.status === 'confirmed';
};

// Static method to find appointments by status
appointmentSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to find appointments by shop
appointmentSchema.statics.findByShop = function(shopId) {
  return this.find({ shop: shopId });
};

// Static method to find appointments by barber
appointmentSchema.statics.findByBarber = function(barberId) {
  return this.find({ barber: barberId });
};

// Static method to find appointments by customer
appointmentSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId });
};

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    appointmentDate: { $gte: now },
    status: { $in: ['pending', 'confirmed'] }
  });
};

// Static method to find today's appointments
appointmentSchema.statics.findToday = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return this.find({
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

// Static method to get appointment statistics
appointmentSchema.statics.getStats = async function(startDate = null, endDate = null) {
  const filter = {};
  
  if (startDate || endDate) {
    filter.appointmentDate = {};
    if (startDate) filter.appointmentDate.$gte = startDate;
    if (endDate) filter.appointmentDate.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        noShow: { $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] } },
        totalRevenue: { $sum: '$price' },
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: { $cond: [{ $ne: ['$rating', null] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  };
};

module.exports = mongoose.model('Appointment', appointmentSchema); 