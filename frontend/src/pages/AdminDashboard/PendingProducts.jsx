import React from 'react';
import './PendingProducts.css';

const PendingProducts = ({ pendingProducts, setSelectedProduct, handleApproveProduct, handleRejectProduct }) => {
    return (
        <div className="admin-card">
            <div className="card-header">
                <h2>Pending Product Approvals</h2>
                <div className="header-stats">
                    <span className="pending-count">{pendingProducts.length} items pending</span>
                </div>
            </div>
            {pendingProducts.length === 0 ? (
                <div className="admin-empty">
                    <span className="empty-icon">🎉</span>
                    <p>No pending products! All caught up.</p>
                </div>
            ) : (
                <div className="admin-product-grid">
                    {pendingProducts.map((product) => (
                        <div key={product.id} className="admin-product-card pending-card" onClick={() => setSelectedProduct(product)}>
                            <div className="pending-badge">⏳ Pending Review</div>
                            <img src={product.image} alt={product.name} />
                            <div className="admin-product-details">
                                <h3>{product.name}</h3>
                                <span className="admin-product-category">{product.category}</span>
                                <div className="admin-product-prices">
                                    <span className="new-price">₹{product.new_price || product.price}</span>
                                    {product.discount > 0 && <span className="old-price">₹{product.price}</span>}
                                </div>
                                <div className="vendor-info">
                                    <span className="vendor-label">Vendor:</span>
                                    <span>{product.vendorName || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="pending-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="approve-btn"
                                    onClick={() => handleApproveProduct(product.id, product.name)}
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={() => handleRejectProduct(product.id, product.name)}
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingProducts;
