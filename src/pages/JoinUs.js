import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';
import './JoinUs.css';

gsap.registerPlugin(ScrollTrigger);

const JoinUs = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef([]);
  const sectionRef = useRef(null);
  const partnerStoriesSectionRef = useRef(null);

  useEffect(() => {
    const features = featuresRef.current;
    const hero = heroRef.current;
    const scrollTriggers = [];
    const gsapTweens = [];

    // Hero 3D element animation
    if (hero) {
      const hero3D = hero.querySelector('.hero-3d-shape');
      if (hero3D) {
        const tween = gsap.to(hero3D, {
          rotationY: 360,
          rotationX: 15,
          duration: 20,
          repeat: -1,
          ease: 'none'
        });
        gsapTweens.push(tween);
      }
    }

    // Feature cards 3D tilt on scroll - faster animation for mobile
    features.forEach((card, index) => {
      if (card) {
        const tween = gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 30,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            delay: index * 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
        
        // Get the ScrollTrigger instance from the tween
        if (tween.scrollTrigger) {
          scrollTriggers.push(tween.scrollTrigger);
        }
        gsapTweens.push(tween);
      }
    });

    // Swiper is now handling the Partner Success Stories carousel
    // No GSAP animation needed for this section anymore

    return () => {
      // Immediately kill all ScrollTriggers to prevent DOM conflicts
      // Kill tracked ScrollTriggers first
      scrollTriggers.forEach(trigger => {
        try {
          if (trigger && typeof trigger.kill === 'function') {
            trigger.kill();
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      });

      // Kill ALL ScrollTrigger instances globally to ensure complete cleanup
      try {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger && typeof trigger.kill === 'function') {
            trigger.kill();
          }
        });
      } catch (e) {
        // Ignore errors during cleanup
      }

      // Kill all GSAP tweens/animations
      gsapTweens.forEach(tween => {
        try {
          if (tween && typeof tween.kill === 'function') {
            tween.kill();
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      });

      // Additional cleanup: kill any remaining tweens on elements
      try {
        features.forEach(card => {
          if (card) {
            gsap.killTweensOf(card);
          }
        });

        if (hero) {
          const hero3D = hero.querySelector('.hero-3d-shape');
          if (hero3D) {
            gsap.killTweensOf(hero3D);
          }
        }
      } catch (e) {
        // Ignore errors during cleanup
      }

      // Refresh ScrollTrigger to release all DOM references
      try {
        ScrollTrigger.refresh();
      } catch (e) {
        // Ignore errors during cleanup
      }
    };
  }, []);

  const whyJoinFeatures = [
    {
      icon: '🎁',
      title: 'Free Partnership',
      description: '100% free - no hidden costs, no credit card required. Perfect for organizations of all sizes.',
      color: 'gradient-1'
    },
    {
      icon: '🏆',
      title: 'Listed Inside BannerMind App',
      description: 'Get a partner badge and be featured in our app, increasing your visibility.',
      color: 'gradient-2'
    },
    {
      icon: '📅',
      title: 'Easy Event Handling',
      description: 'Create templates, manage multi-language content, and handle events effortlessly.',
      color: 'gradient-3'
    },
    {
      icon: '📢',
      title: 'Auto Marketing Posters',
      description: 'Automatically generate announcements and campaign posters for your events.',
      color: 'gradient-1'
    },
    {
      icon: '🎨',
      title: 'AI-Enhanced Images',
      description: 'Change clothing, backgrounds, and props with AI-powered image generation.',
      color: 'gradient-2'
    },
    // {
    //   icon: '✨',
    //   title: 'Prompt-to-Poster Creation',
    //   description: 'Simply type a prompt and watch as AI auto-generates your perfect banner.',
    //   color: 'gradient-3'
    // },
    {
      icon: '🎯',
      title: 'Auto Branding',
      description: 'Automatically apply your logo, colors, and tagline to all generated posters.',
      color: 'gradient-1'
    },
    {
      icon: '📋',
      title: 'Organization Custom Templates',
      description: 'Create and save custom templates that match your organization\'s style.',
      color: 'gradient-2'
    },
    {
      icon: '👥',
      title: 'Team Workflow',
      description: 'Manage team members, approvals, and templates with collaborative tools.',
      color: 'gradient-3'
    }
  ];

  const additionalFeatures = [
    // {
    //   icon: '📊',
    //   title: 'Partner Dashboard',
    //   description: 'Manage events, templates, and branding from one central dashboard.'
    // },
    {
      icon: '📊',
      title: 'Personalised Posters for Your Organization',
      description: 'Your events, activities, and business banners will be added to the app under your organization section.'
    },
    {
      icon: '🔄',
      title: 'Bulk Poster Generation',
      description: 'Generate 10-50 poster variations instantly for your campaigns.'
    },
    {
      icon: '🤝',
      title: 'AI Sponsor Placement',
      description: 'Automatically place sponsor logos in optimal positions on your posters.'
    },
    {
      icon: '📜',
      title: 'Automatic Certificate Maker',
      description: 'Upload a list and automatically generate certificates for participants.'
    },
    {
      icon: '📱',
      title: 'Live Event Posters',
      description: 'Posters that auto-update visuals based on real-time event information.'
    },
    {
      icon: '📲',
      title: 'Get your team marketing to next level',
      description: 'Automatically post to your social media accounts (coming soon).'
    }
  ];

  return (
    <div className="join-us-page" ref={sectionRef}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="join-us-hero" ref={heroRef}>
        <div className="hero-3d-shape" aria-hidden="true"></div>
        <div className="join-us-container">
          <h1 className="join-us-title">
            Join BannerMind – Collaborate With Us for <span className="gradient-text">Free</span>
          </h1>
          <p className="join-us-subtitle">
            Designed for organizations, institutes, NGOs, event managers, schools and businesses who need simple, fast and branded poster generation.
          </p>
          <div className="hero-ctas">
            <a href="#contact" className="cta-primary">
              Become a Partner
            </a>
            <a href="#contact" className="cta-secondary">
              Contact Team
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Section - Features */}
      <section id="features" className="why-join-section">
        <div className="join-us-container">
          <h2 className="section-title">
            Why Join <span className="gradient-text">BannerMind</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to create professional posters - completely free for organizations
          </p>
          
          <div className="why-join-swiper-wrapper">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
              }}
              speed={800}
              navigation={true}
              pagination={{ 
                clickable: true,
                dynamicBullets: true 
              }}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              loop={true}
              spaceBetween={20}
              className="why-join-swiper"
            >
              {whyJoinFeatures.map((feature, index) => (
                <SwiperSlide key={index}>
                  <div
                    ref={(el) => (featuresRef.current[index] = el)}
                    className={`feature-card-3d ${feature.color}`}
                    data-poster-id={`feature-${index + 1}`}
                    data-anchor-x="0.5"
                    data-anchor-y="0.5"
                  >
                    <div className="feature-icon-3d">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <div className="card-glow"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Additional High-Value Features */}
      <section id="benefits" className="additional-features-section">
        <div className="join-us-container">
          <h2 className="section-title">
            Additional <span className="gradient-text">High-Value Features</span>
          </h2>
          <p className="section-subtitle">
            Advanced tools to take your poster generation to the next level
          </p>
          
          <div className="additional-features-grid">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="additional-feature-card"
                data-poster-id={`additional-${index + 1}`}
                data-anchor-x="0.3"
                data-anchor-y="0.4"
              >
                <div className="additional-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Examples Section - Swiper Carousel */}
      {/* <section id="examples" className="company-examples-section" ref={partnerStoriesSectionRef}>
        <div className="join-us-container">
          <h2 className="section-title">
            See Our <span className="gradient-text">Partner Success Stories</span>
          </h2>
          <p className="section-subtitle">
            Real examples from organizations using BannerMind for their events and campaigns
          </p>
        </div>
        
        <div className="partner-stories-carousel-wrapper">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            speed={600}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            navigation={true}
            pagination={{ 
              clickable: true,
              dynamicBullets: true 
            }}
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            loop={true}
            spaceBetween={32}
            className="partner-stories-swiper"
          >
            {[
              {
                title: 'University Event Campaign',
                description: 'Generated 50+ event posters in minutes for a month-long festival',
                category: 'Education',
                icon: '🎓'
              },
              {
                title: 'NGO Awareness Drive',
                description: 'Created multilingual posters for community outreach programs',
                category: 'Non-Profit',
                icon: '🤝'
              },
              {
                title: 'Corporate Conference',
                description: 'Branded posters with sponsor logos automatically placed',
                category: 'Business',
                icon: '💼'
              },
              {
                title: 'School Annual Day',
                description: 'Custom templates with school branding for all events',
                category: 'Education',
                icon: '🏫'
              },
              {
                title: 'Tech Startup Launch',
                description: 'AI-generated product launch banners with custom branding',
                category: 'Technology',
                icon: '🚀'
              },
              {
                title: 'Community Festival',
                description: 'Multi-event poster series with consistent brand identity',
                category: 'Community',
                icon: '🎉'
              }
            ].map((example, index) => (
              <SwiperSlide key={index} className="partner-story-slide">
                <div className="partner-story-card">
                  <div className="example-icon">{example.icon}</div>
                  <span className="example-category">{example.category}</span>
                  <h3>{example.title}</h3>
                  <p>{example.description}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section> */}

      {/* Company Download Section - How It Works */}
      <section id="how-it-works" className="company-download-section">
        <div className="join-us-container">
          <h2 className="section-title">
            Get Started as a <span className="gradient-text">Partner</span>
          </h2>
          <p className="section-subtitle">
            Join BannerMind today and start creating professional posters for your organization
          </p>
          
          <div className="company-download-content">
            <div className="download-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Sign Up as Partner</h3>
                <p>Fill out the contact form below to become a BannerMind partner. It's completely free!</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Share your company events and creative ideas</h3>
                <p>Access your partner dashboard to manage events, templates, and branding.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Start Creating</h3>
                <p>Begin generating professional posters with AI-powered tools and your custom branding.</p>
              </div>
            </div>
            
            <div className="download-benefits">
              <h3>What You Get:</h3>
              <ul>
                <li>✓ Free partner account with full access</li>
                <li>✓ Custom branding and templates</li>
                <li>✓ Bulk poster generation</li>
                <li>✓ Team collaboration tools</li>
                <li>✓ Priority support</li>
                <li>✓ Listed in BannerMind app</li>
              </ul>
              <a href="#contact" className="become-partner-btn">
                Become a Partner Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="join-cta-section">
        <div className="cta-3d-decoration" aria-hidden="true"></div>
        <div className="join-us-container">
          <h2 className="cta-title">Ready to Join BannerMind?</h2>
          <p className="cta-subtitle">Start creating professional posters today - it's 100% free for organizations</p>
          <a href="#contact" className="cta-button-large">
            Become a Partner Today – It's 100% Free
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <ContactForm />

      <Footer />
    </div>
  );
};

export default JoinUs;
