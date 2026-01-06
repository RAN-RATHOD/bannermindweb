const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize Twilio client with credentials
   */
  initialize() {
    if (this.initialized) return;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    }

    this.client = twilio(accountSid, authToken);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:${this.fromNumber}`;
    this.initialized = true;

    console.log('✅ Twilio service initialized');
  }

  /**
   * Send SMS message
   * @param {string} to - Recipient phone number (E.164 format)
   * @param {string} message - Message content
   * @returns {Promise<Object>} - Twilio message response
   */
  async sendSMS(to, message) {
    this.initialize();

    if (!this.fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER not configured');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      console.log(`📱 SMS sent to ${to}: ${result.sid}`);
      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error(`❌ SMS failed to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   * @param {string} to - Recipient phone number (E.164 format)
   * @param {string} message - Message content
   * @returns {Promise<Object>} - Twilio message response
   */
  async sendWhatsApp(to, message) {
    this.initialize();

    if (!this.whatsappNumber) {
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.whatsappNumber.startsWith('whatsapp:') 
          ? this.whatsappNumber 
          : `whatsapp:${this.whatsappNumber}`,
        to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
      });

      console.log(`💬 WhatsApp sent to ${to}: ${result.sid}`);
      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error(`❌ WhatsApp failed to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Send notification based on type
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @param {string} type - 'sms' or 'whatsapp'
   * @returns {Promise<Object>}
   */
  async sendNotification(to, message, type) {
    if (type === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    } else {
      return this.sendSMS(to, message);
    }
  }

  /**
   * Verify phone number validity
   * @param {string} phoneNumber - Phone number to verify
   * @returns {Promise<Object>}
   */
  async verifyPhoneNumber(phoneNumber) {
    this.initialize();

    try {
      const result = await this.client.lookups.v2.phoneNumbers(phoneNumber).fetch();
      return {
        valid: result.valid,
        phoneNumber: result.phoneNumber,
        countryCode: result.countryCode,
        carrier: result.carrier
      };
    } catch (error) {
      console.error(`Phone lookup failed for ${phoneNumber}:`, error.message);
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const twilioService = new TwilioService();
module.exports = twilioService;










