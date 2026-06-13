import React, {
    useContext,
    useState,
    useEffect,
    useRef
} from 'react';

import './Navbar.css';

import logo from '../Assets/logo.png';

import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

import { ShopContext } from '../../context/ShopContext';

const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { isSignedIn, signOut } = useAuth();
    
    const isAdminRoute = location.pathname.startsWith('/admin');
    const adminTab = searchParams.get('tab') || 'dashboard';

    const {
        getTotalCartItems
    } = useContext(ShopContext);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const [searchValue, setSearchValue] = useState('');

    const dropdownRef = useRef(null);

    const userMenuRef = useRef(null);

    const userRole = localStorage.getItem('user-role');

    const isLoggedIn = isSignedIn;

    /* =========================
       MENU DATA
    ========================= */

    const menuData = {

        men: {
            title: 'MEN',
            items: [
                'T-Shirts',
                'Shirts',
                'Jeans',
                'Trousers',
                'Jackets',
                'Shoes',
                'Sneakers',
                'Watches'
            ]
        },

        women: {
            title: 'WOMEN',
            items: [
                'Dresses',
                'Tops',
                'Heels',
                'Handbags',
                'Jewelry',
                'Skirts',
                'Makeup',
                'Perfumes'
            ]
        },

        kids: {
            title: 'KIDS',
            items: [
                'Toys',
                'School Bags',
                'T-Shirts',
                'Shorts',
                'Shoes',
                'Games',
                'Books',
                'Accessories'
            ]
        }
    };

    /* =========================
       CLOSE DROPDOWNS
    ========================= */

    useEffect(() => {

        const handleOutsideClick = (e) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setActiveDropdown(null);
            }

            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target)
            ) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            );
        };

    }, []);

    /* =========================
       MOBILE MENU SCROLL LOCK
    ========================= */

    useEffect(() => {

        document.body.style.overflow =
            isMobileMenuOpen ? 'hidden' : 'auto';

        return () => {
            document.body.style.overflow = 'auto';
        };

    }, [isMobileMenuOpen]);

    /* =========================
       SEARCH
    ========================= */

    const handleSearch = (e) => {

        if (e.key === 'Enter') {

            const value = searchValue.trim();

            if (value) {

                navigate(`/search?q=${value}`);

                setSearchValue('');
            }
        }
    };

    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = async () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-role');
        await signOut();
        navigate('/');
    };

    /* =========================
       MOBILE MENU
    ========================= */

    const toggleMobileMenu = () => {

        setIsMobileMenuOpen(prev => !prev);
    };

    return (

        <nav className="navbar">

            <div className="navbar-container">

                {/* =========================
                   LOGO
                ========================= */}

                <div
                    className="nav-logo"
                    onClick={() => navigate('/')}
                >

                    <img src={logo} alt="logo" />

                    <span>FASHION</span>

                </div>

                {/* =========================
                   DESKTOP MENU
                ========================= */}

                <ul
                    className="nav-links"
                    ref={dropdownRef}
                >
                    {isAdminRoute ? (
                        <>
                            <li><Link to="/admin?tab=dashboard" style={{ fontWeight: adminTab === 'dashboard' ? 'bold' : 'normal', color: adminTab === 'dashboard' ? '#4f46e5' : 'inherit' }} className="nav-link">Dashboard</Link></li>
                            <li><Link to="/admin?tab=products" style={{ fontWeight: adminTab === 'products' ? 'bold' : 'normal', color: adminTab === 'products' ? '#4f46e5' : 'inherit' }} className="nav-link">Requests</Link></li>
                            <li><Link to="/admin?tab=approved" style={{ fontWeight: adminTab === 'approved' ? 'bold' : 'normal', color: adminTab === 'approved' ? '#4f46e5' : 'inherit' }} className="nav-link">Products</Link></li>
                            <li><Link to="/admin?tab=users" style={{ fontWeight: adminTab === 'users' ? 'bold' : 'normal', color: adminTab === 'users' ? '#4f46e5' : 'inherit' }} className="nav-link">Users</Link></li>
                            <li><Link to="/admin?tab=orders" style={{ fontWeight: adminTab === 'orders' ? 'bold' : 'normal', color: adminTab === 'orders' ? '#4f46e5' : 'inherit' }} className="nav-link">Orders</Link></li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/">HOME</Link>
                            </li>
                            <li>
                                <Link to="/mens" className="nav-link">MEN</Link>
                            </li>
                            <li>
                                <Link to="/womens" className="nav-link">WOMEN</Link>
                            </li>
                            <li>
                                <Link to="/kids" className="nav-link">KIDS</Link>
                            </li>
                            <li>
                                <Link to="/about" className="nav-link">ABOUT</Link>
                            </li>

                            {userRole === 'vendor' && (

                                <li>

                                    <Link
                                        to="/vendor"
                                        className="vendor-link"
                                    >
                                        VENDOR PANEL
                                    </Link>

                                </li>
                            )}

                            {userRole === 'admin' && (

                                <li>

                                    <Link
                                        to="/admin"
                                        className="admin-link"
                                    >
                                        ADMIN PANEL
                                    </Link>

                                </li>
                            )}
                        </>
                    )}

                </ul>

                {/* =========================
                   SEARCH
                ========================= */}

                <div className="search-bar">

                    <input
                        type="text"
                        placeholder="Search products, brands and more..."
                        value={searchValue}
                        onChange={(e) =>
                            setSearchValue(e.target.value)
                        }
                        onKeyDown={handleSearch}
                    />
{/* 
                    <button
                        className="search-icon"
                        aria-label="search"
                        onClick={() => {
                            const value = searchValue.trim();
                            if (value) {
                                navigate(`/search?q=${value}`);
                                setSearchValue('');
                            }
                        }}
                    >
                        
                    </button> */}

                </div>

                {/* =========================
                   LOGIN & CART
                ========================= */}

                <div className="nav-login-cart">

                    {isLoggedIn ? (

                        <div
                            className="user-dropdown"
                            ref={userMenuRef}
                        >

                            <button
                                className="user-btn"
                                onClick={() =>
                                    setIsUserMenuOpen(
                                        prev => !prev
                                    )
                                }
                            >

                                <span className="user-icon">
                                    👤 
                                </span>

                                <span className="user-name">

                                    {
                                        userRole === 'admin'
                                            ? 'Admin'
                                            : userRole === 'vendor'
                                                ? 'Vendor'
                                                : 'Customer'
                                    }

                                </span>

                                <span className="dropdown-arrow">
                                    ▼
                                </span>

                            </button>

                            {isUserMenuOpen && (

                                <div className="user-dropdown-menu">

                                    {userRole === 'customer' && (
                                        <>
                                            <Link to="/profile">
                                                📱 My Profile
                                            </Link>
                                            <Link to="/orders">
                                                📦 Orders
                                            </Link>
                                            <Link to="/wishlist">
                                                ❤️ Wishlist
                                            </Link>
                                        </>
                                    )}

                                    {userRole === 'vendor' && (
                                        <Link to="/vendor">
                                            🏪 Vendor Panel
                                        </Link>
                                    )}

                                    {userRole === 'admin' && (
                                        <Link to="/admin">
                                            🛡️ Admin Panel
                                        </Link>
                                    )}

                                    <Link to="/help">
                                        ❓ Help
                                    </Link>

                                    <hr />

                                    <button onClick={handleLogout}>
                                        🚪 Logout
                                    </button>

                                </div>
                            )}

                        </div>

                    ) : (

                        <Link
                            to="/LoginSignup"
                            className="login-btn"
                        >
                            Login
                        </Link>
                    )}

                    {/* =========================
                       CART
                    ========================= */}

                    <Link
                        to="/cart"
                        className="cart-icon"
                    >

                        🛒

                        <span className="cart-count">

                            {getTotalCartItems ? getTotalCartItems() : 0}

                        </span>

                    </Link>

                    {/* =========================
                       MOBILE MENU BUTTON
                    ========================= */}

                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                    >
                        ☰
                    </button>

                </div>

                {/* =========================
                   MOBILE MENU TOGGLE
                ========================= */}
            </div>

            {/* =========================
               MOBILE MENU
            ========================= */}

            {isMobileMenuOpen && (

                <div 
                    className="mobile-menu-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                >

                    <div 
                        className="mobile-menu"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="mobile-menu-header">

                            <h3>Menu</h3>

                            <button
                                onClick={toggleMobileMenu}
                            >
                                ✕
                            </button>

                        </div>

                        {isAdminRoute ? (
                            <>
                                <Link to="/admin?tab=dashboard" onClick={toggleMobileMenu}>Dashboard</Link>
                                <Link to="/admin?tab=products" onClick={toggleMobileMenu}>Requests</Link>
                                <Link to="/admin?tab=approved" onClick={toggleMobileMenu}>Products</Link>
                                <Link to="/admin?tab=users" onClick={toggleMobileMenu}>Users</Link>
                                <Link to="/admin?tab=orders" onClick={toggleMobileMenu}>Orders</Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/"
                                    onClick={toggleMobileMenu}
                                >
                                    HOME
                                </Link>

                                <Link
                                    to="/about"
                                    onClick={toggleMobileMenu}
                                    className="mobile-category-link"
                                >
                                    ABOUT
                                </Link>

                                {Object.keys(menuData).map((menu) => (

                                    <div
                                        key={menu}
                                        className="mobile-section"
                                    >

                                        <Link
                                            to={`/${menu}s`}
                                            onClick={toggleMobileMenu}
                                            className="mobile-category-link"
                                        >
                                            {menuData[menu].title}
                                        </Link>

                                        {menuData[menu].items.map(
                                            (item, index) => (

                                                <Link
                                                    key={index}
                                                    to={`/${menu}/${item.toLowerCase().replace(/ /g, '-')}`}
                                                    onClick={
                                                        toggleMobileMenu
                                                    }
                                                >
                                                    {item}
                                                </Link>
                                            )
                                        )}

                                    </div>
                                ))}

                                {userRole === 'vendor' && (

                                    <Link
                                        to="/vendor"
                                        onClick={toggleMobileMenu}
                                    >
                                        Vendor Panel
                                    </Link>
                                )}

                                {userRole === 'admin' && (

                                    <Link
                                        to="/admin"
                                        onClick={toggleMobileMenu}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                            </>
                        )}

                    </div>

                </div>
            )}

        </nav>
    );
};

export default Navbar;