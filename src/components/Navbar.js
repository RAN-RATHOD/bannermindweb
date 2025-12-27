import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJoinUsDropdownOpen, setIsJoinUsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsJoinUsDropdownOpen(false);
      }
    };

    if (isJoinUsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isJoinUsDropdownOpen]);

  const scrollToSection = (sectionId) => {
    // Check if section exists on current page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
      return;
    }
    
    // If section doesn't exist on current page and we're not on home, navigate to home
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    }
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      window.location.href = '/';
    } else {
      scrollToSection('hero');
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <Logo />
        </div>
        
        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {location.pathname === '/join-us' ? (
            <>
              <a href="#features" onClick={() => scrollToSection('features')}>Why Join Us</a>
              <a href="#benefits" onClick={() => scrollToSection('benefits')}>Benefits</a>
              <a href="#how-it-works" onClick={() => scrollToSection('how-it-works')}>How It Works</a>
              <a href="#contact" onClick={() => scrollToSection('contact')}>Contact Us</a>
            </>
          ) : (
            <>
              <a href="#features" onClick={() => scrollToSection('features')}>Features</a>
              <a href="#download" onClick={() => scrollToSection('download')}>Download</a>
              <a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a>
            </>
          )}
          <div 
            className={`join-us-dropdown-container ${isJoinUsDropdownOpen ? 'active' : ''}`}
            ref={dropdownRef}
            onMouseEnter={() => setIsJoinUsDropdownOpen(true)}
            onMouseLeave={() => setIsJoinUsDropdownOpen(false)}
          >
            <button 
              className="join-us-btn"
              onClick={() => setIsJoinUsDropdownOpen(!isJoinUsDropdownOpen)}
            >
              Join Us
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="dropdown-arrow">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`join-us-dropdown ${isJoinUsDropdownOpen ? 'active' : ''}`}>
              <Link 
                to="/" 
                className="dropdown-item"
                onClick={() => {
                  setIsJoinUsDropdownOpen(false);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="dropdown-icon">👤</span>
                User
              </Link>
              <Link 
                to="/join-us" 
                className="dropdown-item"
                onClick={() => {
                  setIsJoinUsDropdownOpen(false);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="dropdown-icon">🏢</span>
                Company
              </Link>
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          <button 
            className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

