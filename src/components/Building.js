import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Building.css';
import NotifyModal from './NotifyModal';

gsap.registerPlugin(ScrollTrigger);

const Building = () => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    itemsRef.current.forEach((item, index) => {
      if (item) {
        gsap.fromTo(
          item,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            delay: index * 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });
  }, []);

  const features = [
    {
      icon: '🚀',
      title: 'Advanced AI Models',
      description: 'We\'re integrating cutting-edge AI models for even better results',
      progress: 85
    },
    {
      icon: '🎨',
      title: 'More Templates',
      description: 'Expanding our template library with 500+ new designs',
      progress: 70
    },
    // {
    //   icon: '🌐',
    //   title: 'Multi-language Support',
    //   description: 'Adding support for 20+ languages worldwide',
    //   progress: 60
    // },
  //  {
//   icon: '📱',
//   title: 'Mobile App (Android)',
//   description: 'Graphic studio in your pocket',
//   progress: 45
// },
{
  icon: '📱',
  title: 'Mobile App (Android)',
  description: 'Graphic studio in your pocket',
  progress: 45
},


    // {
    //   icon: '🤝',
    //   title: 'Team Collaboration',
    //   description: 'Real-time collaboration features for teams',
    //   progress: 30
    // },
    {
      icon: '⚡',
      title: 'Performance Boost',
      description: '10x faster rendering and processing speeds',
      progress: 90
    }
  ];

  return (
    <section id="building" className="building-section" ref={sectionRef}>
      <div className="building-container">
        <div className="building-header">
          <div className="building-badge">
            <span className="pulse-dot"></span>
            We're Building
          </div>
          <h2 className="building-title">
            Exciting <span className="gradient-text">Features</span> Coming Soon
          </h2>
          <p className="building-subtitle">
            We're constantly working on new features to make BannerMind even better
          </p>
        </div>

        <div className="building-swiper-wrapper">
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
              delay: 2500,
              disableOnInteraction: false,
            }}
            loop={true}
            spaceBetween={20}
            className="building-swiper"
          >
            {features.map((feature, index) => (
              <SwiperSlide key={index}>
                <div
                  ref={(el) => (itemsRef.current[index] = el)}
                  className="building-card"
                >
                  <div className="building-icon">{feature.icon}</div>
                  <div className="building-content">
                    <h3 className="building-card-title">{feature.title}</h3>
                    <p className="building-card-description">{feature.description}</p>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${feature.progress}%` }}
                        >
                          <span className="progress-text">{feature.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="building-cta">
          <p>Want to be notified when these features launch?</p>
          <button 
            className="notify-btn"
            onClick={() => setIsNotifyModalOpen(true)}
          >
            Notify Me
          </button>
        </div>
      </div>

      {/* Notify Modal */}
      <NotifyModal 
        isOpen={isNotifyModalOpen} 
        onClose={() => setIsNotifyModalOpen(false)} 
      />
    </section>
  );
};

export default Building;








