import React, { useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './ShopCategory.css'
import {ShopContext} from '../../context/ShopContext'
import dropdown_icon from '../../components/Assets/dropdown_icon.png'
import Item from '../../components/Item/Item'

const ShopCategory=(props) =>{
    const {all_product} =useContext(ShopContext);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    // Check for discount filter in URL
    const initialDiscountFilter = queryParams.get('filter') === 'discount50' ? '50' : 'all';

    const [sortType, setSortType] = useState('default');
    const [priceFilter, setPriceFilter] = useState('all');
    const [discountFilter, setDiscountFilter] = useState(initialDiscountFilter);

    // 1. Filter by Category
    let filteredProducts = all_product.filter(item => item.category === props.category);

    // 2. Filter by Discount (New)
    if (discountFilter === '50') {
        filteredProducts = filteredProducts.filter(item => item.discount >= 50);
    } else if (discountFilter === '20') {
        filteredProducts = filteredProducts.filter(item => item.discount >= 20);
    }

    // 3. Filter by Price
    if (priceFilter === 'under500') {
        filteredProducts = filteredProducts.filter(item => item.new_price < 500);
    } else if (priceFilter === '500to1000') {
        filteredProducts = filteredProducts.filter(item => item.new_price >= 500 && item.new_price <= 1000);
    } else if (priceFilter === 'over1000') {
        filteredProducts = filteredProducts.filter(item => item.new_price > 1000);
    }

    // 4. Sort
    if (sortType === 'lowToHigh') {
        filteredProducts.sort((a, b) => a.new_price - b.new_price);
    } else if (sortType === 'highToLow') {
        filteredProducts.sort((a, b) => b.new_price - a.new_price);
    }

    return(
        <div>
            <Navbar />
            <div className='shop-category'>
                <div className="shopcategory-banner-container">
                    <img className='shopcategory-banner' src={props.banner} alt=""/>
                </div>
            
            <div className="shopcategory-filter-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 100px', padding: '15px 30px', background: '#fbfbfb', borderRadius: '15px', border: '1px solid #eaeaea'}}>
                <p style={{fontWeight: 600, color: '#333'}}>
                    <span>Showing 1-{filteredProducts.length}</span> out of {filteredProducts.length} products
                </p>
                
                <div style={{display: 'flex', gap: '20px'}}>
                    <select 
                        value={discountFilter} 
                        onChange={(e) => setDiscountFilter(e.target.value)}
                        style={{padding: '10px 15px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer', fontFamily: 'Outfit', color: '#555'}}
                    >
                        <option value="all">Any Discount</option>
                        <option value="20">Min 20% Off</option>
                        <option value="50">Min 50% Off</option>
                    </select>

                    <select 
                        value={priceFilter} 
                        onChange={(e) => setPriceFilter(e.target.value)}
                        style={{padding: '10px 15px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer', fontFamily: 'Outfit', color: '#555'}}
                    >
                        <option value="all">All Prices</option>
                        <option value="under500">Under ₹500</option>
                        <option value="500to1000">₹500 - ₹1000</option>
                        <option value="over1000">Over ₹1000</option>
                    </select>

                    <select 
                        value={sortType} 
                        onChange={(e) => setSortType(e.target.value)}
                        style={{padding: '10px 15px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer', fontFamily: 'Outfit', color: '#555'}}
                    >
                        <option value="default">Sort by: Recommended</option>
                        <option value="lowToHigh">Price: Low to High</option>
                        <option value="highToLow">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div className="shopcategory-products">
                {filteredProducts.map((item,i)=>{
                    return <Item key={i} {...item}/>
                })}
            </div>
            
            {filteredProducts.length === 0 && (
                <div style={{textAlign: 'center', padding: '50px', color: '#888', fontSize: '18px'}}>
                    No products found matching these filters.
                </div>
            )}
            </div>
            <Footer />
        </div>
    )
}
export default ShopCategory
