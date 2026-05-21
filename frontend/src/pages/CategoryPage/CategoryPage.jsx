import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Item from '../../components/Item/Item';
import './CategoryPage.css';

const CategoryPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/allproducts');
            const data = await response.json();
            const filteredProducts = data.filter(product => 
                product.category === category && product.approved === true
            );
            setProducts(filteredProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryTitle = () => {
        switch(category) {
            case 'men': return "Men's Collection";
            case 'women': return "Women's Collection";
            case 'kids': return "Kids' Collection";
            default: return "Collection";
        }
    };

    const sortProducts = (products) => {
        switch(sortBy) {
            case 'price-low':
                return [...products].sort((a, b) => a.new_price - b.new_price);
            case 'price-high':
                return [...products].sort((a, b) => b.new_price - a.new_price);
            case 'popular':
                return [...products].sort((a, b) => b.popularity - a.popularity);
            default:
                return products;
        }
    };

    return (
        <div className="category-page">
            <div className="category-banner">
                <h1>{getCategoryTitle()}</h1>
                <p>Discover the latest fashion trends</p>
            </div>
            
            <div className="category-controls">
                <div className="results-count">
                    {products.length} Products Found
                </div>
                <div className="sort-control">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="default">Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="no-products">
                    <h3>No products found in this category</h3>
                    <p>Check back soon for new arrivals!</p>
                </div>
            ) : (
                <div className="products-grid">
                    {sortProducts(products).map((product) => (
                        <Item
   id={item.id}
   name={item.name}
   image={item.image}

   new_price={item.new_price}

   old_price={item.old_price}

   stock={item.stock}

   sizeStock={item.sizeStock}

   discount={item.discount}
/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
