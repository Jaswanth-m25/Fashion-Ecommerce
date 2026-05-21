import React, { useContext, useState } from 'react'
import './popular.css'
import { useNavigate } from 'react-router-dom'
import Item from '../Item/Item'
import { ShopContext } from '../../context/ShopContext'

const Popular = () => {
  const { all_product } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('women');
  const navigate = useNavigate();

  const popularProducts = all_product
    .filter(item => item.category === activeTab)
    .slice(0, 4);

  const handleViewAll = () => {
    navigate('/all-products?type=popular');
  };

  return (
    <div className="popular">
      <h1>🔥 POPULAR PRODUCTS</h1>
      <hr/>
      
      <div className="popular-tabs">
        <div 
          className={`popular-tab ${activeTab === 'women' ? 'active' : ''}`} 
          onClick={() => setActiveTab('women')}
        >
          👗 Women
        </div>
        <div 
          className={`popular-tab ${activeTab === 'men' ? 'active' : ''}`} 
          onClick={() => setActiveTab('men')}
        >
          👔 Men
        </div>
        <div 
          className={`popular-tab ${activeTab === 'kid' ? 'active' : ''}`} 
          onClick={() => setActiveTab('kid')}
        >
          👶 Kids
        </div>
      </div>

      <div className="popular-item">
        {popularProducts.map((item,i)=>{
            return <Item key={i} {...item}/>
        })}
      </div>

      <button className="view-all-btn" onClick={handleViewAll}>
        View All Products →
      </button>
      
      {popularProducts.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>No products available for this category.</p>
      )}
    </div>
  )
}

export default Popular
