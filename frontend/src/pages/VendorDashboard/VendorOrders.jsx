import React, { useState } from 'react';
import './VendorOrders.css';

const VendorOrders = ({
    orders,
    onSelectOrder,
    onUpdateOrderStatus,
    exportData
}) => {
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        return order.status === statusFilter;
    });

    return (
        <div className="vendor-card">
            <div className="card-header">
                <h2>Recent Orders ({orders.length})</h2>
                <div className="order-filters">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Orders</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        
                    </select>
                    <button className="export-btn" onClick={() => exportData('orders')}>
                        📈 Export
                    </button>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="vendor-empty">
                    <span className="empty-icon">📭</span>
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            {order.userName || order.address?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td>{order.products?.length || 0} items</td>
                                    <td className="amount">
                                        ₹{order.products?.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0) || 0}
                                    </td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td>
                                        <select 
                                            value={order.status || 'Processing'}
                                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                            className={`status-select status-${(order.status || 'Processing').toLowerCase()}`}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            
                                        </select>
                                    </td>
                                    <td>
                                        <button 
                                            className="view-details-btn"
                                            onClick={() => onSelectOrder(order)}
                                        >
                                             View
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

export default VendorOrders;
