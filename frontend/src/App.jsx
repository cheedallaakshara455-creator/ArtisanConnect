import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ArtisanPublicProfile from './pages/ArtisanPublicProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import ManageProducts from './pages/artisan/ManageProducts';
import ArtisanProfile from './pages/artisan/ArtisanProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/artisans/:id" element={<ArtisanPublicProfile />} />
              <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ARTISAN']} />}>
                <Route path="/orders" element={<Orders />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['ARTISAN']} />}>
                <Route path="/artisan/dashboard" element={<ArtisanDashboard />} />
                <Route path="/artisan/products" element={<ManageProducts />} />
                <Route path="/artisan/profile" element={<ArtisanProfile />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/orders" element={<ManageOrders />} />
              </Route>
            </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
