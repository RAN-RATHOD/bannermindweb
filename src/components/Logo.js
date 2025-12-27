import React from 'react';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo.svg';
import logoLight from '../assets/logowhite\'.png';
import './Logo.css';

const Logo = ({ className = '' }) => {
  const { theme } = useTheme();
  
  // Use logo.svg for dark theme, logowhite'.png for light theme
  const logoImage = theme === 'dark' ? logoDark : logoLight;
  
  return (
    <div className={`logo-container ${className}`}>
      <img 
        src={logoImage} 
        alt="BannerMind Logo" 
        className="logo-image"
      />
    </div>
  );
};

export default Logo;

