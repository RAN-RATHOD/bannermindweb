const mongoose = require('mongoose');

/**
 * Contact Schema - Stores all contact form submissions
 * Each submission gets a unique ticket/token for tracking
 */
const contactSchema = new mongoose.Schema({
  // User information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  
  // Unique ticket/token number (BM-YYYY-XXXXXX)
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  
  // Email status tracking
  adminEmailSent: {
    type: Boolean,
    default: false
  },
  
  userEmailSent: {
    type: Boolean,
    default: false
  },
  
  // Admin notes (for internal use)
  adminNotes: {
    type: String,
    default: ''
  },
  
  // IP address for spam prevention
  ipAddress: {
    type: String,
    default: ''
  },
  
  // User agent for analytics
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for efficient queries
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

/**
 * Generate unique ticket token
 * Format: BM-YYYY-XXXXXX (e.g., BM-2026-A9F21C)
 */
contactSchema.statics.generateToken = async function() {
  const year = new Date().getFullYear();
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token;
  let isUnique = false;
  
  // Keep generating until we get a unique token
  while (!isUnique) {
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    token = `BM-${year}-${randomPart}`;
    
    // Check if token already exists
    const existingContact = await this.findOne({ token });
    if (!existingContact) {
      isUnique = true;
    }
  }
  
  return token;
};

/**
 * Get formatted date for emails
 */
contactSchema.methods.getFormattedDate = function() {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  }).format(this.createdAt);
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;











