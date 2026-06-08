import React, { useContext, useState } from 'react'
import './popular.css'
import { useNavigate } from 'react-router-dom'
import Item from '../Item/Item'
import { ShopContext } from '../../context/ShopContext'

const Popular = () => {
  const { all_product } = useContext(ShopContext)
  const [activeTab, setActiveTab] = useState('women')
  const navigate = useNavigate()

  const popularProducts = all_product
    .filter(item => item.category === activeTab)
    .slice(0, 4)

  return (
    <section className="popular-section">
      <div className="popular-container">
        <div className="popular-header">
          <p className="popular-subtitle">Best Sellers</p>
          <h2 className="popular-title">Popular Products</h2>
        </div>

        <div className="popular-tabs">
          <button 
            className={`popular-tab ${activeTab === 'women' ? 'active' : ''}`}
            onClick={() => setActiveTab('women')}
          >
            Women
          </button>
          <button 
            className={`popular-tab ${activeTab === 'men' ? 'active' : ''}`}
            onClick={() => setActiveTab('men')}
          >
            Men
          </button>
          <button 
            className={`popular-tab ${activeTab === 'kid' ? 'active' : ''}`}
            onClick={() => setActiveTab('kid')}
          >
            Kids
          </button>
        </div>

        {popularProducts.length > 0 ? (
          <div className="popular-grid">
            {popularProducts.map((item, i) => (
              <Item key={i} {...item} />
            ))}
          </div>
        ) : (
          <div className="popular-empty">
            <p>No products available in this category yet.</p>
          </div>
        )}

        <button className="popular-view-all" onClick={() => navigate('/all-products?type=popular')}>
          View All Products
        </button>
      </div>
    </section>
  )
}

export default Popular
