import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './AdminDashboard.css';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import Dashboard from './Dashboard';
import PendingProducts from './PendingProducts';
import ApprovedProducts from './ApprovedProducts';
import Users from './Users';
import Orders from './Orders';
import AdminProfile from './AdminProfile';

const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        avgOrderValue: 0,
        topProduct: null,
        monthlySales: []
    });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        calculateAnalytics();
    }, [orders, products]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchUsers(),
            fetchProducts(),
            fetchPendingProducts(),
            fetchOrders()
        ]);
        setLoading(false);
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:4000/admin/orders', {
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (err) {
            console.error(err);
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
                showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
            }
        } catch (error) {
            showNotification('Failed to update order status', 'error');
        }
    };

    const updateProductVendor = async (productId, vendorId, vendorName) => {
        try {
            const res = await fetch('http://localhost:4000/admin/updateproductvendor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ productId, vendorId, vendorName }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchProducts();
                showNotification('Product vendor updated successfully', 'success');
            }
        } catch (error) {
            showNotification('Failed to update product vendor', 'error');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:4000/admin/allusers', {
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (err) {
            console.error(err);
            showNotification('Failed to fetch users', 'error');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:4000/admin/approvedproducts', {
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) setProducts(data);
        } catch (err) {
            console.error(err);
            showNotification('Failed to fetch products', 'error');
        }
    };

    const fetchPendingProducts = async () => {
        try {
            const res = await fetch('http://localhost:4000/admin/pendingproducts', {
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                },
            });
            const data = await res.json();
            if (Array.isArray(data)) setPendingProducts(data);
        } catch (err) {
            console.error(err);
            showNotification('Failed to fetch pending products', 'error');
        }
    };

    const handleApproveProduct = async (id, name) => {
        try {
            const res = await fetch('http://localhost:4000/admin/approveproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`Product "${name}" approved successfully!`, 'success');
                await fetchPendingProducts();
                await fetchProducts();
            }
        } catch (error) {
            showNotification('Failed to approve product', 'error');
        }
    };

    const handleRejectProduct = async (id, name) => {
        if (!window.confirm(`Reject and delete product "${name}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch('http://localhost:4000/admin/rejectproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`Product "${name}" rejected and removed`, 'success');
                await fetchPendingProducts();
                await fetchProducts();
            }
        } catch (error) {
            showNotification('Failed to reject product', 'error');
        }
    };

    const handleDeleteUser = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This will remove all their data and cannot be undone.`)) return;
        try {
            const res = await fetch('http://localhost:4000/admin/deleteuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`User "${name}" deleted successfully`, 'success');
                await fetchUsers();
            }
        } catch (error) {
            showNotification('Failed to delete user', 'error');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetch('http://localhost:4000/admin/updaterole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ userId, role: newRole }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`User role updated to ${newRole}`, 'success');
                await fetchUsers();
            }
        } catch (error) {
            showNotification('Failed to update user role', 'error');
        }
    };

    const handleRemoveProduct = async (id, name) => {
        if (!window.confirm(`Remove product "${name}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch('http://localhost:4000/admin/removeproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.success) {
                showNotification(`Product "${name}" removed successfully`, 'success');
                await fetchProducts();
            }
        } catch (error) {
            showNotification('Failed to remove product', 'error');
        }
    };

    const calculateAnalytics = () => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        // Find top product
        const productSales = {};
        orders.forEach(order => {
            order.products?.forEach(product => {
                productSales[product.name] = (productSales[product.name] || 0) + (product.quantity || 0);
            });
        });
        const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
        
        // Monthly sales calculation
        const monthlySales = {};
        orders.forEach(order => {
            const month = new Date(order.date).toLocaleString('default', { month: 'long' });
            monthlySales[month] = (monthlySales[month] || 0) + (order.totalAmount || 0);
        });
        
        setAnalytics({ totalRevenue, avgOrderValue, topProduct: topProduct ? { name: topProduct[0], sales: topProduct[1] } : null, monthlySales: Object.entries(monthlySales) });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'role-badge admin';
            case 'vendor': return 'role-badge vendor';
            default: return 'role-badge customer';
        }
    };



    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || (user.role || 'customer') === filterRole;
        return matchesSearch && matchesRole;
    });

    const approvedProducts = products;  // All fetched products are already approved and not removed
    const stats = {
        totalUsers: users.length,
        customers: users.filter(u => u.role === 'customer' || !u.role).length,
        vendors: users.filter(u => u.role === 'vendor').length,
        admins: users.filter(u => u.role === 'admin').length,
        pendingCount: pendingProducts.length,
        totalProducts: approvedProducts.length,
        totalOrders: orders.length,
        totalRevenue: analytics.totalRevenue
    };

    return (
        <>
        <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="admin-dashboard">
            {/* Notification Toast */}
            {notification && (
                <div className={`notification-toast ${notification.type}`}>
                    <span className="notification-icon">
                        {notification.type === 'success' ? '✅' : '❌'}
                    </span>
                    <span className="notification-message">{notification.message}</span>
                </div>
            )}

            {/* Header */}

            {/* Analytics Section - Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <Dashboard stats={stats} analytics={analytics} users={users} products={products} />
            )}

            {/* Tabs - Now handled by AdminNavbar */}
            {/* Old tabs hidden */}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedProduct(null)}>✕</button>
                        <div className="modal-body">
                            <div className="modal-img-section">
                                <img src={selectedProduct.image} alt={selectedProduct.name} />
                                {selectedProduct.discount > 0 && (
                                    <div className="modal-discount-badge">-{selectedProduct.discount}%</div>
                                )}
                            </div>
                            <div className="modal-info-section">
                                <div className="modal-header-row">
                                    <span className="modal-category-tag">{selectedProduct.category}</span>
                                    <span className={`status-tag ${selectedProduct.approved ? 'status-approved' : 'status-pending'}`}>
                                        {selectedProduct.approved ? '✅ Approved' : '⏳ Pending'}
                                    </span>
                                </div>
                                <h2>{selectedProduct.name}</h2>
                                <div className="modal-prices">
                                    <span className="modal-new-price">₹{selectedProduct.new_price || selectedProduct.price}</span>
                                    {selectedProduct.discount > 0 && (
                                        <span className="modal-old-price">₹{selectedProduct.price}</span>
                                    )}
                                </div>
                                <div className="modal-description">
                                    <h3>Description</h3>
                                    <p>{selectedProduct.description || "No description provided."}</p>
                                </div>
                                <div className="modal-features-grid">
                                    {selectedProduct.brand && (
                                        <div className="feature-item">
                                            <strong>Brand:</strong> {selectedProduct.brand}
                                        </div>
                                    )}
                                    <div className="feature-item">
                                        <strong>Fit:</strong> {selectedProduct.fit || 'Standard'}
                                    </div>
                                    <div className="feature-item">
                                        <strong>Material:</strong> {selectedProduct.material || 'Cotton Mix'}
                                    </div>
                                    <div className="feature-item">
                                        <strong>Color:</strong> {selectedProduct.color || 'As shown'}
                                    </div>
                                    {selectedProduct.stock && (
                                        <div className="feature-item">
                                            <strong>Stock:</strong> {selectedProduct.stock} units
                                        </div>
                                    )}
                                </div>
                                <div className="modal-sizes">
                                    <h3>Available Sizes</h3>
                                    <div className="size-tags">
                                        {selectedProduct.sizes && selectedProduct.sizes.length > 0 
                                            ? selectedProduct.sizes.map(s => <span key={s}>{s}</span>)
                                            : <span>S, M, L, XL</span>}
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    {!selectedProduct.approved ? (
                                        <>
                                            <button 
                                                className="approve-btn-large" 
                                                onClick={() => {
                                                    handleApproveProduct(selectedProduct.id, selectedProduct.name);
                                                    setSelectedProduct(null);
                                                }}
                                            >
                                                ✅ Approve Product
                                            </button>
                                            <button 
                                                className="reject-btn-large"
                                                onClick={() => {
                                                    handleRejectProduct(selectedProduct.id, selectedProduct.name);
                                                    setSelectedProduct(null);
                                                }}
                                            >
                                                ❌ Reject Submission
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            className="remove-btn-large"
                                            onClick={() => {
                                                handleRemoveProduct(selectedProduct.id, selectedProduct.name);
                                                setSelectedProduct(null);
                                            }}
                                        >
                                            🗑️ Remove Product
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="admin-modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedOrder(null)}>✕</button>
                        <div className="order-detail-content">
                            <div className="order-header">
                                <h2>Order Details #{selectedOrder.id}</h2>
                                <span className={`order-status ${selectedOrder.status?.toLowerCase()}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <div className="order-info-grid">
                                <div className="info-group">
                                    <h4>Customer Information</h4>
                                    <p><strong>Name:</strong> {selectedOrder.userName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                                </div>
                                <div className="info-group">
                                    <h4>Order Information</h4>
                                    <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {new Date(selectedOrder.date).toLocaleTimeString()}</p>
                                    <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                                </div>
                                <div className="info-group">
                                    <h4>Shipping Address</h4>
                                    <p>{selectedOrder.address?.address}</p>
                                    <p>{selectedOrder.address?.city}, {selectedOrder.address?.zip}</p>
                                </div>
                            </div>
                            <div className="order-products-list">
                                <h3>Products Ordered</h3>
                                {selectedOrder.products?.map((product, idx) => (
                                    <div key={idx} className="order-product-item">
                                        <img src={product.image} alt={product.name} />
                                        <div className="product-details">
                                            <div className="product-name">{product.name}</div>
                                            <div className="product-meta">Quantity: {product.quantity} | Vendor: {product.vendorName || 'Admin'}</div>
                                        </div>
                                        <div className="product-price">₹{product.price * product.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Products Tab */}
            {activeTab === 'pending' && (
                <PendingProducts 
                    pendingProducts={pendingProducts} 
                    setSelectedProduct={setSelectedProduct}
                    handleApproveProduct={handleApproveProduct}
                    handleRejectProduct={handleRejectProduct}
                />
            )}

            {/* Approved Products Tab */}
            {activeTab === 'products' && (
                <ApprovedProducts
                    approvedProducts={approvedProducts}
                    users={users}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setSelectedProduct={setSelectedProduct}
                    handleRemoveProduct={handleRemoveProduct}
                    updateProductVendor={updateProductVendor}
                />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <Users
                    filteredUsers={filteredUsers}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterRole={filterRole}
                    setFilterRole={setFilterRole}
                    getRoleBadgeClass={getRoleBadgeClass}
                    handleDeleteUser={handleDeleteUser}
                    handleRoleChange={handleRoleChange}
                    orders={orders}
                    products={products}
                />
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <Orders
                    orders={orders}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    updateOrderStatus={updateOrderStatus}
                    setSelectedOrder={setSelectedOrder}
                />
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <AdminProfile />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="admin-card">
                    <h2>Advanced Analytics</h2>
                    <div className="analytics-details">
                        <div className="stat-group">
                            <h3>Revenue Analytics</h3>
                            <div className="stat-row">
                                <span>Total Revenue:</span>
                                <strong>₹{stats.totalRevenue.toLocaleString()}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Average Order Value:</span>
                                <strong>₹{Math.round(analytics.avgOrderValue).toLocaleString()}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Total Orders:</span>
                                <strong>{stats.totalOrders}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Conversion Rate:</span>
                                <strong>{((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%</strong>
                            </div>
                        </div>
                        <div className="stat-group">
                            <h3>User Analytics</h3>
                            <div className="stat-row">
                                <span>Total Users:</span>
                                <strong>{stats.totalUsers}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Customers:</span>
                                <strong>{stats.customers}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Vendors:</span>
                                <strong>{stats.vendors}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Admins:</span>
                                <strong>{stats.admins}</strong>
                            </div>
                        </div>
                        <div className="stat-group">
                            <h3>Product Analytics</h3>
                            <div className="stat-row">
                                <span>Total Products:</span>
                                <strong>{stats.totalProducts}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Pending Approval:</span>
                                <strong>{stats.pendingCount}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Top Product:</span>
                                <strong>{analytics.topProduct?.name || 'N/A'}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Units Sold (Top):</span>
                                <strong>{analytics.topProduct?.sales || 0}</strong>
                            </div>
                        </div>
                    </div>
                    {analytics.monthlySales.length > 0 && (
                        <div className="monthly-sales">
                            <h3>Monthly Sales Breakdown</h3>
                            <div className="sales-bars">
                                {analytics.monthlySales.map(([month, amount]) => (
                                    <div key={month} className="sales-bar-item">
                                        <div className="sales-bar-label">{month}</div>
                                        <div className="sales-bar-container">
                                            <div className="sales-bar" style={{ width: `${(amount / stats.totalRevenue) * 100}%` }}></div>
                                        </div>
                                        <div className="sales-bar-value">₹{amount.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        </>
    );
};

export default AdminDashboard;
