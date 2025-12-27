import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Download.css';

gsap.registerPlugin(ScrollTrigger);

const Download = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
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

    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.9, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.2,
            delay: index * 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });
  }, []);

  const platforms = [
    {
      name: 'Mobile App',
      size: '45 MB',
      download: '#'
    },
//     {
//       name: 'macOS',
//       icon: '🍎',
//       version: 'v2.0.1',
//       size: '52 MB',
//       download: '#'
//     },
//     {
//       name: 'Linux',
//       icon: '🐧',
//       version: 'v2.0.1',
//       size: '48 MB',
//       download: '#'
//     }
  ];

  return (
    <section id="download" className="download-section" ref={sectionRef}>
      <div className="download-container">
        <div className="download-header">
          <h2 className="download-title">
            Download <span className="gradient-text">BannerMind</span>
          </h2>
          <p className="download-subtitle">
            Get started today and create stunning banners in minutes
          </p>
        </div>

        <div className="download-cards">
          {platforms.map((platform, index) => (
            <div
              key={platform.name}
              ref={(el) => (cardRefs.current[index] = el)}
              className="download-card scale-on-scroll blur-reveal"
            >
              <div className="platform-icon">{platform.icon}</div>
              <h3 className="platform-name">{platform.name}</h3>
              <div className="platform-info">
                <span className="platform-version">{platform.version}</span>
                <span className="platform-size">{platform.size}</span>
              </div>
              <button className="download-btn magnetic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>

        <div className="download-features">
          <div className="download-perk">
            <div className="download-perk-icon">✓</div>
            <span>Free to download</span>
          </div>
          <div className="download-perk">
            <div className="download-perk-icon">✓</div>
            <span>No credit card required</span>
          </div>
          {/* <div className="download-perk">
            <div className="download-perk-icon">✓</div>
            <span>Available on all platforms</span> */}
          {/* </div> */}
        </div>
      </div>
    </section>
  );
};

export default Download;

