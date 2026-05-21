import React from 'react'
import './offers.css'
import { useNavigate } from 'react-router-dom'
import exclusive_image from '../Assets/exclusive_image.png'

const Offers = () => {
  const navigate = useNavigate();

  const handleCheckOffers = () => {
    navigate('/womens');
  };

  return (
    <div className="offers">
      <div className="offers-left">
        <h1>Exclusive</h1>
        <h1>Offers for you</h1>
        <p>Only on best seller products</p>
        <button onClick={handleCheckOffers}>Check now</button>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="exclusive offer"/>
      </div>
    </div>
  )
}

export default Offers
