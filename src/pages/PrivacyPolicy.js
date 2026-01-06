import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-policy-page">
      <Navbar />
      
      <section className="privacy-policy-hero">
        <div className="privacy-policy-container">
          <h1 className="privacy-policy-title">Privacy Policy</h1>
          <p className="privacy-policy-subtitle">For Marketing Website</p>
        </div>
      </section>

      <section className="privacy-policy-content">
        <div className="privacy-policy-container">
          <div className="policy-meta">
            <p><strong>Effective Date:</strong> December 2025</p>
            <p><strong>Last Updated:</strong> December 2025</p>
            <p><strong>Website:</strong> bannermind.in</p>
            <p><strong>App:</strong> BannerMind</p>
          </div>

          <div className="policy-section">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how we collect, use, and protect information when visitors browse our marketing website and interact with our content.
            </p>
            <p>
              This policy applies only to the marketing website and not to the app itself (the app requires a separate privacy policy).
            </p>
            <p>
              By using our website, you agree to the practices described in this policy.
            </p>
          </div>

          <div className="policy-section">
            <h2>2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            
            <h3>a. Information You Provide Voluntarily</h3>
            <ul>
              <li>Contact forms (name, email, phone number)</li>
              <li>Newsletter sign-up details</li>
              <li>Support or inquiry messages</li>
            </ul>

            <h3>b. Automatically Collected Information</h3>
            <p>When you visit our website, we may collect:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Pages visited</li>
              <li>Time spent on the site</li>
              <li>Referral links</li>
            </ul>
            <p>This information is collected using cookies and analytics tools.</p>

            <h3>c. Cookies and Tracking</h3>
            <p>We use cookies to:</p>
            <ul>
              <li>Improve website performance</li>
              <li>Analyze traffic</li>
              <li>Personalize content</li>
              <li>Track marketing campaigns</li>
            </ul>
            <p>You can disable cookies through your browser settings.</p>
          </div>

          <div className="policy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Respond to inquiries</li>
              <li>Improve website performance</li>
              <li>Understand visitor behavior</li>
              <li>Run marketing and advertising campaigns</li>
              <li>Show relevant ads through third-party tools (Google, Meta, etc.)</li>
              <li>Improve user experience on the website</li>
            </ul>
            <p className="highlight">We do not sell your information to any third party.</p>
          </div>

          <div className="policy-section">
            <h2>4. Third-Party Services We Use</h2>
            <p>Our website may use tools like:</p>
            <ul>
              <li>Google Analytics</li>
              <li>Google Tag Manager</li>
              <li>Meta Pixel</li>
              <li>Email marketing platforms</li>
              <li>Web hosting providers</li>
              <li>CDN services</li>
            </ul>
            <p>These tools may collect anonymous usage data according to their own privacy policies.</p>
          </div>

          <div className="policy-section">
            <h2>5. Data Protection & Security</h2>
            <p>We take reasonable measures to protect your information from:</p>
            <ul>
              <li>Unauthorized access</li>
              <li>Misuse</li>
              <li>Loss or alteration</li>
            </ul>
            <p>However, no online transmission is 100% secure, and we cannot guarantee absolute protection.</p>
          </div>

          <div className="policy-section">
            <h2>6. Links to Third-Party Websites</h2>
            <p>Our website may contain links to third-party sites.</p>
            <p>We are not responsible for the content or privacy practices of those sites.</p>
          </div>

          <div className="policy-section">
            <h2>7. Children's Privacy</h2>
            <p>Our website is not intended for children under 13.</p>
            <p>We do not knowingly collect personal information from children.</p>
          </div>

          <div className="policy-section">
            <h2>8. Marketing & Communications</h2>
            <p>If you provide us with your contact details, we may send:</p>
            <ul>
              <li>Product updates</li>
              <li>Marketing emails</li>
              <li>Promotional messages</li>
            </ul>
            <p>You can unsubscribe anytime.</p>
          </div>

          <div className="policy-section">
            <h2>9. Your Rights</h2>
            <p>Depending on your region, you may request:</p>
            <ul>
              <li>Access to your data</li>
              <li>Correction of your data</li>
              <li>Deletion of your data</li>
              <li>Restriction of data usage</li>
              <li>Opt-out of marketing</li>
            </ul>
            <p>To exercise these rights, contact us at the email below.</p>
          </div>

          <div className="policy-section">
            <h2>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time.</p>
            <p>Changes will be posted on this page with an updated "Last Updated" date.</p>
          </div>

          <div className="policy-section">
            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact:</p>
            <div className="contact-info">
              <p><strong>Company / Owner Name:</strong> BannerMind</p>
              <p><strong>Email:</strong> contact@bannermind.in</p>
              <p><strong>Phone:</strong> +91 9422476202</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;















