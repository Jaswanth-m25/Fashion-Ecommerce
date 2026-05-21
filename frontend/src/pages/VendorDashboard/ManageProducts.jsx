import React, { useState, useMemo } from 'react';
import './ManageProducts.css';

const ManageProducts = ({
    filteredProducts,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    onEdit,
    onDelete,
    onSelectProduct,
    exportData
}) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const products = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
            if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'stock-low') return (a.stock || 0) - (b.stock || 0);
            if (sortBy === 'stock-high') return (b.stock || 0) - (a.stock || 0);
            return 0;
        });
    }, [filteredProducts, sortBy]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowDetailsModal(true);
    };

    const closeModal = () => {
        setShowDetailsModal(false);
        setSelectedProduct(null);
    };

    const getProductStatus = (product) => {
        if (product.removedByAdmin || product.status === 'removed') return 'removed';
        if (product.rejectedByAdmin || product.status === 'rejected') return 'rejected';
        if (product.approved) return 'approved';
        return 'pending';
    };

    const getStatusConfig = (status) => {
        const configs = {
            approved: { label: 'Approved', class: 'approved', icon: '✅' },
            pending: { label: 'Pending', class: 'pending', icon: '⏳' },
            rejected: { label: 'Rejected by Admin', class: 'rejected', icon: '❌' },
            removed: { label: 'Removed by Admin', class: 'removed', icon: '🗑️' }
        };
        return configs[status] || configs.pending;
    };

    return (
        <>
            <div className="vendor-card">
                <div className="card-header">
                    <div className="header-left">
                        <h2>My Products</h2>
                        <span className="product-count">{products.length} products</span>
                    </div>
                    <div className="filter-controls">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kid">Kids</option>
                        </select>
                        
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="removed">Removed</option>
                        </select>
                        
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="name">Name A-Z</option>
                            <option value="stock-low">Stock: Low to High</option>
                            <option value="stock-high">Stock: High to Low</option>
                        </select>
                        
                        <div className="view-toggle">

                        </div>
                        
                        <button className="export-btn" onClick={() => exportData('products')}>
                             Export
                        </button>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="vendor-empty">
                        <span className="empty-icon">📦</span>
                        <p>No products found. Start by adding your first product!</p>
                        <button className="add-product-btn" onClick={() => document.querySelector('[data-tab="add"]')?.click()}>
                            + Add Product
                        </button>
                    </div>
                ) : (
                    <div className={`vendor-product-${viewMode}`}>
                        {products.map((product) => {
                            const status = getProductStatus(product);
                            const statusConfig = getStatusConfig(status);
                            const canEdit = true; // Allow editing for all products
                            
                            return (
                                <div 
                                    key={product.id} 
                                    className={`vendor-product-card ${viewMode === 'list' ? 'list-view' : ''} ${status}`}
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="product-image-wrapper">
                                        <img src={product.image} alt={product.name} className="vendor-product-img" />
                                        <div className={`product-status-badge ${statusConfig.class}`}>
                                            {statusConfig.icon} {statusConfig.label}
                                        </div>
                                        {product.discount > 0 && status === 'approved' && (
                                            <div className="discount-badge">-{product.discount}%</div>
                                        )}
                                    </div>
                                    
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <div className="product-meta">
                                            <span className="product-category">{product.category}</span>
                                            {product.brand && <span className="product-brand">{product.brand}</span>}
                                        </div>
                                        <div className="product-prices">
                                            <span className="current-price">₹{product.new_price || product.price}</span>
                                            {product.discount > 0 && status === 'approved' && (
                                                <span className="original-price">₹{product.price}</span>
                                            )}
                                        </div>
                                        
                                        {status === 'approved' && product.stock && (
                                            <div className={`stock-indicator ${parseInt(product.stock) > 10 ? 'in-stock' : 'low-stock'}`}>
                                                {parseInt(product.stock) > 10 ? '✓ In Stock' : `⚠️ Only ${product.stock} left`}
                                            </div>
                                        )}
                                        
                                        {status === 'rejected' && product.rejectionReason && (
                                            <div className="rejection-reason">
                                                <strong>Reason:</strong> {product.rejectionReason}
                                            </div>
                                        )}
                                        
                                        {status === 'removed' && product.removalReason && (
                                            <div className="removal-reason">
                                                <strong>Reason:</strong> {product.removalReason}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="edit-btn" onClick={() => onEdit(product)}>
                                             Edit
                                        </button>
                                        <button className="remove-btn" onClick={() => onDelete(product.id, product.name)}>
                                             Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Product Details Modal */}
            {showDetailsModal && selectedProduct && (
                <div className="product-modal-overlay" onClick={closeModal}>
                    <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>✕</button>
                        
                        <div className="modal-header">
                            <h2>Product Details</h2>
                            <div className={`modal-status-badge ${getProductStatus(selectedProduct)}`}>
                                {getStatusConfig(getProductStatus(selectedProduct)).icon} 
                                {getStatusConfig(getProductStatus(selectedProduct)).label}
                            </div>
                        </div>
                        
                        <div className="modal-body">
                            <div className="modal-left">
                                <div className="product-gallery">
                                    <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-main-image" />
                                    {selectedProduct.images && selectedProduct.images.length > 0 && (
                                        <div className="modal-thumbnails">
                                            {selectedProduct.images.slice(0, 4).map((img, idx) => (
                                                <img key={idx} src={img} alt={`View ${idx + 1}`} className="modal-thumbnail" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="modal-right">
                                <div className="detail-section">
                                    <h3>Basic Information</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">Product Name:</span>
                                        <span className="detail-value">{selectedProduct.name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Category:</span>
                                        <span className="detail-value">{selectedProduct.category}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Brand:</span>
                                        <span className="detail-value">{selectedProduct.brand || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Product ID:</span>
                                        <span className="detail-value">#{selectedProduct.id}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Added Date:</span>
                                        <span className="detail-value">{new Date(selectedProduct.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h3>Pricing & Stock</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">Original Price:</span>
                                        <span className="detail-value">₹{selectedProduct.price}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Discount:</span>
                                        <span className="detail-value">{selectedProduct.discount || 0}%</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Final Price:</span>
                                        <span className="detail-value highlight">₹{selectedProduct.new_price || selectedProduct.price}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Stock:</span>
                                        <span className={`detail-value ${selectedProduct.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                                            {selectedProduct.stock || 0} units
                                        </span>
                                    </div>
                                    {selectedProduct.sizeStocks && (
                                        <div className="detail-row">
                                            <span className="detail-label">Size Stock:</span>
                                            <div className="size-stock-list">
                                                {Object.entries(selectedProduct.sizeStocks).map(([size, stock]) => (
                                                    <span key={size} className="size-stock-badge">{size}: {stock}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="detail-section">
                                    <h3>Specifications</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">Color:</span>
                                        <span className="detail-value">{selectedProduct.color || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Material:</span>
                                        <span className="detail-value">{selectedProduct.material || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Fit:</span>
                                        <span className="detail-value">{selectedProduct.fit || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Sizes:</span>
                                        <div className="sizes-list">
                                            {selectedProduct.sizes && selectedProduct.sizes.length > 0 ? (
                                                selectedProduct.sizes.map(size => (
                                                    <span key={size} className="size-badge">{size}</span>
                                                ))
                                            ) : (
                                                <span>No sizes specified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedProduct.description && (
                                    <div className="detail-section">
                                        <h3>Description</h3>
                                        <p className="product-description">{selectedProduct.description}</p>
                                    </div>
                                )}
                                
                                {selectedProduct.tags && (
                                    <div className="detail-section">
                                        <h3>Tags</h3>
                                        <div className="tags-list">
                                            {selectedProduct.tags.split(',').map((tag, idx) => (
                                                <span key={idx} className="tag-badge">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="modal-actions">
                                    <button className="modal-edit-btn" onClick={() => {
                                        closeModal();
                                        onEdit(selectedProduct);
                                    }}>
                                         Edit Product
                                    </button>
                                    <button className="modal-delete-btn" onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete "${selectedProduct.name}"?`)) {
                                            onDelete(selectedProduct.id, selectedProduct.name);
                                            closeModal();
                                        }
                                    }}>
                                         Delete Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageProducts;