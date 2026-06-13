import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
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
import { AuthProvider } from './context/AuthContext';
import men_banner from './components/Assets/banner_mens.png'
import women_banner from './components/Assets/banner_women.png'
import kid_banner from './components/Assets/banner_kids.png'

function AppRoutes() {
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
        path='/LoginSignup/*'
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
        path='/signup/*'
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
