import React, { useContext, useState } from 'react'
import './LatestCollection.css'
import { useNavigate } from 'react-router-dom'
import Item from '../Item/Item'
import { ShopContext } from '../../context/ShopContext'

const LatestCollection = () => {
  const { all_product } = useContext(ShopContext)
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const latestProducts = all_product
    .filter(item => filter === 'all' || item.category === filter)
    .slice(0, 8)

  return (
    <section className="latest-section">
      <div className="latest-container">
        <div className="latest-header">
          <p className="latest-subtitle">New Arrivals</p>
          <h2 className="latest-title">Latest Collection</h2>
        </div>

        <div className="latest-filters">
          <button 
            className={`latest-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`latest-filter ${filter === 'women' ? 'active' : ''}`}
            onClick={() => setFilter('women')}
          >
            Women
          </button>
          <button 
            className={`latest-filter ${filter === 'men' ? 'active' : ''}`}
            onClick={() => setFilter('men')}
          >
            Men
          </button>
          <button 
            className={`latest-filter ${filter === 'kid' ? 'active' : ''}`}
            onClick={() => setFilter('kid')}
          >
            Kids
          </button>
        </div>

        {latestProducts.length > 0 ? (
          <div className="latest-grid">
            {latestProducts.map((item, i) => (
              <Item key={item.id || i} {...item} />
            ))}
          </div>
        ) : (
          <div className="latest-empty">
            <p>No products in this category yet.</p>
          </div>
        )}

        <button className="latest-view-all" onClick={() => navigate('/all-products?type=latest')}>
          Explore More
        </button>
      </div>
    </section>
  )
}

export default LatestCollection
