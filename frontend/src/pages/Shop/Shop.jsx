import React from 'react'
import './Shop.css'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Hero from '../../components/Hero/Hero'
import Popular from '../../components/popular/popular'
import LatestCollection from '../../components/LatestCollection/LatestCollection'
import NewsLetter from '../../components/NewsLetter/NewsLetter'

const Shop = () => {
  return (
    <div className="shop-page">
      <Navbar />
      <Hero />
      <Popular />
      <LatestCollection />
      {/* <NewsLetter /> */}
      <Footer />
    </div>
  )
}

export default Shop
