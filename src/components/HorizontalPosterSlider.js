import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HorizontalPosterSlider.css';

gsap.registerPlugin(ScrollTrigger);

const HorizontalPosterSlider = () => {
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const personRef = useRef(null);
  const personGroupRef = useRef(null);
  const posterRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pauseTimerRef = useRef(null);
  const isAnimatingRef = useRef(false);

  // Poster data with landing coordinates
  const posters = [
    {
      id: 1,
      title: 'E-commerce Banner',
      description: 'Professional product showcase banner',
      category: 'Business',
      color: '#6366f1',
      personX: '50%',
      personY: '36%'
    },
    {
      id: 2,
      title: 'Event Promotion',
      description: 'Eye-catching event announcement design',
      category: 'Events',
      color: '#ec4899',
      personX: '55%',
      personY: '38%'
    },
    {
      id: 3,
      title: 'Social Media Post',
      description: 'Engaging social media banner template',
      category: 'Social',
      color: '#f59e0b',
      personX: '48%',
      personY: '40%'
    },
    {
      id: 4,
      title: 'Marketing Campaign',
      description: 'High-converting marketing banner',
      category: 'Marketing',
      color: '#8b5cf6',
      personX: '52%',
      personY: '37%'
    },
    {
      id: 5,
      title: 'Brand Identity',
      description: 'Professional brand showcase banner',
      category: 'Branding',
      color: '#10b981',
      personX: '50%',
      personY: '39%'
    }
  ];

  // Calculate landing position for a poster based on data attributes
  const getLandingPosition = (posterIndex) => {
    if (!posterRefs.current[posterIndex] || !sectionRef.current || !personRef.current) {
      return { x: 0, y: 0 };
    }

    const poster = posterRefs.current[posterIndex];
    const section = sectionRef.current;
    const personWrapper = personRef.current.closest('#person-wrapper');
    
    if (!personWrapper) return { x: 0, y: 0 };

    const posterRect = poster.getBoundingClientRect();
    const wrapperRect = personWrapper.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const posterData = posters[posterIndex];

    // Calculate X position based on data-person-x percentage
    const personXPercent = parseFloat(posterData.personX) / 100;
    const posterXInSection = posterRect.left - sectionRect.left;
    const x = posterXInSection + (posterRect.width * personXPercent) - (wrapperRect.width / 2);

    // Calculate Y position based on data-person-y percentage
    const personYPercent = parseFloat(posterData.personY) / 100;
    const y = (posterRect.top - wrapperRect.top) + (posterRect.height * personYPercent) - 300; // 300 is person height

    return { x, y };
  };

  // Walking animation (simple vertical bounce)
  const startWalking = () => {
    if (!personGroupRef.current) return;
    
    gsap.to(personGroupRef.current, {
      y: -4,
      duration: 0.4,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true
    });
  };

  const stopWalking = () => {
    if (!personGroupRef.current) return;
    gsap.killTweensOf(personGroupRef.current);
    gsap.set(personGroupRef.current, { y: 0 });
  };

  // Move person to poster with pop effect
  const movePersonToPoster = (posterIndex, immediate = false) => {
    if (isAnimatingRef.current && !immediate) return;
    if (posterIndex < 0 || posterIndex >= posters.length || !personRef.current) return;

    isAnimatingRef.current = true;

    // Clear any existing pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    const targetPos = getLandingPosition(posterIndex);
    
    // Kill any ongoing animations
    gsap.killTweensOf(personRef.current);
    stopWalking();

    // Start walking animation
    startWalking();

    // Move person to target position
    gsap.to(personRef.current, {
      x: targetPos.x,
      y: targetPos.y,
      duration: immediate ? 0 : 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        stopWalking();
        
        // Pop effect: scale 1 -> 1.12 -> 1
        const popTl = gsap.timeline({
          onComplete: () => {
            // Wait 1 second before allowing next movement
            pauseTimerRef.current = setTimeout(() => {
              isAnimatingRef.current = false;
              // Auto-advance to next poster if available
              if (posterIndex < posters.length - 1) {
                setCurrentIndex(posterIndex + 1);
              }
            }, 1000); // 1 second pause
          }
        });

        popTl.to(personRef.current, {
          scale: 1.12,
          duration: 0.15,
          ease: 'back.out(1.7)'
        }).to(personRef.current, {
          scale: 1,
          duration: 0.25,
          ease: 'back.out(1.7)'
        });
      }
    });
  };

  // Initialize slider and animations
  useEffect(() => {
    if (!sectionRef.current || !sliderRef.current || !personRef.current) return;

    // Set initial person position (left side, visible)
    gsap.set(personRef.current, {
      x: 100,
      y: 0,
      scale: 1,
      opacity: 1
    });

    // Initial animation - move person to first poster
    setTimeout(() => {
      movePersonToPoster(0, true);
    }, 500);

    // Handle slider scroll to detect which poster is active
    const handleScroll = () => {
      if (isAnimatingRef.current) return; // Don't interrupt animation
      
      const scrollLeft = sliderRef.current.scrollLeft;
      const posterWidth = window.innerWidth;
      const newIndex = Math.round(scrollLeft / posterWidth);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posters.length) {
        setCurrentIndex(newIndex);
      }
    };

    sliderRef.current.addEventListener('scroll', handleScroll, { passive: true });

    // Touch and keyboard navigation
    let startX = 0;
    let scrollStart = 0;
    let isScrolling = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      scrollStart = sliderRef.current.scrollLeft;
      isScrolling = false;
    };

    const handleTouchMove = (e) => {
      if (!startX) return;
      const x = e.touches[0].clientX;
      const walk = (x - startX) * 2;
      sliderRef.current.scrollLeft = scrollStart - walk;
      isScrolling = true;
    };

    const handleTouchEnd = () => {
      if (isScrolling && sliderRef.current) {
        // Snap to nearest poster
        const scrollLeft = sliderRef.current.scrollLeft;
        const posterWidth = window.innerWidth;
        const nearestIndex = Math.round(scrollLeft / posterWidth);
        sliderRef.current.scrollTo({
          left: nearestIndex * posterWidth,
          behavior: 'smooth'
        });
      }
      startX = 0;
      isScrolling = false;
    };

    const handleWheel = (e) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        sliderRef.current.scrollLeft += delta;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < posters.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    };

    const slider = sliderRef.current;
    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    slider.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      slider.removeEventListener('scroll', handleScroll);
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
      slider.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      
      gsap.killTweensOf(personRef.current);
      gsap.killTweensOf(personGroupRef.current);
      stopWalking();
    };
  }, []);

  // Handle slide changes
  useEffect(() => {
    if (!sliderRef.current || !personRef.current) return;

    // Scroll slider to current index
    const posterWidth = window.innerWidth;
    sliderRef.current.scrollTo({
      left: currentIndex * posterWidth,
      behavior: 'smooth'
    });

    // Move person to current poster
    movePersonToPoster(currentIndex);
  }, [currentIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0 && !isAnimatingRef.current) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < posters.length - 1 && !isAnimatingRef.current) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <section id="see-our-work" className="horizontal-poster-slider" ref={sectionRef} aria-label="See our work">
      {/* Single sticky person wrapper */}
      <div id="person-wrapper" aria-hidden="true">
        <svg
          id="person"
          ref={personRef}
          viewBox="0 0 100 140"
          width="200"
          height="300"
          role="img"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <g id="person-group" ref={personGroupRef} transform="translate(0,0)">
            {/* Background glow circle to make person stand out */}
            <circle cx="50" cy="70" r="45" fill="#FFFFFF" opacity="0.15" />
            <circle cx="50" cy="70" r="42" fill="#FFD700" opacity="0.2" />
            
            {/* Shadow/ground effect */}
            <ellipse cx="50" cy="135" rx="22" ry="6" fill="#000000" opacity="0.4" />
            
            {/* Head - larger and more visible with bright colors */}
            <circle cx="50" cy="30" r="20" fill="#FFD700" stroke="#FF8C00" strokeWidth="3.5" />
            {/* Hair - brown */}
            <path d="M 30 18 Q 33 12 36 16 Q 38 12 40 16 Q 43 10 50 12 Q 57 10 60 16 Q 62 12 64 16 Q 67 12 70 18 Q 70 24 67 28 Q 64 32 50 32 Q 36 32 33 28 Q 30 24 30 18 Z" fill="#8B4513" stroke="#654321" strokeWidth="2" />
            {/* Face - peach color */}
            <circle cx="50" cy="32" r="17" fill="#FFE5B4" stroke="#FFD700" strokeWidth="2.5" />
            {/* Eyes - bigger and more visible */}
            <circle cx="43" cy="30" r="4" fill="#FFFFFF" />
            <circle cx="57" cy="30" r="4" fill="#FFFFFF" />
            <circle cx="43" cy="30" r="2.5" fill="#000000" />
            <circle cx="57" cy="30" r="2.5" fill="#000000" />
            {/* Eye shine */}
            <circle cx="44" cy="29" r="1" fill="#FFFFFF" />
            <circle cx="58" cy="29" r="1" fill="#FFFFFF" />
            {/* Smile - happy */}
            <path d="M 38 38 Q 50 44 62 38" stroke="#FF6B6B" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* Body - bright blue shirt */}
            <rect x="28" y="48" width="44" height="62" rx="9" fill="#4169E1" stroke="#1E3A8A" strokeWidth="3.5" />
            {/* Shirt collar/details */}
            <rect x="36" y="56" width="28" height="10" rx="5" fill="#87CEEB" stroke="#4A90E2" strokeWidth="1.5" />
            
            {/* Arms - bright blue */}
            <rect x="18" y="52" width="14" height="42" rx="7" fill="#4169E1" stroke="#1E3A8A" strokeWidth="3" />
            <rect x="68" y="52" width="14" height="42" rx="7" fill="#4169E1" stroke="#1E3A8A" strokeWidth="3" />
            
            {/* Hands */}
            <circle cx="25" cy="94" r="5" fill="#FFE5B4" />
            <circle cx="75" cy="94" r="5" fill="#FFE5B4" />
            
            {/* Pants - brown pants */}
            <rect x="24" y="108" width="20" height="34" rx="7" fill="#8B4513" stroke="#654321" strokeWidth="3" />
            <rect x="56" y="108" width="20" height="34" rx="7" fill="#8B4513" stroke="#654321" strokeWidth="3" />
            
            {/* Shoes - black */}
            <ellipse cx="34" cy="142" rx="9" ry="5" fill="#000000" stroke="#333333" strokeWidth="1.5" />
            <ellipse cx="66" cy="142" rx="9" ry="5" fill="#000000" stroke="#333333" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Horizontal slider container */}
      <div className="slider-container" ref={sliderRef}>
        {posters.map((poster, index) => (
          <section
            key={poster.id}
            className="poster"
            ref={(el) => (posterRefs.current[index] = el)}
            data-person-x={poster.personX}
            data-person-y={poster.personY}
            data-cursor="poster"
            tabIndex="0"
            aria-label={`Poster ${index + 1} — ${poster.title}`}
            style={{ backgroundColor: poster.color }}
          >
            <div className="poster-inner">
              <div className="poster-content">
                <span className="poster-category">{poster.category}</span>
                <h2 className="poster-title">{poster.title}</h2>
                <p className="poster-description">{poster.description}</p>
                <div 
                  className="poster-mockup" 
                  style={{ 
                    background: `linear-gradient(135deg, ${poster.color}20 0%, ${poster.color}40 100%)`,
                    borderColor: poster.color
                  }}
                >
                  <div className="mockup-content">
                    <div className="mockup-element" style={{ backgroundColor: poster.color + '40' }}></div>
                    <div className="mockup-element" style={{ backgroundColor: poster.color + '40' }}></div>
                    <div className="mockup-element" style={{ backgroundColor: poster.color + '40' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="slider-nav">
        <button
          className="nav-btn prev"
          onClick={goToPrevious}
          disabled={currentIndex === 0 || isAnimatingRef.current}
          aria-label="Previous poster"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="nav-dots">
          {posters.map((_, index) => (
            <button
              key={index}
              className={`nav-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => !isAnimatingRef.current && setCurrentIndex(index)}
              aria-label={`Go to poster ${index + 1}`}
            />
          ))}
        </div>
        <button
          className="nav-btn next"
          onClick={goToNext}
          disabled={currentIndex === posters.length - 1 || isAnimatingRef.current}
          aria-label="Next poster"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
};

export default HorizontalPosterSlider;
