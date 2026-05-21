import React from 'react';
import './ApprovedProducts.css';

const ApprovedProducts = ({ approvedProducts, users, searchTerm, setSearchTerm, setSelectedProduct, handleRemoveProduct, updateProductVendor }) => {
    return (
        <div className="admin-card">
            <div className="card-header">
                <h2>Approved Products</h2>
                <div className="filter-controls">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            
            {approvedProducts.length === 0 ? (
                <div className="admin-empty">
                    <p>No approved products yet.</p>
                </div>
            ) : (
                <div className="admin-product-grid">
                    {approvedProducts
                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((product) => (
                            <div key={product.id} className="admin-product-card" onClick={() => setSelectedProduct(product)}>

                                <div className="product-image-container">
                                    <img src={product.image} alt={product.name} />
                                </div>
                                <div className="admin-product-details">
                                    <h3>{product.name}</h3>
                                    <span className="admin-product-category">{product.category}</span>
                                    
                                    <div className="admin-product-prices">
                                        <span className="new-price">₹{(product.new_price || product.price).toLocaleString()}</span>
                                        {product.discount > 0 && (
                                            <span className="old-price">₹{product.price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    
                                    <div className="admin-vendor-reassign" onClick={(e) => e.stopPropagation()}>
                                        <label>Assign Vendor</label>
                                        <select
                                            value={product.vendorId || 'admin'}
                                            onChange={(e) => {
                                                const vId = e.target.value;
                                                const vName = vId === 'admin' ? 'Admin' : users.find(u => u._id === vId)?.name || 'Unknown';
                                                updateProductVendor(product.id, vId, vName);
                                            }}
                                        >
                                            <option value="admin">Admin (Default)</option>
                                            {users.filter(u => u.role === 'vendor').map(u => (
                                                <option key={u._id} value={u._id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    className="admin-remove-product-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveProduct(product.id, product.name);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default ApprovedProducts;