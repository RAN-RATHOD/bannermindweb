const mongoose = require('mongoose');

/**
 * LaunchSubscriber Schema
 * Stores email addresses for launch notification subscribers
 */
const launchSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ]
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'api', 'manual']
  }
}, {
  timestamps: true
});

// Index for faster lookups
launchSubscriberSchema.index({ email: 1 });
launchSubscriberSchema.index({ notified: 1 });

/**
 * Static method to get subscription statistics
 */
launchSubscriberSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const notified = await this.countDocuments({ notified: true });
  const pending = await this.countDocuments({ notified: false });
  
  return {
    total,
    notified,
    pending
  };
};

/**
 * Static method to get all unnotified subscribers
 */
launchSubscriberSchema.statics.getUnnotified = async function() {
  return await this.find({ notified: false }).sort({ subscribedAt: 1 });
};

/**
 * Instance method to mark as notified
 */
launchSubscriberSchema.methods.markAsNotified = async function() {
  this.notified = true;
  this.notifiedAt = new Date();
  return await this.save();
};

const LaunchSubscriber = mongoose.model('LaunchSubscriber', launchSubscriberSchema);

module.exports = LaunchSubscriber;


