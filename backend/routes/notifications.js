const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Middleware to validate phone number format
const validatePhoneNumber = (req, res, next) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (!e164Regex.test(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format. Use E.164 format (e.g., +14155551234)'
    });
  }

  next();
};

// Middleware for admin authentication
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid admin key'
    });
  }

  next();
};

/**
 * @route   POST /api/notifications/subscribe
 * @desc    Subscribe for launch notifications
 * @access  Public
 */
router.post('/subscribe', validatePhoneNumber, async (req, res) => {
  try {
    const { phoneNumber, notificationType = 'whatsapp' } = req.body;

    // Validate notification type
    if (!['sms', 'whatsapp'].includes(notificationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type. Use "sms" or "whatsapp"'
      });
    }

    const result = await notificationService.subscribe(phoneNumber, notificationType);

    if (result.duplicate) {
      return res.status(409).json({
        success: false,
        message: result.message
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/**
 * @route   DELETE /api/notifications/unsubscribe
 * @desc    Unsubscribe from notifications
 * @access  Public
 */
router.delete('/unsubscribe', validatePhoneNumber, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const result = await notificationService.unsubscribe(phoneNumber);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Admin only
 */
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const stats = await notificationService.getStats();
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
 * @route   GET /api/notifications/subscribers
 * @desc    Get all subscribers (paginated)
 * @access  Admin only
 */
router.get('/subscribers', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, notified } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (notified !== undefined) {
      options.notified = notified === 'true';
    }

    const result = await notificationService.getAllSubscribers(options);
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/notifications/send-launch
 * @desc    Send launch notifications to all pending subscribers
 * @access  Admin only
 */
router.post('/send-launch', adminAuth, async (req, res) => {
  try {
    const { 
      customMessage, 
      batchSize = 10, 
      delayBetweenBatches = 1000,
      dryRun = false 
    } = req.body;

    const result = await notificationService.sendLaunchNotifications(customMessage, {
      batchSize,
      delayBetweenBatches,
      dryRun
    });

    return res.json(result);
  } catch (error) {
    console.error('Send launch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send launch notifications',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/retry-failed
 * @desc    Retry failed notifications
 * @access  Admin only
 */
router.post('/retry-failed', adminAuth, async (req, res) => {
  try {
    const { maxAttempts = 3 } = req.body;
    const result = await notificationService.retryFailed(maxAttempts);
    return res.json(result);
  } catch (error) {
    console.error('Retry failed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retry notifications',
      error: error.message
    });
  }
});

module.exports = router;










