const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'barber', 'shop_owner', 'super_admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  ownedShops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  }],
  employedAt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  emailVerifiedAt: {
    type: Date
  },
  phoneVerifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isVerified: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if user is a shop owner
userSchema.methods.isShopOwner = function() {
  return this.role === 'shop_owner';
};

// Method to check if user is a super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

// Method to check if user can manage a shop
userSchema.methods.canManageShop = function(shopId) {
  if (this.role === 'super_admin') return true;
  if (this.role === 'shop_owner' && this.ownedShops.includes(shopId)) return true;
  return false;
};

// Method to check if user can access shop data
userSchema.methods.canAccessShop = function(shopId) {
  if (this.role === 'super_admin') return true;
  if (this.role === 'shop_owner' && this.ownedShops.includes(shopId)) return true;
  if (this.role === 'barber' && this.employedAt && this.employedAt.toString() === shopId.toString()) return true;
  return false;
};

// Method to get user's shops (owned or employed)
userSchema.methods.getShops = function() {
  const shops = [];
  if (this.ownedShops && this.ownedShops.length > 0) {
    shops.push(...this.ownedShops);
  }
  if (this.employedAt) {
    shops.push(this.employedAt);
  }
  return shops;
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find verified users
userSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, isActive: true });
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
        barbers: { $sum: { $cond: [{ $eq: ['$role', 'barber'] }, 1, 0] } },
        shopOwners: { $sum: { $cond: [{ $eq: ['$role', 'shop_owner'] }, 1, 0] } },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    customers: 0,
    barbers: 0,
    shopOwners: 0,
    active: 0,
    verified: 0
  };
};

module.exports = mongoose.model('User', userSchema); 