import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ stats, analytics, users, products }) => {
    const [topViewedProducts, setTopViewedProducts] = useState([]);
    const [topCartProducts, setTopCartProducts] = useState([]);
    const [cartStats, setCartStats] = useState({});
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                if (!token) {
                    console.warn('No auth token found');
                    return;
                }

                const viewedRes = await fetch('https://fashion-ecommerce-ak78.onrender.com/admin/analytics/top-viewed-products', {
                    headers: { 'auth-token': token }
                });
                const viewedData = await viewedRes.json();
                setTopViewedProducts(viewedData.data || []);

                const cartRes = await fetch('https://fashion-ecommerce-ak78.onrender.com/admin/analytics/top-cart-products', {
                    headers: { 'auth-token': token }
                });
                const cartData = await cartRes.json();
                setTopCartProducts(cartData.data || []);

                const statsRes = await fetch('https://fashion-ecommerce-ak78.onrender.com/admin/analytics/cart-stats', {
                    headers: { 'auth-token': token }
                });
                const statsData = await statsRes.json();
                setCartStats(statsData.data || {});

                const wishlistRes = await fetch('https://fashion-ecommerce-ak78.onrender.com/admin/analytics/wishlist', {
                    headers: { 'auth-token': token }
                });
                const wishlistData = await wishlistRes.json();
                setWishlistProducts(wishlistData.data ? wishlistData.data.slice(0, 5) : []);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const recentUsers = (users || [])
        .filter(u => u && u.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const recentProducts = (products || [])
        .filter(p => p && (p.createdAt || p.date))
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 8);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'vendor': return 'Vendor';
            default: return 'Customer';
        }
    };

    return (
        <div className="dashboard">
            {/* Analytics Section */}
            <div className="analytics-section">
                <h2>Platform Analytics</h2>
                <div className="analytics-grid">
<div className="analytics-card">
    <div className="analytics-info">
        <h3>Total Revenue</h3>
        <p>₹{stats.totalRevenue?.toLocaleString() || 0}</p>

    </div>
</div>

<div className="analytics-card">
    <div className="analytics-info">
        <h3>Avg Order Value</h3>
        <p>₹{Math.round(analytics.avgOrderValue || 0).toLocaleString()}</p>

    </div>
</div>

<div className="analytics-card">
    <div className="analytics-info">
        <h3>Top Product</h3>
        <p>{analytics.topProduct?.name || 'N/A'}</p>
        <span className="trend">
            {analytics.topProduct?.sales || 0} units sold
        </span>
    </div>
</div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-breakdown">
                        <span>Customers {stats.customers || 0}</span>
                        <span>Vendors {stats.vendors || 0}</span>
                        <span>Admins {stats.admins || 0}</span>
                    </div>
                </div>
                <div className={`stat-card ${stats.pendingCount > 0 ? 'highlight' : ''}`}>
                    <div className="stat-value">{stats.pendingCount || 0}</div>
                    <div className="stat-label">Pending Approvals</div>
                    {stats.pendingCount > 0 && <div className="stat-warning">Action Required</div>}
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalProducts || 0}</div>
                    <div className="stat-label">Approved Products</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalOrders || 0}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>

            {/* Recent Activities Section */}
            <div className="recent-activities">
                <h2>Recent Activities</h2>
                <div className="activities-grid">
                    {/* Recent Users */}
                    <div className="activity-card">
                        <div className="activity-header">
                            <h3>New Users</h3>
                            <span className="badge">{recentUsers.length}</span>
                        </div>
                        <div className="activity-list">
                            {recentUsers.length > 0 ? (
                                recentUsers.map((user, idx) => (
                                    <div key={idx} className="activity-item">
                                        <div className="item-content">
                                            <h4>{user.name}</h4>
                                            <p className="item-email">{user.email}</p>
                                            <div className="item-meta">
                                                <span className="role-badge">{getRoleText(user.role)}</span>
                                                <span className="time-badge">{formatDate(user.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No recent users</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Products */}
                    <div className="activity-card">
                        <div className="activity-header">
                            <h3>New Products</h3>
                            <span className="badge">{recentProducts.length}</span>
                        </div>
                        <div className="activity-list">
                            {recentProducts.length > 0 ? (
                                recentProducts.map((product, idx) => (
                                    <div key={idx} className="activity-item product-item">
                                        <div className="item-image">
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                        <div className="item-content">
                                            <h4>{(product.name || 'Unknown').substring(0, 30)}...</h4>
                                            <p className="item-vendor">by {product.vendorName || 'Admin'}</p>
                                            <div className="item-meta">
                                                <span className={`status-badge ${product.approved ? 'approved' : 'pending'}`}>
                                                    {product.approved ? 'Approved' : 'Pending'}
                                                </span>
                                                <span className="price-badge">₹{product.new_price || product.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No recent products</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Engagement Analytics Section */}
            <div className="engagement-section">
                <h2>Engagement Analytics</h2>
                <div className="engagement-grid">
                    {/* Most Viewed Products */}
                    <div className="engagement-card">
                        <div className="engagement-header">
                            <h3>Most Viewed</h3>
                            <span className="badge">{topViewedProducts.length}</span>
                        </div>
                        <div className="engagement-list">
                            {topViewedProducts.length > 0 ? (
                                topViewedProducts.map((product, idx) => (
                                    <div key={idx} className="engagement-item">
                                        <div className="engagement-rank">{idx + 1}</div>
                                        <div className="engagement-image">
                                            <img src={product.image} alt={product.productName} />
                                        </div>
                                        <div className="engagement-info">
                                            <h4>{(product.productName || 'Unknown').substring(0, 25)}...</h4>
                                            <p className="engagement-stat">{product.uniqueUsers || 0} unique viewers</p>
                                            <p className="engagement-time">Avg. {product.avgTimeSpent || 0}s per view</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No view data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Top Cart Products */}
                    <div className="engagement-card">
                        <div className="engagement-header">
                            <h3>Most Added to Cart</h3>
                            <span className="badge">{topCartProducts.length}</span>
                        </div>
                        <div className="engagement-list">
                            {topCartProducts.length > 0 ? (
                                topCartProducts.map((product, idx) => (
                                    <div key={idx} className="engagement-item">
                                        <div className="engagement-rank">{idx + 1}</div>
                                        <div className="engagement-image">
                                            <img src={product.image} alt={product.productName} />
                                        </div>
                                        <div className="engagement-info">
                                            <h4>{(product.productName || 'Unknown').substring(0, 25)}...</h4>
                                            <p className="engagement-stat">{product.timesAdded || 0} times added</p>
                                            <p className="engagement-users">{product.uniqueUsers || 0} customers interested</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No cart data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Top Wishlisted Products */}
                    <div className="engagement-card">
                        <div className="engagement-header">
                            <h3>Most Wishlisted</h3>
                            <span className="badge">{wishlistProducts.length}</span>
                        </div>
                        <div className="engagement-list">
                            {wishlistProducts.length > 0 ? (
                                wishlistProducts.map((product, idx) => (
                                    <div key={idx} className="engagement-item">
                                        <div className="engagement-rank">{idx + 1}</div>
                                        <div className="engagement-image">
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                        <div className="engagement-info">
                                            <h4>{(product.name || 'Unknown').substring(0, 25)}...</h4>
                                            <p className="engagement-stat">{product.wishlistCount || 0} wishlists</p>
                                            <p className="engagement-price">₹{product.new_price || product.price}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No wishlist data yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart Statistics Section */}
            <div className="cart-stats-section">
                <h2>Cart & Behavior Analytics</h2>
                <div className="cart-stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{cartStats.totalAdditions || 0}</div>
                        <div className="stat-label">Total Additions</div>
                        <div className="stat-detail">Products added to cart</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{cartStats.totalBooked || 0}</div>
                        <div className="stat-label">Products Purchased</div>
                        <div className="stat-detail">Actually bought items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{cartStats.totalRemovals || 0}</div>
                        <div className="stat-label">Total Removals</div>
                        <div className="stat-detail">Products removed from cart</div>
                    </div>
                    <div className={`stat-card ${(cartStats.cartsAbandonmentRate || 0) > 30 ? 'warning' : ''}`}>
                        <div className="stat-value">{cartStats.cartsAbandonmentRate || 0}%</div>
                        <div className="stat-label">Abandonment Rate</div>
                        <div className="stat-detail">Products not purchased</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{cartStats.avgItemsPerCart || 0}</div>
                        <div className="stat-label">Avg Items per Cart</div>
                        <div className="stat-detail">Average cart size</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;