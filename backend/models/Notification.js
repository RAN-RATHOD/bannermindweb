const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    // Validate international phone format
    validate: {
      validator: function(v) {
        return /^\+[1-9]\d{6,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  notificationType: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['sms', 'whatsapp'],
      message: '{VALUE} is not a valid notification type'
    },
    default: 'whatsapp'
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Track notification attempts
  notificationAttempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date,
    default: null
  },
  // Store any delivery errors
  lastError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ notified: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ notificationType: 1 });

// Static method to get all unnotified subscribers
notificationSchema.statics.getUnnotified = function() {
  return this.find({ notified: false }).sort({ createdAt: 1 });
};

// Static method to get subscriber stats
notificationSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const notified = await this.countDocuments({ notified: true });
  const pending = await this.countDocuments({ notified: false });
  const smsCount = await this.countDocuments({ notificationType: 'sms' });
  const whatsappCount = await this.countDocuments({ notificationType: 'whatsapp' });
  
  return {
    total,
    notified,
    pending,
    byType: {
      sms: smsCount,
      whatsapp: whatsappCount
    }
  };
};

// Instance method to mark as notified
notificationSchema.methods.markAsNotified = function() {
  this.notified = true;
  this.notifiedAt = new Date();
  return this.save();
};

// Instance method to record failed attempt
notificationSchema.methods.recordFailedAttempt = function(error) {
  this.notificationAttempts += 1;
  this.lastAttemptAt = new Date();
  this.lastError = error;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;










