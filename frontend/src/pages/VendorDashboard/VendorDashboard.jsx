import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendorDashboard.css';
import AddProduct from './AddProduct';
import ManageProducts from './ManageProducts';
import VendorOrders from './VendorOrders';
import VendorAnalytics from './VendorAnalytics';
import VendorProfile from './VendorProfile';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('add');
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        images: [],
        image: '',
        category: 'men',
        price: '',
        discount: '0',
        description: '',
        fit: '',
        material: '',
        color: '',
        sizes: [],
        stock: '',
        brand: '',
        tags: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    
    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    
    // Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    
    // Analytics State
    const [analytics, setAnalytics] = useState({
        totalSales: 0,
        totalOrders: 0,
        pendingApprovals: 0,
        lowStock: 0
    });
    
    // Notification State
    const [notification, setNotification] = useState(null);
    const [previousRemovedCount, setPreviousRemovedCount] = useState(0);
    const [previousRejectedCount, setPreviousRejectedCount] = useState(0);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    useEffect(() => {
        if (products.length > 0 || orders.length > 0) {
            calculateAnalytics();
        }
    }, [products, orders]);

    const calculateAnalytics = () => {
        const totalOrders = orders.length;
        const totalSales = orders.reduce((sum, order) => 
            sum + order.products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0), 0);
        const pendingApprovals = products.filter(p => !p.approved).length;
        const lowStock = products.filter(p => p.stock && parseInt(p.stock) < 10).length;
        
        setAnalytics({ totalSales, totalOrders, pendingApprovals, lowStock });
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) return;
            
            const res = await fetch('http://localhost:4000/vendorproducts', {
                headers: {
                    'auth-token': token,
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
                
                // Check for products removed by admin
                const removedProducts = data.filter(p => p.removedByAdmin || p.status === 'removed');
                if (removedProducts.length > previousRemovedCount) {
                    const newlyRemovedCount = removedProducts.length - previousRemovedCount;
                    showNotification(
                        `⚠️ ${newlyRemovedCount} product(s) removed by admin. Check 'Removed' status for details.`,
                        'warning'
                    );
                    setPreviousRemovedCount(removedProducts.length);
                }

                // Check for products rejected by admin
                const rejectedProducts = data.filter(p => p.rejectedByAdmin || p.status === 'rejected');
                if (rejectedProducts.length > previousRejectedCount) {
                    const newlyRejectedCount = rejectedProducts.length - previousRejectedCount;
                    showNotification(
                        `❌ ${newlyRejectedCount} product(s) rejected by admin. Check 'Rejected' status for details.`,
                        'error'
                    );
                    setPreviousRejectedCount(rejectedProducts.length);
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Failed to fetch products', 'error');
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) return;
            
            const res = await fetch('http://localhost:4000/vendor/orders', {
                headers: {
                    'auth-token': token,
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('Failed to fetch orders', 'error');
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch('http://localhost:4000/updateorderstatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchOrders();
                showNotification('Order status updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            showNotification('Failed to update order status', 'error');
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImageUpload = async () => {
        if (!imageFiles.length) {
            return [];
        }

        const uploadedImages = [];

        try {
            for (const file of imageFiles) {
                const formDataObj = new FormData();
                formDataObj.append('product', file);

                const res = await fetch('http://localhost:4000/upload', {
                    method: 'POST',
                    body: formDataObj,
                });

                const data = await res.json();
                if (data.success) {
                   uploadedImages.push(...data.image_urls);
                }
            }

            return uploadedImages;
        } catch (error) {
            console.error('Error uploading images:', error);
            return uploadedImages;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            showNotification('Please enter product name', 'error');
            return;
        }
        
        if (!formData.price || formData.price <= 0) {
            showNotification('Please enter a valid price', 'error');
            return;
        }
        
        if (!imageFiles.length && !formData.images.length && !formData.image) {
            showNotification('Please upload at least one product image', 'error');
            return;
        }
        
        setLoading(true);
        
        // Handle removed images during edit
        let currentImages = formData.images || [];
        if (editingId && formData.removedImages && formData.removedImages.length > 0) {
            currentImages = currentImages.filter(img => !formData.removedImages.includes(img));
        }
        
        let imageUrls = await handleImageUpload();
        
        // Combine existing images with newly uploaded images
        const allImages = [...currentImages, ...imageUrls];
        
        if (!allImages || allImages.length === 0) {
            showNotification('Please provide at least one product image', 'error');
            setLoading(false);
            return;
        }

        const url = editingId ? 'http://localhost:4000/vendorupdateproduct' : 'http://localhost:4000/vendoraddproduct';
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ 
                    ...formData, 
                    images: allImages,
                    image: allImages[0],
                    id: editingId,
                    price: parseFloat(formData.price),
                    discount: parseFloat(formData.discount) || 0
                }),
            });
            
            const data = await res.json();
            if (data.success) {
                showNotification(`Product "${data.name}" ${editingId ? 'updated' : 'added'} successfully!`, 'success');
                setFormData({ 
                    name: '', images: [], image: '', category: 'men', price: '', discount: '0', 
                    description: '', fit: '', material: '', color: '', sizes: [], 
                    stock: '', brand: '', tags: '' 
                });
                setEditingId(null);
                setImageFiles([]);
                setPreviewImages([]);
                await fetchProducts();
                if (editingId) setActiveTab('manage');
            } else {
                showNotification(data.errors || 'Action failed', 'error');
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            showNotification('Failed to save product', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id, name) => {
        if (!window.confirm(`Remove product "${name}"? This action cannot be undone.`)) return;
        
        try {
            const res = await fetch('http://localhost:4000/vendorremoveproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ id, name }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`Product "${name}" removed successfully`, 'success');
                await fetchProducts();
            }
        } catch (error) {
            console.error('Error removing product:', error);
            showNotification('Failed to remove product', 'error');
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name || '',
            image: product.image || '',
            images: product.images || [],
            category: product.category || 'men',
            price: product.price || '',
            discount: product.discount || '0',
            description: product.description || '',
            fit: product.fit || '',
            material: product.material || '',
            color: product.color || '',
            sizes: product.sizes || [],
            stock: product.stock || '',
            brand: product.brand || '',
            tags: product.tags || '',
            sizeStocks: product.sizeStocks || {}
        });
        setActiveTab('add');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const isRemoved = product.removedByAdmin || product.status === 'removed';
        const isRejected = product.rejectedByAdmin || product.status === 'rejected';
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'approved' && product.approved && !isRemoved && !isRejected) ||
            (statusFilter === 'pending' && !product.approved && !isRemoved && !isRejected) ||
            (statusFilter === 'removed' && isRemoved) ||
            (statusFilter === 'rejected' && isRejected);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const exportData = (type) => {
        let data = [];
        let filename = '';
        
        if (type === 'products') {
            data = products.map(p => ({
                ID: p.id,
                Name: p.name,
                Category: p.category,
                Price: p.price,
                Discount: p.discount,
                'Final Price': p.new_price,
                Stock: p.stock,
                Status: p.approved ? 'Approved' : 'Pending'
            }));
            filename = 'my_products.csv';
        } else if (type === 'orders') {
            data = orders.map(o => ({
                'Order ID': o.id,
                Date: new Date(o.date).toLocaleDateString(),
                Status: o.status,
                'Total Amount': o.products.reduce((acc, p) => acc + (p.price * p.quantity), 0),
                Customer: o.address?.name || 'N/A'
            }));
            filename = 'my_orders.csv';
        }
        
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification(`Exported ${type} successfully!`, 'success');
    };

    const convertToCSV = (data) => {
        if (!data.length) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                return `"${String(val || '').replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };

    const getStats = () => {
        const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
        const avgDiscount = products.reduce((sum, p) => sum + (parseFloat(p.discount) || 0), 0) / (products.length || 1);
        const approvedCount = products.filter(p => p.approved).length;
        return { totalValue, avgDiscount, approvedCount };
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('userEmail');
            navigate('/loginSignup');
        }
    };

    const stats = getStats();

    return (
        <div>
            {/* Vendor Navbar */}
            <nav className="vendor-navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        
                        <h1>Vendor Panel</h1>
                    </div>
                    <div className="navbar-menu">
                        <button
                            className={`navbar-item ${activeTab === 'add' ? 'active' : ''}`}
                            onClick={() => setActiveTab('add')}
                        >
                           
                            <span className="menu-text">Add Product</span>
                        </button>
                        <button
                            className={`navbar-item ${activeTab === 'manage' ? 'active' : ''}`}
                            onClick={() => setActiveTab('manage')}
                        >
                            
                            <span className="menu-text">All Products</span>
                            <span className="badge">{filteredProducts.length}</span>
                        </button>
                        <button
                            className={`navbar-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            
                            <span className="menu-text">Orders</span>
                            <span className="badge">{orders.length}</span>
                        </button>
                        <button
                            className={`navbar-item ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            
                            <span className="menu-text">Analytics</span>
                        </button>
                        <button
                            className={`navbar-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            
                            <span className="menu-text">Profile</span>
                        </button>
                    </div>
                    <div className="navbar-actions">
                        <button className="logout-btn" onClick={handleLogout}>
                             Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="vendor-dashboard">
                {/* Notification */}
                {notification && (
                    <div className={`notification-toast ${notification.type}`}>
                        <span className="notification-icon">
                            {notification.type === 'success' ? '✅' : '❌'}
                        </span>
                        <span className="notification-message">{notification.message}</span>
                    </div>
                )}

                {/* Analytics Cards */}
                <div className="analytics-grid">
                    <div className="analytics-card">
                        <div className="analytics-icon"></div>
                        <div className="analytics-info">
                            <h3>Total Sales</h3>
                            <p>₹{analytics.totalSales.toLocaleString()}</p>
                            
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="analytics-icon">📦</div>
                        <div className="analytics-info">
                            <h3>Total Orders</h3>
                            <p>{analytics.totalOrders}</p>
                            <span className="trend up">+{analytics.totalOrders} new</span>
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="analytics-icon">⏳</div>
                        <div className="analytics-info">
                            <h3>Pending Approvals</h3>
                            <p>{analytics.pendingApprovals}</p>
                        </div>
                    </div>
                   
                </div>

                {/* Tab Content */}
                {activeTab === 'add' && (
                    <AddProduct
                        formData={formData}
                        setFormData={setFormData}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        loading={loading}
                        onSubmit={handleSubmit}
                        showNotification={showNotification}
                        previewImages={previewImages}
                        setPreviewImages={setPreviewImages}
                        imageFiles={imageFiles}
                        setImageFiles={setImageFiles}
                    />
                )}

                {activeTab === 'manage' && (
                    <ManageProducts
                        filteredProducts={filteredProducts}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        onEdit={handleEdit}
                        onDelete={handleRemove}
                        onSelectProduct={setSelectedProduct}
                        exportData={exportData}
                    />
                )}

                {activeTab === 'orders' && (
                    <VendorOrders
                        orders={orders}
                        onSelectOrder={setSelectedBooking}
                        onUpdateOrderStatus={updateOrderStatus}
                        exportData={exportData}
                    />
                )}

                {activeTab === 'analytics' && (
                    <VendorAnalytics
                        analytics={analytics}
                        products={products}
                        orders={orders}
                        stats={stats}
                    />
                )}

                {activeTab === 'profile' && (
                    <VendorProfile />
                )}

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <div className="vendor-modal-overlay" onClick={() => setSelectedProduct(null)}>
                        <div className="vendor-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-modal" onClick={() => setSelectedProduct(null)}>✕</button>
                            <div className="modal-body">
                                <div className="modal-img-section">
                                    <img src={selectedProduct.image} alt={selectedProduct.name} />
                                    {selectedProduct.discount > 0 && (
                                        <div className="modal-discount-badge">-{selectedProduct.discount}%</div>
                                    )}
                                </div>
                                <div className="modal-info-section">
                                    <h2>{selectedProduct.name}</h2>
                                    <div className="modal-prices">
                                        <span className="modal-new-price">₹{selectedProduct.new_price || selectedProduct.price}</span>
                                        {selectedProduct.discount > 0 && (
                                            <span className="modal-old-price">₹{selectedProduct.price}</span>
                                        )}
                                    </div>
                                    <div className="modal-actions">
                                        <button 
                                            className="edit-btn-large" 
                                            onClick={() => {
                                                handleEdit(selectedProduct);
                                                setSelectedProduct(null);
                                            }}
                                        >
                                            ✏️ Edit Product
                                        </button>
                                        <button 
                                            className="remove-btn-large"
                                            onClick={() => {
                                                handleRemove(selectedProduct.id, selectedProduct.name);
                                                setSelectedProduct(null);
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details Modal */}
                {selectedBooking && (
                    <div className="vendor-modal-overlay" onClick={() => setSelectedBooking(null)}>
                        <div className="vendor-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-modal" onClick={() => setSelectedBooking(null)}>✕</button>
                            <div className="modal-details">
                                <div className="modal-header">
                                    <h2>Order Details</h2>
                                    <span className={`order-status ${selectedBooking.status?.toLowerCase() || 'processing'}`}>
                                        {selectedBooking.status || 'Processing'}
                                    </span>
                                </div>
                                <div className="details-grid">
                                    <div className="detail-section">
                                        <h4>Order Information</h4>
                                        <p><strong>Order ID:</strong> #{selectedBooking.id}</p>
                                        <p><strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="detail-section">
                                        <h4>Customer Information</h4>
                                        <p><strong>Name:</strong> {selectedBooking.userName || selectedBooking.address?.name || 'N/A'}</p>
                                        <p><strong>Email:</strong> {selectedBooking.userEmail || selectedBooking.address?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h4>Products</h4>
                                    {selectedBooking.products && selectedBooking.products.map((p, i) => (
                                        <div key={i} className="order-product-item">
                                            <img src={p.image} alt={p.name} />
                                            <div>
                                                <div className="product-name">{p.name}</div>
                                                <div className="product-meta">Quantity: {p.quantity}</div>
                                            </div>
                                            <div className="product-price">₹{(p.price || 0) * (p.quantity || 0)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
