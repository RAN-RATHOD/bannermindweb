import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import emailjs from '@emailjs/browser';
import './ContactForm.css';

gsap.registerPlugin(ScrollTrigger);

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
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

    try {
      // Get EmailJS configuration from environment variables
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      // Validate EmailJS configuration
      if (
        !serviceId || serviceId === 'YOUR_SERVICE_ID' ||
        !templateId || templateId === 'YOUR_TEMPLATE_ID' ||
        !publicKey || publicKey === 'YOUR_PUBLIC_KEY'
      ) {
        setSubmitStatus('config-error');
        setIsSubmitting(false);
        setTimeout(() => {
          setSubmitStatus(null);
        }, 8000);
        return;
      }

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        reply_to: formData.email
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      // Handle specific EmailJS errors
      let errorMessage = 'Something went wrong. Please try again or contact us directly.';
      
      if (error.text) {
        if (error.text.includes('Public Key is invalid')) {
          errorMessage = 'EmailJS configuration error: Invalid Public Key. Please check your .env file.';
        } else if (error.text.includes('Service ID')) {
          errorMessage = 'EmailJS configuration error: Invalid Service ID. Please check your .env file.';
        } else if (error.text.includes('Template ID')) {
          errorMessage = 'EmailJS configuration error: Invalid Template ID. Please check your .env file.';
        } else if (error.text.includes('recipients address is empty') || error.text.includes('recipient')) {
          errorMessage = 'EmailJS configuration error: Recipient email is not set in your EmailJS template. Please configure the "To Email" field in your EmailJS template settings.';
        } else {
          errorMessage = `EmailJS Error: ${error.text}`;
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error('EmailJS Error:', error);
        console.error('Error details:', error.text || error.message);
      }
      
      setSubmitStatus('error');
      setErrors({ submit: errorMessage });
      
      // Reset status after 8 seconds for configuration errors
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
          {/* <p className="contact-subtitle">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p> */}
          <p className="contact-subtitle">
  We create banners faster with AI enhancement and AI image generation — share your requirements and we’ll handle the rest.
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
                    d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9841 21.5573 21.2126 21.3528 21.3992C21.1482 21.5857 20.9074 21.7262 20.6446 21.8118C20.3818 21.8974 20.1028 21.9261 19.827 21.896C16.7282 21.5856 13.7251 20.5341 11.02 18.82C8.61278 17.3376 6.57428 15.2991 5.09182 12.892C3.34622 10.139 2.29293 7.10045 2 3.996C1.96992 3.72014 1.99862 3.44107 2.08422 3.17826C2.16982 2.91545 2.31033 2.67468 2.4969 2.47013C2.68346 2.26558 2.91198 2.10199 3.16692 1.99039C3.42186 1.87879 3.69757 1.82181 3.976 1.823H6.976C7.31124 1.82306 7.63808 1.93111 7.90737 2.13221C8.17666 2.33331 8.37433 2.6175 8.472 2.942L10.44 9.821C10.5561 10.1807 10.5928 10.5621 10.5472 10.9378C10.5016 11.3136 10.3749 11.6739 10.177 11.992L8.177 14.992C9.94255 17.7019 12.2981 20.0575 15.008 21.823L18.008 19.823C18.3261 19.6251 18.6864 19.4984 19.0622 19.4528C19.4379 19.4072 19.8193 19.4439 20.179 19.56L27.05 21.527C27.3751 21.6246 27.6598 21.8223 27.8612 22.092C28.0626 22.3617 28.1708 22.6891 28.171 23.024V26.024C28.1708 26.3491 28.0626 26.6765 27.8612 26.9462C27.6598 27.2159 27.3751 27.4136 27.05 27.511L22.05 29.011C21.4901 29.1858 20.8979 29.2159 20.3247 29.0987C19.7515 28.9815 19.2144 28.7204 18.762 28.337C17.0863 26.9147 15.6036 25.2797 14.354 23.473C14.1571 23.1761 13.9993 22.8522 13.885 22.511L12.385 17.511C12.2873 17.1865 12.0896 16.9028 11.8199 16.7014C11.5502 16.5 11.2228 16.3918 10.897 16.392H10.847L8.097 18.142C7.61426 17.4387 7.16319 16.7125 6.746 15.967L8.496 13.217H8.446C8.12018 13.2172 7.79281 13.109 7.52311 12.9076C7.25341 12.7062 7.05572 12.4225 6.958 12.098L4.99 5.219C4.89341 4.89473 4.78547 4.57557 4.667 4.263C5.41449 4.67919 6.14074 5.13026 6.843 5.614L9.593 3.864C9.9175 3.76633 10.2012 3.56864 10.4026 3.29894C10.604 3.02924 10.7122 2.70187 10.712 2.376V2.326L12.212 1.826C12.5371 1.72818 12.8645 1.62002 13.176 1.502C13.4886 1.41453 13.808 1.30659 14.132 1.21L21.011 3.178C21.3355 3.27567 21.6192 3.47336 21.8206 3.74306C22.022 4.01276 22.1302 4.34013 22.13 4.665V7.415C22.1302 7.74013 22.022 8.0675 21.8206 8.3372C21.6192 8.6069 21.3355 8.80459 21.011 8.902L16.011 10.402C15.6698 10.5163 15.3459 10.6741 15.049 10.871L12.049 12.871C11.7309 13.069 11.3706 13.1956 10.9948 13.2412C10.6191 13.2868 10.2377 13.2501 9.878 13.134L4.878 11.134C4.55387 11.0364 4.26918 10.8387 4.06778 10.569C3.86638 10.2993 3.75818 9.97187 3.758 9.647V6.897C3.75818 6.57187 3.86638 6.2445 4.06778 5.9748C4.26918 5.7051 4.55387 5.50741 4.878 5.41L11.757 3.442C12.0813 3.34441 12.4004 3.23647 12.713 3.118Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Call Us</h3>
              <p>+91 9422476202</p>
            </div>

            {/* 
            <div className="info-card scale-on-scroll blur-reveal">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Visit Us</h3>
              <p>123 Design Street, Creative City</p>
            </div>
            */}

          </div>{/* closes contact-info */}

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
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'config-error' && (
              <div className="submit-status error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <strong>EmailJS not configured.</strong> Please set up your EmailJS credentials in the .env file. 
                  <br />
                  <a
                    href="https://dashboard.emailjs.com/admin/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    Get your Public Key here
                  </a>
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
