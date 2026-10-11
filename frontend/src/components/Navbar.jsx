import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
          🏺 Artisan Connect
        </Link>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Home</Link>
          <Link to="/products" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Products</Link>
          <Link to="/products" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Artisans</Link>
          
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Register</Link>
            </>
          ) : (
            <>
              {user?.role === 'CUSTOMER' && (
                <>
                  <Link to="/cart" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>🛒 Cart</Link>
                  <Link to="/orders" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Orders</Link>
                </>
              )}
              {user?.role === 'ARTISAN' && (
                <>
                  <Link to="/artisan/dashboard" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Dashboard</Link>
                  <Link to="/artisan/products" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>My Products</Link>
                  <Link to="/orders" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Orders</Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Admin Dashboard</Link>
                  <Link to="/admin/users" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Users</Link>
                  <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Orders</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
