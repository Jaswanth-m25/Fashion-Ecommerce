import React, { useState } from 'react';
import './AdminNavbar.css';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '' },
        { id: 'pending', label: 'Pending', icon: '' },
        { id: 'products', label: 'Products', icon: '' },
        { id: 'users', label: 'Users', icon: '' },
        { id: 'orders', label: 'Orders', icon: '' },
        // { id: 'profile', label: 'Profile', icon: '' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-role');
        navigate('/LoginSignup');
        window.location.reload();
    };

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleNavClick = (tabId) => {
        onTabChange(tabId);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-container">
                {/* Logo/Brand */}
                <div className="admin-logo">
                    
                    <span className="logo-text">Admin</span>
                </div>

                {/* Desktop Navigation */}
                <div className="nav-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* User Menu & Logout */}
                <div className="nav-right">
                    <div className="profile-dropdown">
                        <button className="profile-btn" onClick={handleProfileClick}>
                            👤 Profile
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => {
                                    onTabChange('profile');
                                    setIsProfileDropdownOpen(false);
                                }}>
                                     View Profile
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout-item" onClick={handleLogout}>
                                     Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className={`mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                    <div className="mobile-menu-divider"></div>
                    <button className="mobile-profile-btn" onClick={handleProfileClick}>
                        👤 Profile
                    </button>
                    {isProfileDropdownOpen && (
                        <div className="mobile-dropdown-menu">
                            <button className="mobile-dropdown-item" onClick={() => {
                                onTabChange('profile');
                                setIsProfileDropdownOpen(false);
                            }}>
                                👁️ View Profile
                            </button>
                            <button className="mobile-dropdown-item logout-item" onClick={handleLogout}>
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default AdminNavbar;