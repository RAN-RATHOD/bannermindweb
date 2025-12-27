import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Features.css';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef(null);
  const featuresRef = useRef([]);

  useEffect(() => {
    const features = featuresRef.current;
    const scrollTriggers = [];
    
    features.forEach((feature, index) => {
      if (feature) {
        const tween = gsap.fromTo(
          feature,
          {
            opacity: 0,
            y: 30,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.1,
            delay: index * 0.02,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: feature,
              start: 'top 85%',
              end: 'top 50%',
              toggleActions: 'play none none reverse'
            }
          }
        );
        
        // Store ScrollTrigger instance for cleanup
        if (tween && tween.scrollTrigger) {
          scrollTriggers.push(tween.scrollTrigger);
        }
      }
    });

    return () => {
      // Cleanup ScrollTriggers
      try {
        scrollTriggers.forEach(trigger => {
          if (trigger && typeof trigger.kill === 'function') {
            trigger.kill();
          }
        });
        features.forEach(feature => {
          if (feature) {
            gsap.killTweensOf(feature);
          }
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const features = [
    // {
    //   icon: '🤖',
    //   title: 'AI-Powered Generation',
    //   description: 'Create stunning banners instantly using advanced AI algorithms. No design skills required.',
    //   gradient: 'gradient-1'
    // },

   { icon: '🤖',
title: 'AI-Generated Images',
description: 'Generate high-quality images and enhance your banners with advanced AI features. No design skills required.',
gradient: 'gradient-1'
   },

    {
      icon: '🎨',
      title: 'Professional Templates',
      description: 'Choose from thousands of professionally designed templates for every occasion.',
      gradient: 'gradient-2'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Generate high-quality banners in seconds, not hours. Perfect for tight deadlines.',
      gradient: 'gradient-3'
    },
    {
      icon: '🎯',
      title: 'Customizable',
      description: 'Fully customize colors, fonts, images, and layouts to match your brand identity.',
      gradient: 'gradient-1'
    },
    {
      icon: '📱',
      title: 'Multi-Format Export',
      description: 'Export in any format you need: PNG, JPG, SVG, or PDF. All sizes supported.',
      gradient: 'gradient-2'
    },
    {
      icon: '✨',
      title: 'AI Enhancement',
      description: 'Get AI-powered suggestions for layouts, colors, and content based on your needs.',
      gradient: 'gradient-3'
    }
  ];

  return (
    <section id="features" className="features" ref={sectionRef}>
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="features-subtitle">
            Everything you need to create professional banners that stand out
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (featuresRef.current[index] = el)}
              className="feature-card scale-on-scroll blur-reveal"
            >
              <div className={`feature-icon ${feature.gradient}`}>
                <span className="icon-emoji">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

