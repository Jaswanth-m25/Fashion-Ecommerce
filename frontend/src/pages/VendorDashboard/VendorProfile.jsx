import React, { useState, useEffect } from 'react';
import './VendorProfile.css';

const VendorProfile = () => {
    const [vendorData, setVendorData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankIFSC: '',
        panNumber: '',
        gstNumber: '',
        businessType: '',
        yearsInBusiness: '',
        website: ''
    });

    useEffect(() => {
        fetchVendorProfile();
    }, []);

    const fetchVendorProfile = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                showNotification('No authentication token found', 'error');
                return;
            }

            const res = await fetch('https://fashion-ecommerce-ak78.onrender.com/vendor/vendor-profile', {
                headers: {
                    'auth-token': token,
                },
            });

            const data = await res.json();
            if (data.success || data._id) {
                setVendorData(data);
                setFormData({
                    storeName: data.storeName || '',
                    storeDescription: data.storeDescription || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    bankAccountName: data.bankAccountName || '',
                    bankAccountNumber: data.bankAccountNumber || '',
                    bankIFSC: data.bankIFSC || '',
                    panNumber: data.panNumber || '',
                    gstNumber: data.gstNumber || '',
                    businessType: data.businessType || '',
                    yearsInBusiness: data.yearsInBusiness || '',
                    website: data.website || ''
                });
            } else {
                showNotification('Failed to load vendor profile', 'error');
            }
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            showNotification('Error loading profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                showNotification('No authentication token found', 'error');
                return;
            }

            const res = await fetch('https://fashion-ecommerce-ak78.onrender.com/vendor/update-vendor-profile', {
                method: 'PUT',
                headers: {
                    'auth-token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success || res.ok) {
                setVendorData(prev => ({ ...prev, ...formData }));
                setIsEditing(false);
                showNotification('Profile updated successfully', 'success');
                fetchVendorProfile();
            } else {
                showNotification(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Error updating profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading && !vendorData) {
        return <div className="vendor-profile-loading">Loading profile...</div>;
    }

    return (
        <div className="vendor-profile-container">
            {notification && (
                <div className={`profile-notification ${notification.type}`}>
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="profile-header">
                <div className="profile-title">
                    <h2>Store Profile</h2>
                    <p>Manage your vendor store information</p>
                </div>
                <button 
                    className={`profile-edit-btn ${isEditing ? 'cancel' : ''}`}
                    onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-edit-form">
                    {/* Store Information Section */}
                    <div className="form-section">
                        <h3>Store Information</h3>
                        <div className="form-group">
                            <label>Store Name *</label>
                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your store name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Store Description</label>
                            <textarea
                                name="storeDescription"
                                value={formData.storeDescription}
                                onChange={handleInputChange}
                                placeholder="Describe your store"
                                rows="4"
                            />
                        </div>
                        <div className="form-group">
                            <label>Business Type</label>
                            <input
                                type="text"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleInputChange}
                                placeholder="e.g., Fashion, Electronics, etc."
                            />
                        </div>
                        <div className="form-group">
                            <label>Years in Business</label>
                            <input
                                type="number"
                                name="yearsInBusiness"
                                value={formData.yearsInBusiness}
                                onChange={handleInputChange}
                                placeholder="Enter number of years"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="form-section">
                        <h3>Contact Information</h3>
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Address *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your address"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter city"
                                />
                            </div>
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter state"
                                />
                            </div>
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter pincode"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Details Section */}
                    <div className="form-section">
                        <h3>Business Details</h3>
                        <div className="form-group">
                            <label>GST Number</label>
                            <input
                                type="text"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleInputChange}
                                placeholder="Enter GST number"
                            />
                        </div>
                        <div className="form-group">
                            <label>PAN Number</label>
                            <input
                                type="text"
                                name="panNumber"
                                value={formData.panNumber}
                                onChange={handleInputChange}
                                placeholder="Enter PAN number"
                            />
                        </div>
                    </div>

                    {/* Banking Information Section */}

                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="profile-view">
                    {/* Store Information Display */}
                    <div className="profile-section">
                        <h3>Store Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Store Name</label>
                                <p>{vendorData?.storeName || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Business Type</label>
                                <p>{vendorData?.businessType || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Years in Business</label>
                                <p>{vendorData?.yearsInBusiness || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Website</label>
                                <p>{vendorData?.website ? <a href={vendorData.website} target="_blank" rel="noopener noreferrer">{vendorData.website}</a> : 'N/A'}</p>
                            </div>
                            {vendorData?.storeDescription && (
                                <div className="info-item full-width">
                                    <label>Store Description</label>
                                    <p>{vendorData.storeDescription}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information Display */}
                    <div className="profile-section">
                        <h3>Contact Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Email</label>
                                <p>{vendorData?.email || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <p>{vendorData?.phone || 'N/A'}</p>
                            </div>
                            <div className="info-item full-width">
                                <label>Address</label>
                                <p>{vendorData?.address || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>City</label>
                                <p>{vendorData?.city || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>State</label>
                                <p>{vendorData?.state || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Pincode</label>
                                <p>{vendorData?.pincode || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Details Display */}
                    <div className="profile-section">
                        <h3>Business Details</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>GST Number</label>
                                <p>{vendorData?.gstNumber || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>PAN Number</label>
                                <p>{vendorData?.panNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Banking Information Display */}
                    {vendorData?.bankAccountName && (
                        <div className="profile-section">
                            <h3>Banking Information</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Account Holder Name</label>
                                    <p>{vendorData?.bankAccountName || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Account Number</label>
                                    <p>{'*'.repeat((vendorData?.bankAccountNumber || '').length - 4) + (vendorData?.bankAccountNumber || 'N/A').slice(-4)}</p>
                                </div>
                                <div className="info-item">
                                    <label>IFSC Code</label>
                                    <p>{vendorData?.bankIFSC || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VendorProfile;
