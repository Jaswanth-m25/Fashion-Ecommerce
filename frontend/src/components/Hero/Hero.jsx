import React from 'react'
import './Hero.css'
import { useNavigate } from 'react-router-dom'
import hero_image from '../Assets/hero.png'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <div className="hero-container">
        {/* Left Content */}
        <div className="hero-left">
          <span className="hero-tag">New Collection </span>
          <h1 className="hero-heading">
            Style That<br />
            <span className="hero-red">Speaks</span> For You
          </h1>
          <p className="hero-sub">
            Discover premium fashion curated for every occasion. From casual everyday wear to elegant statement pieces.
          </p>
          <div className="hero-btns">
            <button className="hero-btn-primary" onClick={() => navigate('/all-products?type=latest')}>
              Shop Now
            </button>
            {/* <button className="hero-btn-outline" onClick={() => navigate('/all-products')}>
              Browse Collection
            </button> */}
          </div>
          {/* <div className="hero-stats">
            <div className="hero-stat">
              <strong>50K+</strong>
              <span>Happy Customers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>10K+</strong>
              <span>Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>4.9★</strong>
              <span>Avg Rating</span>
            </div>
          </div> */}
        </div>

        {/* Right Visual */}
        <div className="hero-right">
          <div className="hero-visual-card">
            <div className="hero-visual-bg" />
            <img src={hero_image} alt="Fashion Model" className="hero-visual-img" />
            <div className="hero-visual-content">
              <div className="hero-badge-float"> Trending Now</div>
            </div>
          </div>
          {/* <div className="hero-chip hero-chip-1">✓ Free Shipping</div> */}
          {/* <div className="hero-chip hero-chip-2">↩ Easy Returns</div> */}
        </div>
      </div>
    </section>
  )
}

export default Hero
