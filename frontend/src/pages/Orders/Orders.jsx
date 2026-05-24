import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Orders.css';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingModal, setTrackingModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                navigate('/LoginSignup');
                return;
            }

            try {
                const response = await fetch('https://fashion-ecommerce-ak78.onrender.com/customer/orders', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'auth-token': token,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                if (Array.isArray(data)) {
                    setOrders(data.reverse()); // Show latest orders first
                } else {
                    console.error('Failed to fetch orders:', data);
                    setOrders([]);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' };
            case 'Shipped': return { bg: '#e3f2fd', text: '#1565c0', border: '#64b5f6' };
            case 'Delivered': return { bg: '#e8f5e9', text: '#2e7d32', border: '#81c784' };
            case 'Cancelled': return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
            default: return { bg: '#f5f5f5', text: '#616161', border: '#bdbdbd' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Processing': return '⏳';
            case 'Shipped': return '📦';
            case 'Delivered': return '✅';
            case 'Cancelled': return '❌';
            default: return '📋';
        }
    };

    const getProgressSteps = (status) => {
        const steps = [
            { name: 'Order Placed', status: 'completed', icon: '✓' },
            { name: 'Processing', status: status === 'Processing' ? 'current' : status === 'Shipped' || status === 'Delivered' ? 'completed' : 'pending', icon: '⏳' },
            { name: 'Shipped', status: status === 'Shipped' ? 'current' : status === 'Delivered' ? 'completed' : 'pending', icon: '📦' },
            { name: 'Delivered', status: status === 'Delivered' ? 'completed' : 'pending', icon: '✅' }
        ];
        
        if (status === 'Cancelled') {
            return [{ name: 'Order Cancelled', status: 'cancelled', icon: '❌' }];
        }
        return steps;
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = order.id.toString().includes(searchTerm) || 
                            order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const getStats = () => {
        const totalOrders = orders.length;
        const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'Processing').length;
        return { totalOrders, deliveredOrders, totalSpent, pendingOrders };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="orders-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="orders-container">
                {/* Header Section */}
                <div className="orders-header">
                    <div className="header-content">
                        <h1>📦 My Orders</h1>
                        <p>Track and manage all your purchases in one place</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-card-mini">
                            <span className="stat-value">{stats.totalOrders}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <div className="stat-card-mini">
                            <span className="stat-value">₹{stats.totalSpent.toLocaleString()}</span>
                            <span className="stat-label">Total Spent</span>
                        </div>
                        <div className="stat-card-mini">
                            <span className="stat-value">{stats.deliveredOrders}</span>
                            <span className="stat-label">Delivered</span>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="orders-filters">
                    <div className="filter-group">
                        <input
                            type="text"
                            placeholder="🔍 Search by Order ID or Product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Orders</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    <div className="filter-results">
                        <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📭</div>
                        <h2>No Orders Found</h2>
                        {searchTerm || filterStatus !== 'all' ? (
                            <>
                                <p>No orders match your filters. Try adjusting your search criteria.</p>
                                <button 
                                    className="clear-filters-btn"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </>
                        ) : (
                            <>
                                <p>You haven't placed any orders yet. Start shopping now!</p>
                                <button 
                                    className="shop-btn"
                                    onClick={() => navigate('/')}
                                >
                                    Continue Shopping
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                {/* Order Header */}
                                <div 
                                    className="order-header-card"
                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                >
                                    <div className="order-main-info">
                                        <div className="order-id-section">
                                            <span className="order-label">Order ID</span>
                                            <span className="order-value">#{order.id}</span>
                                        </div>
                                        <div className="order-date-section">
                                            <span className="order-label">Date</span>
                                            <span className="order-value">
                                                {new Date(order.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="order-items-count">
                                            <span className="order-label">Items</span>
                                            <span className="order-value">{order.products.length}</span>
                                        </div>
                                        <div className="order-total-section">
                                            <span className="order-label">Total</span>
                                            <span className="order-value amount">₹{order.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="order-status-section">
                                        <div 
                                            className="status-badge"
                                            style={{ 
                                                backgroundColor: getStatusColor(order.status).bg,
                                                color: getStatusColor(order.status).text,
                                                borderColor: getStatusColor(order.status).border
                                            }}
                                        >
                                            {getStatusIcon(order.status)} {order.status}
                                        </div>
                                    </div>

                                    <div className="expand-icon">
                                        {expandedOrderId === order.id ? '▲' : '▼'}
                                    </div>
                                </div>

                                {/* Order Details (Expanded) */}
                                {expandedOrderId === order.id && (
                                    <div className="order-details">
                                        {/* Progress Tracker */}
                                        <div className="order-progress">
                                            <div className="progress-steps">
                                                {getProgressSteps(order.status).map((step, idx) => (
                                                    <div key={idx} className={`progress-step ${step.status}`}>
                                                        <div className={`step-icon ${step.status}`}>
                                                            {step.icon}
                                                        </div>
                                                        <div className="step-name">{step.name}</div>
                                                        {idx < getProgressSteps(order.status).length - 1 && (
                                                            <div className={`step-line ${step.status === 'completed' ? 'completed' : ''}`}></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="order-items-section">
                                            <h3>Order Items</h3>
                                            <div className="items-table">
                                                <div className="items-header">
                                                    <div>Product</div>
                                                    <div>Price</div>
                                                    <div>Quantity</div>
                                                    <div>Total</div>
                                                </div>
                                                {order.products.map((product, idx) => (
                                                    <div key={idx} className="item-row">
                                                        <div className="item-product">
                                                            <img 
                                                                src={product.image || 'https://via.placeholder.com/60'} 
                                                                alt={product.name}
                                                                className="item-image"
                                                                onClick={() => navigate(`/product/${product.id}`)}
                                                            />
                                                            <div className="item-info">
                                                                <h4>{product.name}</h4>
                                                                <div className="item-meta">
                                                                    {product.size && (
                                                                        <span className="size-badge">Size: {product.size}</span>
                                                                    )}
                                                                    {product.vendorName && (
                                                                        <span className="vendor-name">Seller: {product.vendorName}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="item-price">₹{product.price}</div>
                                                        <div className="item-quantity">x{product.quantity}</div>
                                                        <div className="item-total">₹{product.price * product.quantity}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Summary & Address */}
                                        <div className="order-info-grid">
                                            <div className="order-summary-card">
                                                <h3>Order Summary</h3>
                                                <div className="summary-details">
                                                    <div className="summary-row">
                                                        <span>Subtotal</span>
                                                        <span>₹{order.totalAmount}</span>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>Shipping</span>
                                                        <span className="free-shipping">Free</span>
                                                    </div>
                                                    <div className="summary-row total">
                                                        <span>Total Amount</span>
                                                        <span>₹{order.totalAmount}</span>
                                                    </div>
                                                </div>
                                                {order.paymentMethod && (
                                                    <div className="payment-method">
                                                        <span>Payment Method:</span>
                                                        <strong>{order.paymentMethod}</strong>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="shipping-address-card">
                                                <h3>Shipping Address</h3>
                                                <div className="address-details">
                                                    <p className="address-name">{order.address?.name || 'Customer'}</p>
                                                    <p className="address-line">{order.address?.address}</p>
                                                    <p className="address-location">
                                                        {order.address?.city}, {order.address?.state} - {order.address?.zip}
                                                    </p>
                                                    {order.address?.phone && (
                                                        <p className="address-phone">📞 {order.address.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="order-actions-section">


                                            {order.status === 'Delivered' && (
                                                <button 
                                                    className="action-btn reorder-btn"
                                                    onClick={() => {
                                                        // Add reorder functionality
                                                        alert('Reorder feature coming soon!');
                                                    }}
                                                >
                                                    🔄 Buy Again
                                                </button>
                                            )}

                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tracking Modal */}
            {trackingModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setTrackingModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setTrackingModal(false)}>✕</button>
                        <h2>Track Order #{selectedOrder.id}</h2>
                        <div className="tracking-progress">
                            <div className="tracking-steps">
                                <div className={`tracking-step ${selectedOrder.status !== 'Cancelled' ? 'completed' : ''}`}>
                                    <div className="tracking-dot"></div>
                                    <div className="tracking-label">Order Placed</div>
                                    <div className="tracking-date">{new Date(selectedOrder.date).toLocaleDateString()}</div>
                                </div>
                                <div className={`tracking-step ${selectedOrder.status === 'Processing' ? 'active' : selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                                    <div className="tracking-dot"></div>
                                    <div className="tracking-label">Processing</div>
                                </div>
                                <div className={`tracking-step ${selectedOrder.status === 'Shipped' ? 'active' : selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                                    <div className="tracking-dot"></div>
                                    <div className="tracking-label">Shipped</div>
                                </div>
                                <div className={`tracking-step ${selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                                    <div className="tracking-dot"></div>
                                    <div className="tracking-label">Delivered</div>
                                </div>
                            </div>
                        </div>
                        <div className="tracking-info">
                            <p>Your order is currently being processed. You will receive updates via email.</p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Orders;