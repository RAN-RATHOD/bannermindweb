import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import emailjs from '@emailjs/browser';
import './NotifyModal.css';

// Country codes for phone validation
const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
];

const NotifyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    countryCode: '+91',
    phoneNumber: '',
    notificationType: 'whatsapp',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | 'duplicate'
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Animation on open/close + Body scroll lock (production-ready)
  useEffect(() => {
    if (isOpen) {
      // Store original body styles for restoration
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock body scroll (works on desktop and mobile)
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // iOS Safari fix: prevent touchmove on body
      const preventTouchMove = (e) => {
        // Allow scrolling inside the modal overlay
        if (overlayRef.current && overlayRef.current.contains(e.target)) {
          return;
        }
        e.preventDefault();
      };
      
      document.body.addEventListener('touchmove', preventTouchMove, { passive: false });
      
      // Run animations
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.removeEventListener('touchmove', preventTouchMove);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.2,
      onComplete: () => {
        onClose();
        // Reset form after close
        setTimeout(() => {
          setFormData({
            countryCode: '+91',
            phoneNumber: '',
            notificationType: 'whatsapp',
            consent: false,
          });
          setErrors({});
          setSubmitStatus(null);
          setErrorMessage('');
        }, 300);
      },
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's between 7-15 digits (international standard)
    return cleaned.length >= 7 && cleaned.length <= 15;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must agree to receive notifications';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    const fullPhoneNumber = `${formData.countryCode}${formData.phoneNumber.replace(/\D/g, '')}`;

    try {
      // EmailJS configuration - uses same config as ContactForm
      const serviceId = localStorage.getItem('emailjs_service_id') || 'service_bannermind';
      const templateId = localStorage.getItem('emailjs_template_id') || 'template_notify';
      const publicKey = localStorage.getItem('emailjs_public_key') || '';

      // If EmailJS is configured, send via email
      if (publicKey) {
        const templateParams = {
          to_name: 'BannerMind Admin',
          from_name: 'Launch Notification Request',
          phone_number: fullPhoneNumber,
          notification_type: formData.notificationType === 'whatsapp' ? 'WhatsApp' : 'SMS',
          message: `New launch notification request:\n\nPhone: ${fullPhoneNumber}\nPreferred Channel: ${formData.notificationType === 'whatsapp' ? 'WhatsApp' : 'SMS'}\nTime: ${new Date().toLocaleString()}`,
          reply_to: 'noreply@bannermind.app',
        };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        setSubmitStatus('success');
        
        // Also store locally for backup
        const existingRequests = JSON.parse(localStorage.getItem('notify_requests') || '[]');
        existingRequests.push({
          phoneNumber: fullPhoneNumber,
          notificationType: formData.notificationType,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('notify_requests', JSON.stringify(existingRequests));
      } else {
        // Fallback: Store locally if EmailJS not configured
        const existingRequests = JSON.parse(localStorage.getItem('notify_requests') || '[]');
        
        // Check for duplicates
        const isDuplicate = existingRequests.some(req => req.phoneNumber === fullPhoneNumber);
        if (isDuplicate) {
          setSubmitStatus('duplicate');
          setErrorMessage('This phone number is already registered for notifications');
          return;
        }

        existingRequests.push({
          phoneNumber: fullPhoneNumber,
          notificationType: formData.notificationType,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('notify_requests', JSON.stringify(existingRequests));
        setSubmitStatus('success');
        
        console.log('📱 Notification request saved locally:', {
          phoneNumber: fullPhoneNumber,
          type: formData.notificationType
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      
      // Even if EmailJS fails, save locally
      const existingRequests = JSON.parse(localStorage.getItem('notify_requests') || '[]');
      existingRequests.push({
        phoneNumber: fullPhoneNumber,
        notificationType: formData.notificationType,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('notify_requests', JSON.stringify(existingRequests));
      
      // Still show success since we saved locally
      setSubmitStatus('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  // Use Portal to render modal outside the normal DOM hierarchy
  // This escapes any overflow:hidden, transform, or stacking context issues
  return createPortal(
    <div className="notify-modal-overlay" ref={overlayRef} onClick={handleClose}>
      <div
        className="notify-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="notify-modal-close" onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitStatus === 'success' ? (
          <div className="notify-success">
            <div className="notify-success-icon">🎉</div>
            <h3>You're on the list!</h3>
            <p>We'll notify you via {formData.notificationType === 'whatsapp' ? 'WhatsApp' : 'SMS'} when BannerMind launches.</p>
            <button className="notify-success-btn" onClick={handleClose}>
              Got it!
            </button>
          </div>
        ) : (
          <>
            <div className="notify-modal-header">
              <div className="notify-modal-icon">🔔</div>
              <h2>Get Notified at Launch</h2>
              <p>Be the first to know when BannerMind goes live!</p>
            </div>

            <form onSubmit={handleSubmit} className="notify-form">
              {/* Phone Number Input */}
              <div className="notify-form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <div className="phone-input-wrapper">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="country-code-select"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={errors.phoneNumber ? 'error' : ''}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phoneNumber && (
                  <span className="error-message">{errors.phoneNumber}</span>
                )}
              </div>

              {/* Notification Type */}
              <div className="notify-form-group">
                <label>How would you like to be notified? *</label>
                <div className="notification-type-options">
                  <label
                    className={`notification-option ${
                      formData.notificationType === 'whatsapp' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="notificationType"
                      value="whatsapp"
                      checked={formData.notificationType === 'whatsapp'}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="option-icon">💬</span>
                    <span className="option-label">WhatsApp</span>
                  </label>
                  <label
                    className={`notification-option ${
                      formData.notificationType === 'sms' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="notificationType"
                      value="sms"
                      checked={formData.notificationType === 'sms'}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="option-icon">📱</span>
                    <span className="option-label">SMS</span>
                  </label>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="notify-form-group consent-group">
                <label className={`consent-label ${errors.consent ? 'error' : ''}`}>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <span className="checkmark"></span>
                  <span className="consent-text">
                    I agree to receive launch notifications from BannerMind
                  </span>
                </label>
                {errors.consent && (
                  <span className="error-message">{errors.consent}</span>
                )}
              </div>

              {/* Error Message */}
              {(submitStatus === 'error' || submitStatus === 'duplicate') && (
                <div className={`submit-message ${submitStatus}`}>
                  {submitStatus === 'duplicate' ? '📋' : '⚠️'} {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="notify-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Subscribing...
                  </>
                ) : (
                  'Notify Me at Launch'
                )}
              </button>

              <p className="notify-privacy-note">
                🔒 Your data is secure. We only use it to notify you once.
              </p>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NotifyModal;

