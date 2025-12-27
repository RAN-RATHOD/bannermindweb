import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './PosterScrollSequence.css';

// Import poster images
import businessPoster from '../assets/example/businessposter.png';
import birthdayPoster from '../assets/example/bbirthdayposter.png';
import diwaliPoster from '../assets/example/diwaliposter.png';
import newyearPoster from '../assets/example/newyearposter.png';

// Import character outfit images
import businessCharacter from '../assets/example/business.png';
import birthdayCharacter from '../assets/example/birthday.png';
import diwaliCharacter from '../assets/example/diwali.png';
import newyearCharacter from '../assets/example/newyear.png';

gsap.registerPlugin(ScrollTrigger);

const PosterScrollSequence = () => {
  const sectionRef = useRef(null);
  const posterRefs = useRef([]);
  const characterRefs = useRef([]);
  const scrollTriggers = useRef([]);
  const animationTimelines = useRef([]); // Store timelines for all posters

  // Poster data with actual poster images and character outfits
  const posters = useMemo(() => [
    {
      id: 1,
      templateKey: 'business',
      posterImage: businessPoster,
      characterOutfit: businessCharacter,
    },
    {
      id: 2,
      templateKey: 'birthday',
      posterImage: birthdayPoster,
      characterOutfit: birthdayCharacter,
    },
    {
      id: 3,
      templateKey: 'diwali',
      posterImage: diwaliPoster,
      characterOutfit: diwaliCharacter,
    },
    {
      id: 4,
      templateKey: 'newYear',
      posterImage: newyearPoster,
      characterOutfit: newyearCharacter,
    }
  ], []);

  // Set up character pop-up animation INSIDE each poster
  useLayoutEffect(() => {
    const characterRefsArray = characterRefs.current;
    const scrollTriggersArray = scrollTriggers.current;
    const animationTimelinesArray = animationTimelines.current;
    
    // Kill all previous ScrollTriggers and timelines
    scrollTriggersArray.forEach(st => {
      if (st) st.kill();
    });
    animationTimelinesArray.forEach(tl => {
      if (tl) tl.kill();
    });
    scrollTriggers.current = [];
    animationTimelines.current = [];

    const setupAllAnimations = () => {
      posters.forEach((poster, index) => {
        const posterRef = posterRefs.current[index];
        const characterRef = characterRefs.current[index];
        
        if (!posterRef || !characterRef) {
          return;
        }

        // Ensure character image is loaded
        if (characterRef.tagName === 'IMG') {
          characterRef.src = poster.characterOutfit;
          characterRef.style.display = 'block';
          characterRef.style.visibility = 'visible';
        }

        // Set initial hidden state
        gsap.set(characterRef, {
          transformOrigin: 'bottom center',
          scale: 0.6,
          opacity: 0,
          y: 40,
        });

        // Create animation timeline - SAME ANIMATION FOR ALL POSTERS
        const tl = gsap.timeline({ paused: true });

        // Pop-up animation: zoom out then zoom in with bounce (EXACT SAME AS POSTER 1)
        tl.to(characterRef, {
          scale: 0.7,
          y: 30,
          opacity: 0.5,
          duration: 0.15,
          ease: 'power2.out',
        })
        .to(characterRef, {
          scale: 0.65,
          y: 20,
          opacity: 0.7,
          duration: 0.15,
          ease: 'power2.in',
        })
        .to(characterRef, {
          scale: 1.15,
          y: -5,
          opacity: 1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        })
        .to(characterRef, {
          scale: 0.98,
          y: 0,
          duration: 0.15,
          ease: 'power2.out',
        })
        .to(characterRef, {
          scale: 1.0,
          y: 0,
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out',
        });

        // Store timeline in ref array for access
        animationTimelines.current[index] = tl;

        // Create ScrollTrigger with simple, reliable settings - FOR EACH POSTER
        const st = ScrollTrigger.create({
          trigger: posterRef,
          start: 'top 85%',
          end: 'bottom 15%',
          onEnter: () => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Poster ${index + 1} entered - triggering animation`);
            }
            if (tl && typeof tl.restart === 'function') {
              tl.restart();
            }
          },
          onEnterBack: () => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Poster ${index + 1} entered back - triggering animation`);
            }
            if (tl && typeof tl.restart === 'function') {
              tl.restart();
            }
          },
          onLeaveBack: () => {
            gsap.set(characterRef, {
              scale: 0.6,
              opacity: 0,
              y: 40,
            });
          },
        });

        scrollTriggers.current[index] = st;

        // Force trigger animation if poster is in view - URGENT FIX
        // This function plays the EXACT SAME animation for all posters
        const playAnimation = () => {
          const timeline = animationTimelines.current[index];
          if (timeline && typeof timeline.restart === 'function') {
            timeline.restart();
            return true;
          }
          return false;
        };

        const forceCheck = () => {
          if (!posterRef || !characterRef) return;
          
          try {
            const rect = posterRef.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            // Check if poster is significantly in viewport (more lenient threshold)
            const isInView = rect.top < viewportHeight * 0.95 && rect.bottom > viewportHeight * 0.05;
            
            if (isInView) {
              const opacity = parseFloat(gsap.getProperty(characterRef, 'opacity') || 0);
              const scale = parseFloat(gsap.getProperty(characterRef, 'scale') || 1);
              
              // If character hasn't finished animation (not fully visible or not at final scale)
              if (opacity < 0.9 || scale < 0.9) {
                // Try to play stored timeline first
                if (!playAnimation()) {
                  // Emergency: Play the EXACT SAME zoom animation manually
                  const emergencyTl = gsap.timeline();
                  emergencyTl.to(characterRef, {
                    scale: 0.7,
                    y: 30,
                    opacity: 0.5,
                    duration: 0.15,
                    ease: 'power2.out',
                  })
                  .to(characterRef, {
                    scale: 0.65,
                    y: 20,
                    opacity: 0.7,
                    duration: 0.15,
                    ease: 'power2.in',
                  })
                  .to(characterRef, {
                    scale: 1.15,
                    y: -5,
                    opacity: 1,
                    duration: 0.3,
                    ease: 'back.out(1.7)',
                  })
                  .to(characterRef, {
                    scale: 0.98,
                    y: 0,
                    duration: 0.15,
                    ease: 'power2.out',
                  })
                  .to(characterRef, {
                    scale: 1.0,
                    y: 0,
                    opacity: 1,
                    duration: 0.15,
                    ease: 'power2.out',
                  });
                }
              }
            }
          } catch (e) {
            // Silent fail
          }
        };

        // Multiple aggressive checks - ensure animation triggers for ALL posters
        [50, 100, 200, 400, 700, 1000, 1500, 2500, 3000].forEach(delay => {
          setTimeout(() => {
            forceCheck();
            // Also try direct animation play
            const rect = posterRef.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
              playAnimation();
            }
          }, delay);
        });

        // Check on scroll and resize - AGGRESSIVE CHECKING
        let scrollTimeout;
        let lastScrollY = window.scrollY;
        const scrollCheck = () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            const currentScrollY = window.scrollY;
            const scrolled = Math.abs(currentScrollY - lastScrollY) > 10; // Only if actually scrolled
            
            if (scrolled) {
              requestAnimationFrame(() => {
                forceCheck();
                // Also try direct animation if poster is in center viewport
                const rect = posterRef.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const isNearCenter = rect.top < viewportCenter && rect.bottom > viewportCenter;
                
                if (isNearCenter) {
                  const opacity = parseFloat(gsap.getProperty(characterRef, 'opacity') || 0);
                  if (opacity < 1) {
                    playAnimation();
                  }
                }
              });
            }
            lastScrollY = currentScrollY;
          }, 50);
        };
        
        window.addEventListener('scroll', scrollCheck, { passive: true });
        window.addEventListener('resize', scrollCheck, { passive: true });
        
        // Store lastScrollY in characterRef for cleanup
        characterRef._lastScrollY = lastScrollY;
        
        // Also use IntersectionObserver as backup
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  // Immediately trigger animation when poster intersects
                  setTimeout(() => {
                    forceCheck();
                    playAnimation(); // Also try direct timeline restart
                  }, 100);
                }
              });
            },
            { threshold: 0.3 }
          );
          
          observer.observe(posterRef);
          characterRef._observer = observer;
        }
        
        // Store for cleanup
        characterRef._cleanup = () => {
          window.removeEventListener('scroll', scrollCheck);
          window.removeEventListener('resize', scrollCheck);
          if (characterRef._observer) {
            characterRef._observer.disconnect();
          }
        };
      });

      ScrollTrigger.refresh();
    };

    // Setup with multiple attempts
    const t1 = setTimeout(setupAllAnimations, 50);
    const t2 = setTimeout(setupAllAnimations, 200);
    const t3 = setTimeout(setupAllAnimations, 500);
    const t4 = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
    
    // URGENT FIX: After 3 seconds, make all characters visible if still hidden
    const t5 = setTimeout(() => {
      characterRefs.current.forEach((characterRef, index) => {
        if (characterRef) {
          const opacity = parseFloat(gsap.getProperty(characterRef, 'opacity') || 0);
          if (opacity < 0.5) {
            // Force visibility
            gsap.to(characterRef, {
              scale: 1.0,
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
            });
          }
        }
      });
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      
      // Cleanup scroll handlers and observers
      characterRefsArray.forEach(ref => {
        if (ref && ref._cleanup) {
          ref._cleanup();
        }
      });
      
      // Kill ScrollTriggers
      scrollTriggersArray.forEach(st => {
        if (st) st.kill();
      });
      scrollTriggers.current = [];
    };
  }, [posters]);

  return (
    <section id="see-our-work" className="poster-scroll-section" ref={sectionRef} aria-label="See our work">
      <div className="poster-scroll-inner">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          speed={1000}
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
          spaceBetween={0}
          className="poster-swiper"
          onSlideChange={(swiper) => {
            // Trigger character animation when slide changes
            const currentIndex = swiper.realIndex;
            const characterRef = characterRefs.current[currentIndex];
            const timeline = animationTimelines.current[currentIndex];
            
            if (characterRef && timeline) {
              timeline.restart();
            }
          }}
        >
          {posters.map((poster, index) => (
            <SwiperSlide key={poster.id} className="poster-swiper-slide">
              <article
                className="poster-slide"
                ref={(el) => (posterRefs.current[index] = el)}
                tabIndex="0"
                aria-label={`Poster ${index + 1}`}
              >
                <div className="poster-slide-inner poster-wrapper">
                  {/* Poster background WITHOUT person */}
                  <img
                    src={poster.posterImage}
                    alt={`Poster ${index + 1}`}
                    className="poster-image poster-img"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "low"}
                  />
                  
                  {/* LIVE vector person INSIDE the poster */}
                  <img
                    ref={(el) => (characterRefs.current[index] = el)}
                    src={poster.characterOutfit}
                    alt="Character"
                    className="poster-person"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PosterScrollSequence;
