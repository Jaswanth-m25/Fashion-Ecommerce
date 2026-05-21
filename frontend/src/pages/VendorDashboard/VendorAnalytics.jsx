import React from 'react';
import './VendorAnalytics.css';

const VendorAnalytics = ({
    analytics,
    products,
    orders,
    stats
}) => {
    return (
        <div className="vendor-card">
            <h2>Advanced Analytics</h2>
            <div className="analytics-details">
                <div className="stat-group">
                    <h3>Product Statistics</h3>
                    <div className="stat-row">
                        <span>Total Products:</span>
                        <strong>{products.length}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Approved Products:</span>
                        <strong>{stats.approvedCount}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Pending Review:</span>
                        <strong>{products.length - stats.approvedCount}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Average Discount:</span>
                        <strong>{stats.avgDiscount.toFixed(1)}%</strong>
                    </div>
                    <div className="stat-row">
                        <span>Total Inventory Value:</span>
                        <strong>₹{stats.totalValue.toLocaleString()}</strong>
                    </div>
                </div>
                <div className="stat-group">
                    <h3>Order Statistics</h3>
                    <div className="stat-row">
                        <span>Completed Orders:</span>
                        <strong>{orders.filter(o => o.status === 'Delivered').length}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Pending Orders:</span>
                        <strong>{orders.filter(o => o.status === 'Processing').length}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Shipped Orders:</span>
                        <strong>{orders.filter(o => o.status === 'Shipped').length}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Cancelled Orders:</span>
                        <strong>{orders.filter(o => o.status === 'Cancelled').length}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Total Revenue:</span>
                        <strong>₹{analytics.totalSales.toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAnalytics;
