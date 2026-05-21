import React from 'react';
import './Footer.css';
import footer_logo from '../Assets/logo.png';
import instagram_icon from '../Assets/instagram_icon.png';
import pintester_icon from '../Assets/pintester_icon.png';
import whatsapp_icon from '../Assets/whatsapp_icon.png';

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-container">
        
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={footer_logo} alt="Shopper Logo" />
            <h2>SHOPPER</h2>
          </div>
          <p>Your one-stop destination for premium fashion and lifestyle products. Quality meets elegance.</p>
          
          <div className="footer-socials">
            <div className="social-icon">
              <img src={instagram_icon} alt="Instagram" />
            </div>
            <div className="social-icon">
              <img src={pintester_icon} alt="Pinterest" />
            </div>
            <div className="social-icon">
              <img src={whatsapp_icon} alt="WhatsApp" />
            </div>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="footer-links-group">
          <h3>Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>Products</li>
            <li>About Us</li>
            <li>Offices</li>
            <li>Careers</li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="footer-links-group">
          <h3>Customer Service</h3>
          <ul>
            <li>Help & FAQs</li>
            <li>Shipping Details</li>
            <li>Returns Policy</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Newsletter Column */}
        {/* <div className="footer-newsletter">
          <h3>Subscribe</h3>
          <p>Get the latest updates, exclusive offers, and style tips straight to your inbox.</p>
          <div className="newsletter-input-group">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div> */}

      </div>

      <div className="footer-bottom">
        <hr />
        <p>Copyright © 2025 Shopper Inc. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer;
