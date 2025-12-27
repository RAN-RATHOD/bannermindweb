import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ExamplesSlider.css';

gsap.registerPlugin(ScrollTrigger);

const ExamplesSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const slideRefs = useRef([]);
  const sectionRef = useRef(null);

  // Example banner images - replace with actual images
 
  const examples = [
    {
      id: 1,
      title: 'E-commerce Banner',
      description: 'Professional product showcase banner',
      category: 'Business',
      color: '#6366f1'
    },
    {
      id: 2,
      title: 'Event Promotion',
      description: 'Eye-catching event announcement design',
      category: 'Events',
      color: '#ec4899'
    },
    {
      id: 3,
      title: 'Social Media Post',
      description: 'Engaging social media banner template',
      category: 'Social',
      color: '#f59e0b'
    },
    {
      id: 4,
      title: 'Marketing Campaign',
      description: 'High-converting marketing banner',
      category: 'Marketing',
      color: '#8b5cf6'
    },
    {
      id: 5,
      title: 'Brand Identity',
      description: 'Professional brand showcase banner',
      category: 'Branding',
      color: '#10b981'
    }
  ];

  useEffect(() => {
    // Zoom-in scroll effect
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        {
          opacity: 0,
          scale: 0.8
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % examples.length);
    }, 4000); // Auto-slide every 4 seconds

    return () => {
      clearInterval(interval);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [examples.length]);

  useEffect(() => {
    // Animate slide transition
    slideRefs.current.forEach((slide, index) => {
      if (slide) {
        if (index === currentIndex) {
          gsap.to(slide, {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
        } else {
          const offset = index - currentIndex;
          gsap.to(slide, {
            opacity: 0.3,
            scale: 0.9,
            x: offset * 50,
            duration: 0.8,
            ease: 'power3.out'
          });
        }
      }
    });
  }, [currentIndex]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? examples.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % examples.length);
  };

  return (
    <section id="examples" className="examples-slider" ref={sectionRef}>
      <div className="examples-container">
        <div className="examples-header">
          <h2 className="examples-title">
            See Our <span className="gradient-text">Work</span>
          </h2>
          <p className="examples-subtitle">
            Explore stunning banner examples created with BannerMind AI
          </p>
        </div>

        <div className="slider-wrapper" ref={sliderRef}>
          <div className="slider-container">
            {examples.map((example, index) => (
              <div
                key={example.id}
                ref={(el) => (slideRefs.current[index] = el)}
                className={`slide ${index === currentIndex ? 'active' : ''}`}
                style={{ '--slide-color': example.color }}
              >
                <div className="slide-content">
                  <div 
                    className="slide-image"
                    style={{ 
                      background: `linear-gradient(135deg, ${example.color}15 0%, ${example.color}30 100%)`
                    }}
                  >
                    <div className="slide-preview">
                      <div className="banner-mockup">
                        <div className="banner-header" style={{ background: example.color }}>
                          <span className="banner-title">{example.title}</span>
                        </div>
                        <div className="banner-body">
                          <div className="banner-element"></div>
                          <div className="banner-element"></div>
                          <div className="banner-element"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="slide-info">
                    <span className="slide-category">{example.category}</span>
                    <h3 className="slide-title">{example.title}</h3>
                    <p className="slide-description">{example.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-btn prev" onClick={goToPrevious}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="slider-btn next" onClick={goToNext}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="slider-dots">
          {examples.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExamplesSlider;

