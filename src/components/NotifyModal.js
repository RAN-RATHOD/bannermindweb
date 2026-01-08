import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './NotifyModal.css';

// API Base URL - uses environment variable or defaults to production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bannermind1.onrender.com';

const NotifyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
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
            email: '',
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must agree to receive launch notifications';
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/launch-notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
      } else if (response.status === 409 || data.duplicate) {
        setSubmitStatus('duplicate');
        setErrorMessage(data.message || 'This email is already subscribed');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
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
  return createPortal(
    <div className="notify-modal-overlay" ref={overlayRef} onClick={handleClose}>
      <div
        className="notify-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="notify-modal-close" onClick={handleClose} aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitStatus === 'success' ? (
          <div className="notify-success">
            <div className="notify-success-icon">🎉</div>
            <h3>You're on the list!</h3>
            <p>We'll send you an email when BannerMind launches. Check your inbox for a confirmation!</p>
            <button className="notify-success-btn" onClick={handleClose}>
              Got it!
            </button>
          </div>
        ) : (
          <>
            <div className="notify-modal-header">
              <div className="notify-modal-icon">🚀</div>
              <h2>Get Notified at Launch</h2>
              <p>Be the first to know when BannerMind goes live!</p>
            </div>

            <form onSubmit={handleSubmit} className="notify-form">
              {/* Email Input */}
              <div className="notify-form-group">
                <label htmlFor="email">Email Address *</label>
                <div className="email-input-wrapper">
                  <span className="email-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={errors.email ? 'error' : ''}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
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

              {/* Error/Duplicate Message */}
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
                  <>
                    <span className="btn-icon">🔔</span>
                    Notify Me at Launch
                  </>
                )}
              </button>

              <p className="notify-privacy-note">
                🔒 Your email is secure. We only use it to notify you at launch.
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
