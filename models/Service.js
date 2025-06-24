const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop is required']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['haircut', 'beard-trim', 'shave', 'hair-coloring', 'styling', 'kids-cut', 'fade', 'pompadour', 'undercut', 'textured-cut', 'consultation', 'product']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{ type: String }]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{ type: String }]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{ type: String }]
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{ type: String }]
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{ type: String }]
    },
    saturday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{ type: String }]
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{ type: String }]
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  includes: [{
    type: String,
    trim: true
  }],
  stats: {
    totalBookings: {
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
    }
  },
  settings: {
    maxBookingsPerDay: {
      type: Number,
      default: 10
    },
    requiresConsultation: {
      type: Boolean,
      default: false
    },
    requiresDeposit: {
      type: Boolean,
      default: false
    },
    depositAmount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
serviceSchema.index({ shop: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ isPopular: 1 });
serviceSchema.index({ isFeatured: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ 'stats.totalBookings': -1 });
serviceSchema.index({ 'stats.averageRating': -1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return `£${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
});

// Method to update booking stats
serviceSchema.methods.updateBookingStats = function(amount, rating = null) {
  this.stats.totalBookings += 1;
  this.stats.totalRevenue += amount;
  
  if (rating) {
    this.stats.totalReviews += 1;
    this.stats.averageRating = (
      (this.stats.averageRating * (this.stats.totalReviews - 1) + rating) / 
      this.stats.totalReviews
    );
  }
  
  return this.save();
};

// Method to check availability for a specific time
serviceSchema.methods.isAvailableAt = function(dayOfWeek, time) {
  const day = dayOfWeek.toLowerCase();
  const dayAvailability = this.availability[day];
  
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return false;
  }
  
  if (!dayAvailability.slots || dayAvailability.slots.length === 0) {
    return true; // No specific slots defined, assume available
  }
  
  return dayAvailability.slots.includes(time);
};

// Method to get available slots for a day
serviceSchema.methods.getAvailableSlots = function(dayOfWeek) {
  const day = dayOfWeek.toLowerCase();
  const dayAvailability = this.availability[day];
  
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return [];
  }
  
  return dayAvailability.slots || [];
};

// Static method to find active services
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find popular services
serviceSchema.statics.findPopular = function() {
  return this.find({ isPopular: true, isActive: true });
};

// Static method to find services by category
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to find services by shop
serviceSchema.statics.findByShop = function(shopId) {
  return this.find({ shop: shopId, isActive: true });
};

// Static method to find services within price range
serviceSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  const filter = { isActive: true };
  
  if (minPrice !== undefined) filter.price = { $gte: minPrice };
  if (maxPrice !== undefined) {
    if (filter.price) {
      filter.price.$lte = maxPrice;
    } else {
      filter.price = { $lte: maxPrice };
    }
  }
  
  return this.find(filter);
};

// Static method to get service statistics
serviceSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        popular: { $sum: { $cond: ['$isPopular', 1, 0] } },
        featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
        totalBookings: { $sum: '$stats.totalBookings' },
        totalRevenue: { $sum: '$stats.totalRevenue' },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    active: 0,
    popular: 0,
    featured: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averagePrice: 0
  };
};

module.exports = mongoose.model('Service', serviceSchema); 