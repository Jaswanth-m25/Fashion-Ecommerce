import React, { useState } from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Show success message
    setSubscribed(true);
    setEmail('');

    // Reset success message after 4 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <div className='newsletter'>
      <h1>💌 Get exclusive offers on your email</h1>
      <p>Subscribe to our newsletter and stay updated with the latest trends & offers</p>
      <div className="newsletter-form">
        <form onSubmit={handleSubscribe}>
          <div className="form-group">
            <input 
              type="email" 
              placeholder='Enter your email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? 'input-error' : ''}
            />
            <button type="submit">Subscribe</button>
          </div>
          {error && <p className="error-message">{error}</p>}
          {subscribed && <p className="success-message">✓ Thanks for subscribing!</p>}
        </form>
      </div>
    </div>
  )
}

export default NewsLetter
