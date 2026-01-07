import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ContactForm.css';

gsap.registerPlugin(ScrollTrigger);

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Debug: Log API URL in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const formRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    let scrollTriggerInstance = null;
    
    // Animate form on scroll
    if (section) {
      const tween = gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
      
      // Store ScrollTrigger instance for cleanup
      if (tween && tween.scrollTrigger) {
        scrollTriggerInstance = tween.scrollTrigger;
      }
    }

    return () => {
      // Cleanup ScrollTrigger
      try {
        if (scrollTriggerInstance && typeof scrollTriggerInstance.kill === 'function') {
          scrollTriggerInstance.kill();
        }
        if (section) {
          gsap.killTweensOf(section);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setTicketId(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setTicketId(data.data?.token || null);
        setFormData({ name: '', email: '', message: '' });
        
        // Reset status after 10 seconds
        setTimeout(() => {
          setSubmitStatus(null);
          setTicketId(null);
        }, 10000);
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          setErrors({ submit: data.errors.join('. ') });
        } else {
          setErrors({ submit: data.message || 'Something went wrong. Please try again.' });
        }
        setSubmitStatus('error');
        
        // Reset status after 8 seconds
        setTimeout(() => {
          setSubmitStatus(null);
          setErrors({});
        }, 8000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Network error or server unavailable
      setSubmitStatus('error');
      setErrors({ 
        submit: 'Unable to connect to server. Please try again later or email us directly at contact@bannermind.in' 
      });
      
      // Reset status after 8 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setErrors({});
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-form-section" ref={sectionRef}>
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="contact-subtitle">
            We create banners faster with AI enhancement and AI image generation — share your requirements and we'll handle the rest.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card scale-on-scroll blur-reveal">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Email Us</h3>
              <p>contact@bannermind.in</p>
            </div>

            <div className="info-card scale-on-scroll blur-reveal">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9841 21.5573 21.2126 21.3528 21.3992C21.1482 21.5857 20.9074 21.7262 20.6446 21.8118C20.3818 21.8974 20.1028 21.9261 19.827 21.896C16.7282 21.5856 13.7251 20.5341 11.02 18.82C8.61278 17.3376 6.57428 15.2991 5.09182 12.892C3.34622 10.139 2.29293 7.10045 2 3.996C1.96992 3.72014 1.99862 3.44107 2.08422 3.17826C2.16982 2.91545 2.31033 2.67468 2.4969 2.47013C2.68346 2.26558 2.91198 2.10199 3.16692 1.99039C3.42186 1.87879 3.69757 1.82181 3.976 1.823H6.976C7.31124 1.82306 7.63808 1.93111 7.90737 2.13221C8.17666 2.33331 8.37433 2.6175 8.472 2.942L9.40185 6.00001C9.51639 6.41234 9.48489 6.85058 9.31252 7.24167C9.14014 7.63277 8.83766 7.95358 8.458 8.14901L7.092 8.82801C8.51356 11.3616 10.6384 13.4864 13.172 14.908L13.851 13.542C14.0464 13.1623 14.3672 12.8599 14.7583 12.6875C15.1494 12.5151 15.5877 12.4836 16 12.598L19.058 13.528C19.3828 13.6257 19.6672 13.8236 19.8683 14.0932C20.0694 14.3627 20.1771 14.6898 20.177 15.025V15.025"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Call Us</h3>
              <p>+91 81779 70816</p>
            </div>
          </div>

          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Your name"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                placeholder="Tell us about your project..."
                rows={6}
                disabled={isSubmitting}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            {submitStatus === 'success' && (
              <div className="submit-status success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <strong>Message sent successfully!</strong>
                  {ticketId && (
                    <div className="ticket-info">
                      <span className="ticket-label">Your Ticket ID:</span>
                      <span className="ticket-id">{ticketId}</span>
                    </div>
                  )}
                  <p className="response-time">We'll respond within 24-48 hours. Check your email for confirmation.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="submit-status error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  {errors.submit || 'Something went wrong. Please try again or contact us directly.'}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn magnetic"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
