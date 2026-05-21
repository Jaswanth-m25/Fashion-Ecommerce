import React from 'react'
import './Hero.css'
import { useNavigate } from 'react-router-dom'
import hand_icon from '../Assets/hand_icon.png'
import arrow_icon from'../Assets/arrow.png'
import hero_img from '../Assets/hero_image.png'

const Hero = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/all-products?type=latest');
  };

  return (
    <div className="hero">
        <div className="heroleft">
            <h2>✨ New arrivals only</h2>
            <div>
                <div className="hand-hand-icon">
                    <p>new</p>
                    <img src={hand_icon} alt="hand icon"/>
                </div>
                <p>Collections</p>
                <p>For everyone</p>
            </div>
            <button className="hero-explore-btn" onClick={handleExplore}>
                Explore →
            </button>
        </div>
        <div className="heroright">
            <img src={hero_img} alt="hero" className="hero-image"/>
        </div>
    </div>
  )
}

export default Hero
