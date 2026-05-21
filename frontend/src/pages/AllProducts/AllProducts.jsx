import React, { useContext, useState, useMemo } from 'react'
import './AllProducts.css'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Item from '../../components/Item/Item'
import { ShopContext } from '../../context/ShopContext'
import { useSearchParams } from 'react-router-dom'

const AllProducts = () => {
  const { all_product } = useContext(ShopContext);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();
  
  const filterType = searchParams.get('type') || 'all'; // all, latest, or popular

  const sortedProducts = useMemo(() => {
    let products = [...all_product];
    
    if (filterType === 'latest') {
      // Show latest/most recent products (reversed order)
      products = products.reverse();
    } else if (filterType === 'popular') {
      // Show popular/most purchased products (sorted by views and sales)
      products = products.sort((a, b) => {
        const aScore = (a.views_count || 0) + (a.sales_count || 0);
        const bScore = (b.views_count || 0) + (b.sales_count || 0);
        return bScore - aScore; // Highest score first
      });
    }
    
    return products;
  }, [all_product, filterType]);

  const filteredProducts = selectedCategory === 'all' 
    ? sortedProducts 
    : sortedProducts.filter(item => item.category === selectedCategory);

  const getPageTitle = () => {
    if (filterType === 'latest') return 'Latest Products';
    if (filterType === 'popular') return 'Popular & Most Purchased Products';
    return 'All Products';
  };

  return (
    <div>
      <Navbar />
      <div className="all-products-container">
        <h1>{getPageTitle()}</h1>
        
        <div className="category-filter">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </button>
          <button 
            className={selectedCategory === 'women' ? 'active' : ''} 
            onClick={() => setSelectedCategory('women')}
          >
            Women
          </button>
          <button 
            className={selectedCategory === 'men' ? 'active' : ''} 
            onClick={() => setSelectedCategory('men')}
          >
            Men
          </button>
          <button 
            className={selectedCategory === 'kid' ? 'active' : ''} 
            onClick={() => setSelectedCategory('kid')}
          >
            Kids
          </button>
        </div>

        <div className="all-products-grid">
          {filteredProducts.map((item, i) => (
            <Item key={i} {...item} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p style={{textAlign: 'center', marginTop: '40px', color: '#888', fontSize: '18px'}}>
            No products available in this category.
          </p>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AllProducts
