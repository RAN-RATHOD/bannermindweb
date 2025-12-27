import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PosterScrollSequence from './components/PosterScrollSequence';
import Download from './components/Download';
import Building from './components/Building';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import JoinUs from './pages/JoinUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { initScrollEffects } from './utils/scrollEffects';
import './App.css';

function Home() {
  useEffect(() => {
    // Initialize scroll effects after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initScrollEffects();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup all ScrollTriggers on unmount
      // Use try-catch to prevent errors if triggers are already killed
      try {
        const triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
          try {
            if (trigger && typeof trigger.kill === 'function') {
              trigger.kill();
            }
          } catch (e) {
            // Ignore individual trigger cleanup errors
          }
        });
        // Refresh to release DOM references
        ScrollTrigger.refresh();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <PosterScrollSequence />
      <Download />
      <Building />
      <ContactForm />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            } />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
