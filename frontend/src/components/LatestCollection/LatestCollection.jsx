import React, { useContext } from 'react'
import './LatestCollection.css'
import { useNavigate } from 'react-router-dom'
import Item from '../Item/Item'
import { ShopContext } from '../../context/ShopContext'

const LatestCollection = () => {
  const { all_product } = useContext(ShopContext);
  const navigate = useNavigate();

  // Show products in normal order (not reversed) - different from NewCollections
  const latestProducts = all_product.slice(0, 8);

  const handleViewAll = () => {
    navigate('/all-products?type=latest');
  };

  return (
    <div className='latest-collection'>
      <h1>⭐ Latest Collection</h1>
      <hr/>
      <div className="latest-items">
        {latestProducts.map((item,i)=>{
            return <Item key={i} {...item}/>
        })}
      </div>

      <button className="view-all-btn" onClick={handleViewAll}>
        View All Products →
      </button>
      
      {latestProducts.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>No latest products yet.</p>
      )}
    </div>
  )
}

export default LatestCollection
