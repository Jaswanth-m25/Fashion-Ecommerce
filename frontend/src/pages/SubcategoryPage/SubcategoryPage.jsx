import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Item from '../../components/Item/Item';
import './SubcategoryPage.css';

const SubcategoryPage = () => {
    const { category, subcategory } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [selectedSizes, setSelectedSizes] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, [category, subcategory]);

    useEffect(() => {
        filterProducts();
    }, [products, priceRange, selectedSizes]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://fashion-ecommerce-ak78.onrender.com/allproducts');
            const data = await response.json();
            
            // Filter by category and tags/description for subcategory
            const filtered = data.filter(product => {
                const matchesCategory = product.category === category && product.approved === true;
                const matchesSubcategory = product.tags?.toLowerCase().includes(subcategory) ||
                                          product.name?.toLowerCase().includes(subcategory);
                return matchesCategory && matchesSubcategory;
            });
            
            setProducts(filtered);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];
        
        // Filter by price
        filtered = filtered.filter(product => 
            product.new_price >= priceRange.min && 
            product.new_price <= priceRange.max
        );
        
        // Filter by size
        if (selectedSizes.length > 0) {
            filtered = filtered.filter(product => 
                product.sizes?.some(size => selectedSizes.includes(size))
            );
        }
        
        setFilteredProducts(filtered);
    };

    const getSubcategoryTitle = () => {
        const titles = {
            't-shirts': 'T-Shirts',
            'shirts': 'Shirts',
            'jeans': 'Jeans',
            'dresses': 'Dresses',
            'sarees': 'Sarees',
            // Add more mappings
        };
        return titles[subcategory] || subcategory.replace('-', ' ').toUpperCase();
    };

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const priceRanges = [
        { label: 'Under ₹500', min: 0, max: 500 },
        { label: '₹500 - ₹1000', min: 500, max: 1000 },
        { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
        { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
        { label: 'Above ₹5000', min: 5000, max: 100000 },
    ];

    return (
        <div className="subcategory-page">
            <div className="subcategory-header">
                <h1>{getSubcategoryTitle()}</h1>
                <div className="breadcrumb">
                    <span>Home</span> / <span>{category}</span> / <span>{getSubcategoryTitle()}</span>
                </div>
            </div>

            <div className="subcategory-layout">
                {/* Filters Sidebar */}
                <div className="filters-sidebar">
                    <h3>Filters</h3>
                    
                    <div className="filter-section">
                        <h4>Price Range</h4>
                        {priceRanges.map((range, index) => (
                            <label key={index} className="filter-option">
                                <input
                                    type="radio"
                                    name="price"
                                    onChange={() => setPriceRange({ min: range.min, max: range.max })}
                                />
                                <span>{range.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="filter-section">
                        <h4>Size</h4>
                        <div className="size-filters">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                                    onClick={() => {
                                        if (selectedSizes.includes(size)) {
                                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                                        } else {
                                            setSelectedSizes([...selectedSizes, size]);
                                        }
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        className="clear-filters"
                        onClick={() => {
                            setPriceRange({ min: 0, max: 10000 });
                            setSelectedSizes([]);
                        }}
                    >
                        Clear All Filters
                    </button>
                </div>

                {/* Products Grid */}
                <div className="products-content">
                    <div className="results-header">
                        <span>{filteredProducts.length} products found</span>
                    </div>

                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
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
            </div>
        </div>
    );
};

export default SubcategoryPage;
