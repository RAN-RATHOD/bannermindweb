import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <Logo className="footer-logo" />
            <p className="footer-description">
              Create stunning banners with AI-powered tools. 
              Transform your ideas into professional designs instantly.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#download">Download</a></li>
                <li><a href="#building">Roadmap</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#building">About</a></li>
                {/* <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li> */}
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                {/* <li><a href="#docs">Documentation</a></li> */}
                <li><a href="#contact">Support</a></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                {/* <li><a href="#terms">Terms</a></li> */}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 BannerMind. All rights reserved.</p>
          <div className="footer-social">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

