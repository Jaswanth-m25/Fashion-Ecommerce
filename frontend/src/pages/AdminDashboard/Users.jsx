import React, { useState } from 'react';
import './Users.css';

const Users = ({ filteredUsers, loading, searchTerm, setSearchTerm, filterRole, setFilterRole, getRoleBadgeClass, handleDeleteUser, handleRoleChange, orders = [], products = [] }) => {
    const [viewingUser, setViewingUser] = useState(null);

    const getUserOrders = (userId) => {
        return orders.filter(order => order.userId === userId);
    };

    const getVendorProducts = (vendorId) => {
        return products.filter(product => product.vendorId === vendorId);
    };

    return (
        <div className="admin-card">
            <div className="card-header">
                <h2>User Management</h2>
                <div className="filter-controls">
                    <input
                        type="text"
                        placeholder=" Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="vendor">Vendors</option>
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="admin-empty">
                    <span className="empty-icon">👥</span>
                    <p>No users found.</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="user-name">{user.name || 'N/A'}</td>
                                    <td className="user-email">{user.email}</td>
                                    <td>
                                        <select
                                            className={getRoleBadgeClass(user.role)}
                                            value={user.role || 'customer'}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="vendor">Vendor</option>
                                            
                                        </select>
                                    </td>
                                    <td className="user-date">
                                        {user.date ? new Date(user.date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>
                                        <span className="user-status active">Active</span>
                                    </td>
                                    <td>
                                        <div className="user-actions">
                                            <button
                                                className="admin-view-btn"
                                                onClick={() => setViewingUser(user)}
                                                title={user.role === 'vendor' ? 'View products' : 'View orders'}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="admin-delete-btn"
                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View User Details Modal */}
            {viewingUser && (
                <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setViewingUser(null)}>✕</button>
                        
                        {viewingUser.role === 'vendor' ? (
                            // Vendor Products View
                            <div className="view-content">
                                <div className="view-header">
                                    <h2>Products by {viewingUser.name}</h2>
                                    <span className="vendor-badge"> Vendor</span>
                                </div>
                                <div className="view-info">
                                    <p><strong>Name:</strong> {viewingUser.name}</p>
                                    <p><strong>Email:</strong> {viewingUser.email}</p>
                                </div>
                                
                                {getVendorProducts(viewingUser._id).length === 0 ? (
                                    <div className="view-empty">
                                        <span className="empty-icon"></span>
                                        <p>No products from this vendor.</p>
                                    </div>
                                ) : (
                                    <div className="view-grid">
                                        {getVendorProducts(viewingUser._id).map((product) => (
                                            <div key={product.id} className="view-item product-item">
                                                <img src={product.image} alt={product.name} />
                                                <div className="item-details">
                                                    <h4>{product.name}</h4>
                                                    <p className="item-category">{product.category}</p>
                                                    <p className="item-price">₹{product.new_price || product.price}</p>
                                                    <span className={`item-status ${product.approved ? 'approved' : 'pending'}`}>
                                                        {product.approved ? ' Approved' : ' Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Customer Orders View
                            <div className="view-content">
                                <div className="view-header">
                                    <h2>Orders by {viewingUser.name}</h2>
                                    <span className="customer-badge">👤 Customer</span>
                                </div>
                                <div className="view-info">
                                    <p><strong>Name:</strong> {viewingUser.name}</p>
                                    <p><strong>Email:</strong> {viewingUser.email}</p>
                                </div>

                                {getUserOrders(viewingUser._id).length === 0 ? (
                                    <div className="view-empty">
                                        <span className="empty-icon">🛒</span>
                                        <p>No orders from this customer.</p>
                                    </div>
                                ) : (
                                    <div className="view-list">
                                        {getUserOrders(viewingUser._id).map((order) => (
                                            <div key={order.id} className="view-item order-item">
                                                <div className="order-header-row">
                                                    <div className="order-id-section">
                                                        <h4>Order #{order.id}</h4>
                                                        <span className={`order-status-badge ${order.status?.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="order-amount">₹{order.totalAmount}</div>
                                                </div>
                                                <div className="order-meta">
                                                    <span> {new Date(order.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="order-products">
                                                    {order.products?.map((product, idx) => (
                                                        <div key={idx} className="product-row">
                                                            <img src={product.image} alt={product.name} />
                                                            <div className="product-info">
                                                                <span className="product-name">{product.name}</span>
                                                                <span className="product-qty">Qty: {product.quantity}</span>
                                                            </div>
                                                            <span className="product-total">₹{product.price * product.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
