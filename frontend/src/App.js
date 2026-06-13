import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  useUser,
  SignedIn,
  SignedOut
} from '@clerk/clerk-react';
import axios from 'axios';
import Shop from './pages/Shop/Shop';
import ShopCategory from './pages/ShopCategory/ShopCategory';
import AllProducts from './pages/AllProducts/AllProducts';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import SignUpPage from './pages/LoginSignup/SignUp';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import Wishlist from './pages/Wishlist/Wishlist';
import Search from './pages/Search/Search';
import About from './pages/About/About';
import Help from './pages/Help/Help';
import VendorDashboard from './pages/VendorDashboard/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Checkout from './pages/Checkout/Checkout';
import RoleGuard, { RoleBasedRedirect } from './components/RoleGuard';
import men_banner from './components/Assets/banner_mens.png'
import women_banner from './components/Assets/banner_women.png'
import kid_banner from './components/Assets/banner_kids.png'

const API_URL = process.env.REACT_APP_API_URL || 'https://fashion-ecommerce-ak78.onrender.com';

function AppRoutes() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;

      setIsSyncing(true);

      try {
        const signupRole = localStorage.getItem('signup-role')
          || user.unsafeMetadata?.role;
        const isNewSignup = localStorage.getItem('signup-pending') === 'true';

        const response = await axios.post(`${API_URL}/clerk/sync-user`, {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          role: isNewSignup ? signupRole : undefined,
          isNewSignup
        });

        localStorage.setItem('auth-token', response.data.token);
        localStorage.setItem('user-role', response.data.role);

        if (isNewSignup) {
          localStorage.removeItem('signup-role');
          localStorage.removeItem('signup-pending');
        }
      } catch (error) {
        console.error('User sync error:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    if (isSignedIn) {
      syncUser();
    } else {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-role');
      setIsSyncing(false);
    }
  }, [isSignedIn, user]);

  if (!isLoaded || (isSignedIn && isSyncing)) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path='/' element={<Shop />} />
      <Route path='/all-products' element={<AllProducts />} />
      <Route path='/mens' element={<ShopCategory banner={men_banner} category="men" />} />
      <Route path='/womens' element={<ShopCategory banner={women_banner} category="women" />} />
      <Route path='/kids' element={<ShopCategory banner={kid_banner} category="kid" />} />
      <Route path='/product' element={<Product />}>
        <Route path=':productId' element={<Product />} />
      </Route>
      <Route path='/cart' element={<Cart/>} />
      <Route
        path='/LoginSignup'
        element={
          <>
            <SignedOut>
              <LoginSignup />
            </SignedOut>
            <SignedIn>
              <RoleBasedRedirect />
            </SignedIn>
          </>
        }
      />
      <Route
        path='/signup'
        element={
          <>
            <SignedOut>
              <SignUpPage />
            </SignedOut>
            <SignedIn>
              <RoleBasedRedirect />
            </SignedIn>
          </>
        }
      />
      <Route path='/about' element={<About/>} />
      <Route path='/help' element={<Help/>} />
      <Route
        path='/profile'
        element={
          <RoleGuard allowedRoles={['customer']}>
            <Profile/>
          </RoleGuard>
        }
      />
      <Route
        path='/orders'
        element={
          <RoleGuard allowedRoles={['customer']}>
            <Orders/>
          </RoleGuard>
        }
      />
      <Route
        path='/wishlist'
        element={
          <RoleGuard allowedRoles={['customer']}>
            <Wishlist/>
          </RoleGuard>
        }
      />
      <Route path='/search' element={<Search/>} />
      <Route
        path='/vendor'
        element={
          <RoleGuard allowedRoles={['vendor']}>
            <VendorDashboard/>
          </RoleGuard>
        }
      />
      <Route
        path='/admin'
        element={
          <RoleGuard allowedRoles={['admin']}>
            <AdminDashboard/>
          </RoleGuard>
        }
      />
      <Route
        path='/checkout'
        element={
          <RoleGuard allowedRoles={['customer']}>
            <Checkout/>
          </RoleGuard>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
