import React from 'react';
import './Orders.css';

const Orders = ({ orders, searchTerm, setSearchTerm, updateOrderStatus, setSelectedOrder }) => {
    return (
        <div className="admin-card">
            <div className="card-header">
                <h2>Order Management</h2>
                <div className="filter-controls">
                    <input
                        type="text"
                        placeholder=" Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            {orders.length === 0 ? (
                <div className="admin-empty">
                    <span className="empty-icon">🛒</span>
                    <p>No orders placed yet.</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Products</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.filter(o => o.id?.toString().includes(searchTerm) || o.userName?.toLowerCase().includes(searchTerm.toLowerCase())).map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="customer-name">{order.userName}</div>
                                            <div className="customer-email">{order.userEmail}</div>
                                        </div>
                                    </td>
<td>
    <div className="order-product-list">
        {order.products?.slice(0, 2).map((product, index) => (
            <p key={index} className="order-product-name">
                {product.name}
            </p>
        ))}

        {order.products?.length > 2 && (
            <span className="order-product-more">
                +{order.products.length - 2} more
            </span>
        )}
    </div>
</td>
                                    <td className="order-amount">₹{order.totalAmount}</td>
                                    <td>
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`order-status-select ${order.status?.toLowerCase()}`}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            
                                        </select>
                                    </td>
                                    <td className="order-date">{new Date(order.date).toLocaleDateString()}</td>
                                    <td>
                                        <button className="view-details-btn" onClick={() => setSelectedOrder(order)}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
