import React, { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { ShopContext } from '../../context/ShopContext';
import Item from '../../components/Item/Item'; 

const Search = () => {
    const { all_product } = useContext(ShopContext);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const filteredProducts = all_product.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <div className="search-results-section" style={{minHeight: '60vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '30px', fontFamily: 'Outfit, sans-serif', color: '#1a1a1a'}}>
                Search Results for "{query}" ({filteredProducts.length})
            </h2>
            
            {filteredProducts.length === 0 ? (
                <p style={{fontSize: '18px', color: '#666'}}>No products found matching your search.</p>
            ) : (
                <div className="search-results-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px', rowGap: '50px'}}>
                    {filteredProducts.map((item, index) => {
                        return <Item key={index} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                    })}
                </div>
            )}
            </div>
            <Footer />
        </div>
    );
};

export default Search;

