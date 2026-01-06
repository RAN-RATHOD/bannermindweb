const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

// ===========================================
// VALIDATION HELPERS
// ===========================================

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// ===========================================
// ROUTES
// ===========================================

/**
 * POST /api/contact
 * Submit a new contact form message
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    const errors = [];

    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!email || !isValidEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!message || message.trim().length < 10) {
      errors.push('Message must be at least 10 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Generate unique token
    const token = await Contact.generateToken();

    // Get client info for spam prevention
    const ipAddress = req.ip || 
      req.headers['x-forwarded-for'] || 
      req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Create contact entry
    const contact = new Contact({
      name: sanitizeInput(name),
      email: email.toLowerCase().trim(),
      message: sanitizeInput(message),
      token,
      status: 'OPEN',
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
      userAgent
    });

    // Save to database
    await contact.save();

    // Send emails asynchronously (don't block response)
    const emailPromises = [];

    // Admin notification
    emailPromises.push(
      emailService.sendAdminNotification(contact)
        .then(result => {
          if (result.success) {
            contact.adminEmailSent = true;
          }
        })
        .catch(err => {
          console.error('Admin email failed:', err.message);
        })
    );

    // User confirmation
    emailPromises.push(
      emailService.sendUserConfirmation(contact)
        .then(result => {
          if (result.success) {
            contact.userEmailSent = true;
          }
        })
        .catch(err => {
          console.error('User email failed:', err.message);
        })
    );

    // Wait for emails and update contact status
    Promise.all(emailPromises)
      .then(() => contact.save())
      .catch(err => console.error('Email status update failed:', err.message));

    // Return success response immediately
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: {
        token: contact.token,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact submission error:', error);

    // Handle duplicate token (extremely rare)
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: 'Please try again'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
});

/**
 * GET /api/contact/:token
 * Get contact status by token (for users to check their ticket)
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token format
    if (!token || !/^BM-\d{4}-[A-Z0-9]{6}$/.test(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket format'
      });
    }

    const contact = await Contact.findOne({ token }).select('token status createdAt updatedAt');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: {
        token: contact.token,
        status: contact.status,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });

  } catch (error) {
    console.error('Contact lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
});

// ===========================================
// ADMIN ROUTES (Protected - implement auth middleware for production)
// ===========================================

/**
 * GET /api/contact/admin/all
 * Get all contacts (Admin only)
 */
router.get('/admin/all', async (req, res) => {
  try {
    // TODO: Add authentication middleware for production
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) {
      query.status = status.toUpperCase();
    }

    const contacts = await Contact.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin contacts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
});

/**
 * PATCH /api/contact/admin/:token
 * Update contact status (Admin only)
 */
router.patch('/admin/:token', async (req, res) => {
  try {
    // TODO: Add authentication middleware for production
    const { token } = req.params;
    const { status, priority, adminNotes } = req.body;

    const updateFields = {};
    
    if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      updateFields.status = status;
    }
    
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      updateFields.priority = priority;
    }
    
    if (adminNotes !== undefined) {
      updateFields.adminNotes = sanitizeInput(adminNotes);
    }

    const contact = await Contact.findOneAndUpdate(
      { token },
      updateFields,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
});

/**
 * GET /api/contact/admin/stats
 * Get contact statistics (Admin only)
 */
router.get('/admin/stats', async (req, res) => {
  try {
    // TODO: Add authentication middleware for production
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContacts = await Contact.countDocuments();
    const todayContacts = await Contact.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      success: true,
      data: {
        total: totalContacts,
        today: todayContacts,
        byStatus: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
});

module.exports = router;








