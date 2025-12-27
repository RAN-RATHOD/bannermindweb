import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initScrollEffects = () => {
  // Initialize scroll effects after DOM is ready

  // Parallax effect for hero section
  gsap.utils.toArray('.parallax-element').forEach((element) => {
    if (!element) return;
    gsap.to(element, {
      y: () => {
        return ScrollTrigger.maxScroll(window) * 0.5;
      },
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // 3D rotation on scroll (using CSS transforms instead of GSAP rotation for better compatibility)
  // Exclude elements that contain Canvas (react-three-fiber) to avoid DOM conflicts
  gsap.utils.toArray('.rotate-3d').forEach((element) => {
    if (!element) return;
    // Skip if element contains a Canvas (react-three-fiber) to avoid DOM manipulation conflicts
    if (element.querySelector('canvas')) {
      return; // Skip Canvas containers - let react-three-fiber manage them
    }
    // Use CSS transform instead of rotationY/X for better browser support
    gsap.to(element, {
      rotation: 360,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Scale and fade on scroll
  gsap.utils.toArray('.scale-on-scroll').forEach((element) => {
    if (!element) return;
    gsap.fromTo(
      element,
      {
        scale: 0.8,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Magnetic effect for buttons
  gsap.utils.toArray('.magnetic').forEach((element) => {
    if (!element) return;
    
    // Remove existing listeners to avoid duplicates
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
  });

  // Text reveal on scroll (only if not already animated)
  gsap.utils.toArray('.text-reveal').forEach((element) => {
    // Skip if element already has spans (already processed)
    if (element.querySelector('span')) return;
    
    const text = element.textContent;
    if (!text) return;
    
    element.innerHTML = text
      .split('')
      .map((char, i) => `<span style="opacity: 0">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    const spans = element.querySelectorAll('span');
    if (spans.length > 0) {
      gsap.to(spans, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  });

  // Smooth reveal with blur
  gsap.utils.toArray('.blur-reveal').forEach((element) => {
    if (!element) return;
    gsap.fromTo(
      element,
      {
        filter: 'blur(10px)',
        opacity: 0
      },
      {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

