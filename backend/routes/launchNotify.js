const express = require('express');
const router = express.Router();
const LaunchSubscriber = require('../models/LaunchSubscriber');
const emailService = require('../services/emailService');

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @route   POST /api/launch-notify
 * @desc    Subscribe email for launch notifications
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email presence
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check for existing subscription
    const existing = await LaunchSubscriber.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: 'This email is already subscribed for launch notifications'
      });
    }

    // Create new subscription
    const subscriber = new LaunchSubscriber({
      email: trimmedEmail,
      source: 'website'
    });

    await subscriber.save();

    // Send confirmation email
    try {
      await emailService.sendLaunchSubscriptionConfirmation(trimmedEmail);
      console.log(`✅ Launch subscription confirmation sent to ${trimmedEmail}`);
    } catch (emailError) {
      console.error(`⚠️ Confirmation email failed for ${trimmedEmail}:`, emailError.message);
      // Don't fail the subscription if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'You\'re on the list! We\'ll notify you when BannerMind launches.',
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Launch notify subscription error:', error);

    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: 'This email is already subscribed for launch notifications'
      });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/launch-notify/stats
 * @desc    Get subscription statistics (Admin only)
 * @access  Admin
 */
router.get('/stats', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const stats = await LaunchSubscriber.getStats();
    
    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/launch-notify/subscribers
 * @desc    Get all subscribers (Admin only)
 * @access  Admin
 */
router.get('/subscribers', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { page = 1, limit = 50 } = req.query;
    
    const subscribers = await LaunchSubscriber.find()
      .sort({ subscribedAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('email subscribedAt notified');

    const total = await LaunchSubscriber.countDocuments();

    return res.json({
      success: true,
      subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


