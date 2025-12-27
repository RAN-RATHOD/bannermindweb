import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../context/ThemeContext';
import './Hero.css';

// Import videos
import darkVideo from '../assets/Black BG.mp4';
import lightVideo from '../assets/White BG.mp4';

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  const { theme } = useTheme();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prevTheme, setPrevTheme] = useState(theme);

  // Handle video source change on theme switch
  useEffect(() => {
    // Only animate transition if theme actually changed (not initial load)
    if (prevTheme !== theme && videoRef.current && videoContainerRef.current) {
      setVideoLoaded(false);
      
      // Fade out current video
      gsap.to(videoContainerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          // Change video source
          if (videoRef.current) {
            videoRef.current.src = theme === 'dark' ? darkVideo : lightVideo;
            videoRef.current.load();
          }
        }
      });
    }
    setPrevTheme(theme);
  }, [theme, prevTheme]);

  // Handle video loaded event
  const handleVideoLoaded = () => {
    if (videoLoaded) return; // Prevent double calls
    setVideoLoaded(true);
    
    // Fade in the new video
    if (videoContainerRef.current) {
      gsap.to(videoContainerRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
    
    // Play the video
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, that's okay
      });
    }
  };

  // Fallback: show video after timeout if load event doesn't fire
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (videoContainerRef.current && !videoLoaded) {
        gsap.to(videoContainerRef.current, {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out'
        });
        setVideoLoaded(true);
        
        // Force play on fallback
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 1000);
    
    return () => clearTimeout(fallbackTimer);
  }, [videoLoaded]);

  // Ensure video plays on mount and when visible
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set video attributes programmatically for better browser support
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      
      // Attempt to play
      const playVideo = () => {
        video.play().catch(() => {
          // If autoplay fails, try again on user interaction
          const playOnInteraction = () => {
            video.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
      };
      
      // Play immediately and also when video is ready
      playVideo();
      video.addEventListener('canplay', playVideo);
      
      return () => {
        video.removeEventListener('canplay', playVideo);
      };
    }
  }, [theme]);

  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;
    const videoContainer = videoContainerRef.current;
    
    // Set initial visible state first (fallback)
    if (title) {
      gsap.set(title, { opacity: 1, y: 0 });
    }
    if (subtitle) {
      gsap.set(subtitle, { opacity: 1, y: 0 });
    }
    if (cta) {
      gsap.set(cta, { opacity: 1, scale: 1 });
    }

    // Wait for refs to be ready
    const setupAnimation = () => {
      if (!title || !subtitle || !cta) {
        setTimeout(setupAnimation, 50);
        return;
      }
      
      // Set initial hidden state for animation
      gsap.set(title, { opacity: 0, y: 50 });
      gsap.set(subtitle, { opacity: 0, y: 30 });
      gsap.set(cta, { opacity: 0, scale: 0.8 });
      
      const tl = gsap.timeline();
      
      tl.to(title, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .to(cta, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.3');
    };

    // Setup with delay to ensure DOM is ready
    const timeout = setTimeout(setupAnimation, 100);
    
    // Fallback: make visible after 500ms if animation doesn't run
    const fallbackTimeout = setTimeout(() => {
      if (title) {
        const opacity = gsap.getProperty(title, 'opacity');
        if (opacity === 0) {
          gsap.to(title, { opacity: 1, y: 0, duration: 0.5 });
        }
      }
      if (subtitle) {
        const opacity = gsap.getProperty(subtitle, 'opacity');
        if (opacity === 0) {
          gsap.to(subtitle, { opacity: 1, y: 0, duration: 0.5 });
        }
      }
      if (cta) {
        const opacity = gsap.getProperty(cta, 'opacity');
        if (opacity === 0) {
          gsap.to(cta, { opacity: 1, scale: 1, duration: 0.5 });
        }
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      clearTimeout(fallbackTimeout);
      // Cleanup GSAP animations
      try {
        if (title) {
          gsap.killTweensOf(title);
        }
        if (subtitle) {
          gsap.killTweensOf(subtitle);
        }
        if (cta) {
          gsap.killTweensOf(cta);
        }
        if (videoContainer) {
          gsap.killTweensOf(videoContainer);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
        <div className="gradient-orb orb-5"></div>
        <div className="gradient-orb orb-6"></div>
      </div>
      
      {/* Video positioned relative to hero section, not container */}
      <div className="hero-video-container" ref={videoContainerRef}>
        <div className="hero-video-wrapper">
          <video
            ref={videoRef}
            className="hero-video"
            src={theme === 'dark' ? darkVideo : lightVideo}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={handleVideoLoaded}
            onCanPlay={handleVideoLoaded}
          />
          <div className="hero-video-glow"></div>
        </div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <h1 ref={titleRef} className="hero-title">
            Create Stunning Banners with{' '}
            <span className="gradient-text-ai">AI</span>{' '}
            <span className="gradient-text-power">Power</span>
          </h1>
          <p ref={subtitleRef} className="hero-subtitle">
            Transform your ideas into professional banners instantly. 
            Powered by cutting-edge AI technology.
          </p>
          <div ref={ctaRef} className="hero-cta">
            <button 
              className="btn-primary magnetic"
              onClick={() => scrollToSection('download')}
            >
              Get Started
            </button>
            <button 
              className="btn-secondary magnetic"
              onClick={() => scrollToSection('features')}
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>
      
      <div className="scroll-indicator">
        <div className="mouse"></div>
      </div>
    </section>
  );
};

export default Hero;
