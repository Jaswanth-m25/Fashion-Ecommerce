import React, { useState, useEffect } from 'react';
import './AdminProfile.css';

const AdminProfile = () => {
    const [adminInfo, setAdminInfo] = useState({
        name: '',
        email: '',
        date: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        fetchAdminInfo();
    }, []);

    const fetchAdminInfo = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                setMessage({ text: 'Not authenticated', type: 'error' });
                return;
            }

            const res = await fetch('https://fashion-ecommerce-ak78.onrender.com/admin/admininfo', {
                method: 'GET',
                headers: {
                    'auth-token': token
                }
            });

            const data = await res.json();
            console.log('✅ Admin info fetched:', data);

            if (data.success) {
                setAdminInfo({
                    name: data.data.name || 'Admin',
                    email: data.data.email || 'admin@shop.com',
                    date: data.data.date || ''
                });
            } else {
                setMessage({ text: data.message || 'Failed to fetch admin info', type: 'error' });
            }
        } catch (err) {
            console.error('❌ Error fetching admin info:', err);
            setMessage({ text: 'Error fetching admin information', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        // Validation
        if (!passwordForm.currentPassword) {
            setMessage({ text: 'Current password is required', type: 'error' });
            return;
        }

        if (!passwordForm.newPassword) {
            setMessage({ text: 'New password is required', type: 'error' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ text: 'New password must be at least 6 characters', type: 'error' });
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        setUpdating(true);

        try {
            const token = localStorage.getItem('auth-token');
            const res = await fetch('https://fashion-ecommerce-ak78.onrender.com/admin/updatepassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();
            console.log('✅ Password update response:', data);

            if (data.success) {
                setMessage({ text: '✅ Password updated successfully!', type: 'success' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: data.message || 'Failed to update password', type: 'error' });
            }
        } catch (err) {
            console.error('❌ Error updating password:', err);
            setMessage({ text: 'Error updating password', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="admin-profile-loading">Loading profile...</div>;
    }

    return (
        <div className="admin-profile-container">
            <div className="profile-header">
                <h1>👤 Admin Profile</h1>
                <p className="profile-subtitle">Manage your account and security settings</p>
            </div>

            {/* Message Toast */}
            {message.text && (
                <div className={`message-toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                {/* Profile Info Section */}
                <div className="profile-section info-section">
                    <div className="section-header">
                        <h2>📋 Account Information</h2>
                    </div>
                    <div className="profile-info-grid">
                        <div className="info-item">
                            <label>👤 Name</label>
                            <div className="info-value">{adminInfo.name}</div>
                        </div>
                        <div className="info-item">
                            <label>📧 Email</label>
                            <div className="info-value">{adminInfo.email}</div>
                        </div>
                        <div className="info-item">
                            <label>📅 Account Created</label>
                            <div className="info-value">{formatDate(adminInfo.date)}</div>
                        </div>
                        <div className="info-item">
                            <label>🔐 Role</label>
                            <div className="info-value">
                                <span className="role-badge admin-role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Update Section */}
                <div className="profile-section password-section">
                    <div className="section-header">
                        <h2>🔐 Change Password</h2>
                        <p className="section-subtitle">Update your password to keep your account secure</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="password-form">
                        {/* Current Password */}
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password *</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword.current ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your current password"
                                    disabled={updating}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(prev => ({
                                        ...prev,
                                        current: !prev.current
                                    }))}
                                >
                                    {showPassword.current ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password *</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword.new ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your new password (min. 6 characters)"
                                    disabled={updating}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(prev => ({
                                        ...prev,
                                        new: !prev.new
                                    }))}
                                >
                                    {showPassword.new ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Re-enter your new password"
                                    disabled={updating}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(prev => ({
                                        ...prev,
                                        confirm: !prev.confirm
                                    }))}
                                >
                                    {showPassword.confirm ?'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="password-requirements">
                            <p className="requirements-title">✓ Password Requirements:</p>
                            <ul>
                                <li className={passwordForm.newPassword.length >= 6 ? 'met' : ''}>
                                    At least 6 characters
                                </li>
                                <li className={passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword ? 'met' : ''}>
                                    Passwords match
                                </li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-update-password"
                                disabled={updating || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            >
                                {updating ? '⏳ Updating...' : '✓ Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
