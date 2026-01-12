const Notification = require('../models/Notification');
const twilioService = require('./twilioService');

// Launch notification message
const LAUNCH_MESSAGE = `🎉 BannerMind is live!

Start creating stunning banners now with AI power.

👉 https://bannermind.vercel.app

Thank you for your patience!`;

class NotificationService {
  /**
   * Subscribe a new user for launch notifications
   * @param {string} phoneNumber - Phone number in E.164 format
   * @param {string} notificationType - 'sms' or 'whatsapp'
   * @returns {Promise<Object>}
   */
  async subscribe(phoneNumber, notificationType) {
    // Check if already exists
    const existing = await Notification.findOne({ phoneNumber });
    
    if (existing) {
      return {
        success: false,
        duplicate: true,
        message: 'This phone number is already registered for notifications'
      };
    }

    // Create new subscription
    const notification = new Notification({
      phoneNumber,
      notificationType
    });

    await notification.save();

    return {
      success: true,
      message: 'Successfully subscribed for launch notifications',
      data: {
        phoneNumber: notification.phoneNumber,
        notificationType: notification.notificationType,
        createdAt: notification.createdAt
      }
    };
  }

  /**
   * Unsubscribe a user
   * @param {string} phoneNumber
   * @returns {Promise<Object>}
   */
  async unsubscribe(phoneNumber) {
    const result = await Notification.findOneAndDelete({ phoneNumber });
    
    if (!result) {
      return {
        success: false,
        message: 'Phone number not found'
      };
    }

    return {
      success: true,
      message: 'Successfully unsubscribed'
    };
  }

  /**
   * Get subscription statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    return await Notification.getStats();
  }

  /**
   * Get all subscribers
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getAllSubscribers(options = {}) {
    const { page = 1, limit = 50, notified } = options;
    
    const query = {};
    if (typeof notified === 'boolean') {
      query.notified = notified;
    }

    const subscribers = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Send launch notification to a single subscriber
   * @param {Object} subscriber - Notification document
   * @param {string} customMessage - Optional custom message
   * @returns {Promise<Object>}
   */
  async sendToSubscriber(subscriber, customMessage = null) {
    const message = customMessage || LAUNCH_MESSAGE;

    try {
      const result = await twilioService.sendNotification(
        subscriber.phoneNumber,
        message,
        subscriber.notificationType
      );

      if (result.success) {
        await subscriber.markAsNotified();
        return {
          success: true,
          phoneNumber: subscriber.phoneNumber,
          type: subscriber.notificationType,
          messageSid: result.sid
        };
      }
    } catch (error) {
      await subscriber.recordFailedAttempt(error.message);
      return {
        success: false,
        phoneNumber: subscriber.phoneNumber,
        type: subscriber.notificationType,
        error: error.message
      };
    }
  }

  /**
   * Send launch notifications to all pending subscribers
   * @param {string} customMessage - Optional custom message
   * @param {Object} options - Options for batch processing
   * @returns {Promise<Object>}
   */
  async sendLaunchNotifications(customMessage = null, options = {}) {
    const { 
      batchSize = 10, 
      delayBetweenBatches = 1000, // ms
      dryRun = false 
    } = options;

    const pendingSubscribers = await Notification.getUnnotified();
    
    if (pendingSubscribers.length === 0) {
      return {
        success: true,
        message: 'No pending subscribers to notify',
        stats: { total: 0, sent: 0, failed: 0 }
      };
    }

    console.log(`📤 Starting launch notifications for ${pendingSubscribers.length} subscribers`);
    
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        message: `Would send to ${pendingSubscribers.length} subscribers`,
        subscribers: pendingSubscribers.map(s => ({
          phoneNumber: s.phoneNumber,
          type: s.notificationType
        }))
      };
    }

    const results = {
      sent: [],
      failed: []
    };

    // Process in batches to avoid rate limiting
    for (let i = 0; i < pendingSubscribers.length; i += batchSize) {
      const batch = pendingSubscribers.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(subscriber => this.sendToSubscriber(subscriber, customMessage))
      );

      batchResults.forEach(result => {
        if (result.success) {
          results.sent.push(result);
        } else {
          results.failed.push(result);
        }
      });

      // Delay between batches
      if (i + batchSize < pendingSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }

      console.log(`📊 Progress: ${Math.min(i + batchSize, pendingSubscribers.length)}/${pendingSubscribers.length}`);
    }

    console.log(`✅ Launch notifications complete: ${results.sent.length} sent, ${results.failed.length} failed`);

    return {
      success: true,
      message: 'Launch notifications completed',
      stats: {
        total: pendingSubscribers.length,
        sent: results.sent.length,
        failed: results.failed.length
      },
      sent: results.sent,
      failed: results.failed
    };
  }

  /**
   * Retry failed notifications
   * @param {number} maxAttempts - Maximum attempts to retry
   * @returns {Promise<Object>}
   */
  async retryFailed(maxAttempts = 3) {
    const failedSubscribers = await Notification.find({
      notified: false,
      notificationAttempts: { $gt: 0, $lt: maxAttempts }
    });

    if (failedSubscribers.length === 0) {
      return {
        success: true,
        message: 'No failed notifications to retry'
      };
    }

    const results = await Promise.all(
      failedSubscribers.map(subscriber => this.sendToSubscriber(subscriber))
    );

    return {
      success: true,
      retried: failedSubscribers.length,
      results
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;














