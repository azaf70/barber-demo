const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop is required']
  },
  specialties: [{
    type: String,
    enum: ['haircut', 'beard-trim', 'shave', 'hair-coloring', 'styling', 'kids-cut', 'fade', 'pompadour', 'undercut', 'textured-cut', 'consultation', 'product']
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    trim: true
  },
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expiryDate: Date
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    year: Number
  }],
  workingHours: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true }
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true }
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true }
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true }
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true }
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '16:00' },
      isWorking: { type: Boolean, default: true }
    },
    sunday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '14:00' },
      isWorking: { type: Boolean, default: false }
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOnLeave: {
    type: Boolean,
    default: false
  },
  leaveDates: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    isApproved: { type: Boolean, default: false }
  }],
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    customPrice: {
      type: Number,
      min: 0
    }
  }],
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
  stats: {
    totalAppointments: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    averageServiceTime: {
      type: Number,
      default: 30,
      min: 5
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  commission: {
    percentage: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    fixedAmount: {
      type: Number,
      default: 0
    }
  },
  employment: {
    startDate: {
      type: Date,
      default: Date.now
    },
    position: {
      type: String,
      default: 'Barber'
    },
    isFullTime: {
      type: Boolean,
      default: true
    },
    salary: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['commission', 'salary', 'hybrid'],
      default: 'commission'
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  portfolio: [{
    url: String,
    caption: String,
    category: String,
    isFeatured: { type: Boolean, default: false }
  }],
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    youtube: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  schedule: {
    maxAppointmentsPerDay: {
      type: Number,
      default: 10,
      min: 1,
      max: 20
    },
    breakDuration: {
      type: Number,
      default: 15,
      min: 0,
      max: 60
    },
    autoConfirm: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    notificationSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    workingPreferences: {
      maxConcurrentAppointments: { type: Number, default: 1 },
      preferredTimeSlots: [{ type: String }],
      avoidTimeSlots: [{ type: String }]
    }
  }
}, {
  timestamps: true
});

barberSchema.index({ user: 1 });
barberSchema.index({ shop: 1 });
barberSchema.index({ isAvailable: 1 });
barberSchema.index({ isVerified: 1 });
barberSchema.index({ status: 1 });
barberSchema.index({ 'rating.average': -1 });
barberSchema.index({ experience: -1 });
barberSchema.index({ 'stats.totalAppointments': -1 });

barberSchema.virtual('fullName').get(function() {
  if (this.populated('user')) {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
  return '';
});

barberSchema.virtual('formattedExperience').get(function() {
  if (this.experience === 0) return 'New';
  if (this.experience === 1) return '1 year';
  return `${this.experience} years`;
});

barberSchema.methods.updateRating = function(newRating) {
  this.rating.totalReviews += 1;
  this.rating.totalRating += newRating;
  this.rating.average = this.rating.totalRating / this.rating.totalReviews;
  return this.save();
};

barberSchema.methods.updateAppointmentStats = function(amount, completed = true, serviceTime = null) {
  this.stats.totalAppointments += 1;
  
  if (completed) {
    this.stats.totalRevenue += amount;
    if (serviceTime) {
      this.stats.averageServiceTime = (
        (this.stats.averageServiceTime * (this.stats.totalAppointments - 1) + serviceTime) / 
        this.stats.totalAppointments
      );
    }
  }
  
  const completedAppointments = this.stats.totalAppointments - (this.stats.totalAppointments - this.stats.totalRevenue / amount);
  this.stats.completionRate = (completedAppointments / this.stats.totalAppointments) * 100;
  
  return this.save();
};

barberSchema.methods.isWorkingAt = function(dayOfWeek, time) {
  const day = dayOfWeek.toLowerCase();
  const dayHours = this.workingHours[day];
  
  if (!dayHours || !dayHours.isWorking) {
    return false;
  }
  
  return time >= dayHours.start && time <= dayHours.end;
};

barberSchema.methods.getWorkingHours = function(dayOfWeek) {
  const day = dayOfWeek.toLowerCase();
  const dayHours = this.workingHours[day];
  
  if (!dayHours || !dayHours.isWorking) {
    return null;
  }
  
  return {
    start: dayHours.start,
    end: dayHours.end
  };
};

barberSchema.methods.offersService = function(serviceId) {
  return this.services.some(s => 
    s.service.toString() === serviceId.toString() && s.isActive
  );
};

barberSchema.methods.getServicePrice = function(serviceId, defaultPrice) {
  const barberService = this.services.find(s => 
    s.service.toString() === serviceId.toString()
  );
  
  return barberService && barberService.customPrice 
    ? barberService.customPrice 
    : defaultPrice;
};

barberSchema.methods.addService = function(serviceId, customPrice = null) {
  const existingService = this.services.find(s => 
    s.service.toString() === serviceId.toString()
  );
  
  if (existingService) {
    existingService.isActive = true;
    if (customPrice !== null) {
      existingService.customPrice = customPrice;
    }
  } else {
    this.services.push({
      service: serviceId,
      isActive: true,
      customPrice: customPrice
    });
  }
  
  return this.save();
};

barberSchema.methods.removeService = function(serviceId) {
  const serviceIndex = this.services.findIndex(s => 
    s.service.toString() === serviceId.toString()
  );
  
  if (serviceIndex !== -1) {
    this.services[serviceIndex].isActive = false;
  }
  
  return this.save();
};

barberSchema.statics.findAvailable = function() {
  return this.find({ 
    isAvailable: true, 
    isVerified: true, 
    status: 'active' 
  });
};

barberSchema.statics.findByShop = function(shopId) {
  return this.find({ 
    shop: shopId, 
    isAvailable: true, 
    isVerified: true 
  });
};

barberSchema.statics.findBySpecialty = function(specialty) {
  return this.find({ 
    specialties: specialty, 
    isAvailable: true, 
    isVerified: true 
  });
};

barberSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 
    isAvailable: true, 
    isVerified: true,
    'rating.average': { $gte: 4.0 }
  })
  .sort({ 'rating.average': -1, 'rating.totalReviews': -1 })
  .limit(limit);
};

barberSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: ['$isAvailable', 1, 0] } },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        totalAppointments: { $sum: '$stats.totalAppointments' },
        totalRevenue: { $sum: '$stats.totalRevenue' },
        averageRating: { $avg: '$rating.average' },
        averageExperience: { $avg: '$experience' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    available: 0,
    verified: 0,
    active: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
    averageExperience: 0
  };
};

module.exports = mongoose.model('Barber', barberSchema); 