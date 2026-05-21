import React, { useContext } from 'react'
import './NewCollections.css'
import { useNavigate } from 'react-router-dom'
import Item from '../Item/Item'
import { ShopContext } from '../../context/ShopContext'

const NewCollections = () => {
  const { all_product } = useContext(ShopContext);
  const navigate = useNavigate();

  // Show the latest products (last 8 added)
  const newCollections = [...all_product].reverse().slice(0, 8);

  const handleExplore = () => {
    navigate('/all-products?type=latest');
  };

  return (
    <div className='new-collections'>
      <h1>✨ New Collections For Everyone</h1>
      <hr/>
      <div className="collections">
        {newCollections.map((item,i)=>{
            return <Item key={i} {...item}/>
        })}
      </div>

      <button className="view-all-btn" onClick={handleExplore}>
        Explore →
      </button>
      
      {newCollections.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>No new collections yet.</p>
      )}
    </div>
  )
}

export default NewCollections
