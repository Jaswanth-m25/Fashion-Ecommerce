import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shop from './pages/Shop/Shop';
import ShopCategory from './pages/ShopCategory/ShopCategory';
import AllProducts from './pages/AllProducts/AllProducts';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import Wishlist from './pages/Wishlist/Wishlist';
import Search from './pages/Search/Search';
import About from './pages/About/About';
import Help from './pages/Help/Help';
import VendorDashboard from './pages/VendorDashboard/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Checkout from './pages/Checkout/Checkout';
import men_banner from './components/Assets/banner_mens.png'
import women_banner from './components/Assets/banner_women.png'
import kid_banner from './components/Assets/banner_kids.png'

function App() {
  return (
    <div>
      <BrowserRouter>
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
          <Route path='/LoginSignup' element={<LoginSignup/>} />
          <Route path='/about' element={<About/>} />
          <Route path='/help' element={<Help/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path='/orders' element={<Orders/>} />
          <Route path='/wishlist' element={<Wishlist/>} />
          <Route path='/search' element={<Search/>} />
          <Route path='/vendor' element={<VendorDashboard/>} />
          <Route path='/admin' element={<AdminDashboard/>} />
          <Route path='/checkout' element={<Checkout/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;