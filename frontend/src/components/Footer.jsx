import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: '#2c1e16', color: '#fff', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
        <div>
          <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', marginBottom: '1rem', color: '#c8956c' }}>🏺 Artisan Connect</h3>
          <p style={{ color: '#a89d97', lineHeight: '1.6' }}>Empowering local artisans and bringing authentic handmade crafts directly to your doorstep.</p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.2rem', color: '#fff' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="/" style={{ color: '#a89d97', textDecoration: 'none' }}>Home</Link></li>
            <li><Link to="/products" style={{ color: '#a89d97', textDecoration: 'none' }}>Products</Link></li>
            <li><Link to="/register" style={{ color: '#a89d97', textDecoration: 'none' }}>Sell as Artisan</Link></li>
            <li><Link to="/login" style={{ color: '#a89d97', textDecoration: 'none' }}>Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.2rem', color: '#fff' }}>Categories</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="/products?category=Pottery" style={{ color: '#a89d97', textDecoration: 'none' }}>Pottery</Link></li>
            <li><Link to="/products?category=Textiles" style={{ color: '#a89d97', textDecoration: 'none' }}>Textiles</Link></li>
            <li><Link to="/products?category=Woodcraft" style={{ color: '#a89d97', textDecoration: 'none' }}>Woodcraft</Link></li>
            <li><Link to="/products?category=Jewelry" style={{ color: '#a89d97', textDecoration: 'none' }}>Jewelry</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.2rem', color: '#fff' }}>Contact</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#a89d97' }}>
            <li>Email: support@artisanconnect.in</li>
            <li>Phone: +91 98765 43210</li>
            <li>Address: 123 Craft Street, Heritage Hub, New Delhi, India 110001</li>
          </ul>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#6d615b', borderTop: '1px solid #4a382f', paddingTop: '2rem' }}>
        <p>&copy; {new Date().getFullYear()} Artisan Connect. All rights reserved.</p>
      </div>
    </footer>
  );
};
export default Footer;
