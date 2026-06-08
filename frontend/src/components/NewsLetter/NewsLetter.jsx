import React, { useState } from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubscribe = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email address'); return }
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return }
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <h2 className="newsletter-title">Subscribe & Save</h2>
        <p className="newsletter-desc">
          Get the latest trends and exclusive offers directly to your inbox.
        </p>

        <form onSubmit={handleSubscribe} className="newsletter-form">
          <div className="newsletter-input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className={error ? 'input-error' : ''}
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </div>

          {error && <p className="newsletter-error">{error}</p>}
          {subscribed && (
            <p className="newsletter-success">✓ Thanks for subscribing!</p>
          )}
        </form>
      </div>
    </section>
  )
}

export default NewsLetter
