import React, { useContext } from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'

const Item = (props) => {
  const { wishlistItems, toggleWishlist } = useContext(ShopContext);
  const isWishlisted = wishlistItems?.includes(props.id);
  const isOutOfStock = (() => {

    // SIZE-WISE STOCK

    if (
        props.sizeStock &&
        Object.keys(props.sizeStock).length > 0
    ) {

        return Object.values(props.sizeStock)
            .every(stock => stock <= 0);
    }

    // NORMAL STOCK

    return props.stock <= 0;
})();
  
  return (
    <div className={`Item ${isOutOfStock ? 'out-of-stock' : ''}`}>
        <div className="item-image-wrapper">
          <Link to={`/product/${props.id}`}><img onClick={()=>window.scrollTo(0,0)} src={props.image} alt=""/></Link>
          {props.discount > 0 && (
            <div className="item-discount-badge">-{props.discount}%</div>
          )}
          {isOutOfStock && (
            <div className="item-out-of-stock-badge">Out of Stock</div>
          )}
          <div className={`wishlist-icon ${isWishlisted ? 'active' : ''}`} onClick={() => toggleWishlist(props.id)}>
              {isWishlisted ? '❤️' : '🤍'}
          </div>
        </div>
        <p>{props.name}</p>
        <div className="item-prices">
            <div className="item-price-new">  
                ₹{props.new_price}
            </div>
            {props.discount > 0 && (
              <div className="item-price-old">
                  ₹{props.price}
              </div>
            )}
        </div>
    </div>
  )
}

export default Item
