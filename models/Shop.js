const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Shop description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Shop owner is required']
  },
  barbers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber'
  }],
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State/Province is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP/Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  businessHours: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '16:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '14:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  specialties: [{
    type: String,
    enum: ['haircut', 'beard-trim', 'shave', 'hair-coloring', 'styling', 'kids-cut', 'fade', 'pompadour', 'undercut', 'textured-cut', 'consultation', 'product']
  }],
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'card-payment', 'appointments', 'consultation', 'product-sales', 'music', 'tv', 'refreshments', 'wheelchair-access']
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalRating: {
      type: Number,
      default: 0
    }
  },
  commission: {
    percentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 50
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    features: [{
      name: String,
      isActive: { type: Boolean, default: true }
    }]
  },
  stats: {
    totalAppointments: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    monthlyGrowth: {
      type: Number,
      default: 0
    }
  },
  settings: {
    autoConfirm: {
      type: Boolean,
      default: false
    },
    requireDeposit: {
      type: Boolean,
      default: false
    },
    depositPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    cancellationHours: {
      type: Number,
      default: 24
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shopSchema.index({ name: 1 });
shopSchema.index({ owner: 1 });
shopSchema.index({ status: 1 });
shopSchema.index({ isVerified: 1 });
shopSchema.index({ isFeatured: 1 });
shopSchema.index({ 'address.city': 1 });
shopSchema.index({ 'address.state': 1 });
shopSchema.index({ 'rating.average': -1 });
shopSchema.index({ 'stats.totalRevenue': -1 });

// Pre-save middleware to generate slug
shopSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Method to update rating
shopSchema.methods.updateRating = function(newRating) {
  this.rating.totalReviews += 1;
  this.rating.totalRating += newRating;
  this.rating.average = this.rating.totalRating / this.rating.totalReviews;
  return this.save();
};

// Method to check if shop is open
shopSchema.methods.isOpen = function(dayOfWeek, time) {
  const hours = this.businessHours[dayOfWeek.toLowerCase()];
  if (!hours || !hours.isOpen) return false;
  
  return time >= hours.start && time <= hours.end;
};

// Method to get next available slot
shopSchema.methods.getNextAvailableSlot = function(date, duration = 30) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const hours = this.businessHours[dayOfWeek];
  
  if (!hours || !hours.isOpen) return null;
  
  // This is a simplified version - in a real app, you'd check against existing appointments
  return {
    date: date,
    startTime: hours.start,
    endTime: hours.end
  };
};

// Method to calculate commission
shopSchema.methods.calculateCommission = function(amount) {
  if (this.commission.type === 'percentage') {
    return (amount * this.commission.percentage) / 100;
  }
  return this.commission.percentage;
};

// Static method to find active shops
shopSchema.statics.findActive = function() {
  return this.find({ status: 'active', isVerified: true });
};

// Static method to find featured shops
shopSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, status: 'active', isVerified: true });
};

// Static method to find shops by location
shopSchema.statics.findByLocation = function(city, state) {
  const filter = { status: 'active', isVerified: true };
  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (state) filter['address.state'] = new RegExp(state, 'i');
  return this.find(filter);
};

// Static method to get shop statistics
shopSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
        totalRevenue: { $sum: '$stats.totalRevenue' },
        averageRating: { $avg: '$rating.average' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    active: 0,
    verified: 0,
    featured: 0,
    totalRevenue: 0,
    averageRating: 0
  };
};

module.exports = mongoose.model('Shop', shopSchema); 