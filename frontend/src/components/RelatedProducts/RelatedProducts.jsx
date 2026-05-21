import React, { useContext } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { ShopContext } from '../../context/ShopContext'

const RelatedProducts = (props) => {
  const { all_product } = useContext(ShopContext);
  const { category, id } = props;

  // Filter products by category, excluding current product, and take 4
  const related = all_product
    .filter(item => item.category === category && item.id !== id)
    .slice(0, 4);

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr/>
      <div className="relatedproducts-item">
        {related.map((item,i)=>{
            return <Item
   id={item.id}
   name={item.name}
   image={item.image}

   new_price={item.new_price}

   old_price={item.old_price}

   stock={item.stock}

   sizeStock={item.sizeStock}

   discount={item.discount}
/>
        })}
      </div>
      {related.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>No related products found.</p>
      )}
    </div>
  )
}

export default RelatedProducts
