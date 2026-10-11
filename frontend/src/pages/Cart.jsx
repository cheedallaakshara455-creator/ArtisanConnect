import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { responseList } from '../api/response';
import { cartItemImage, cartItemName, cartItemPrice, cartItemQuantity } from '../api/cart';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = () => {
    setLoading(true);
    api.get('/api/cart')
  .then(res => {
    setCartItems(responseList(res));
  })
  .catch(console.error)
  .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (itemId) => {
    api.delete(`/api/cart/${itemId}`).then(() => fetchCart()).catch(console.error);
  };

  const handleUpdate = (itemId, newQty) => {
    // In a real app, you'd likely have a PUT /api/cart/:id endpoint.
    // For this boilerplate, let's assume removing and adding isn't the best way.
    // If update isn't directly supported by backend, we ignore or implement PUT.
    console.log('Update quantity not fully implemented', itemId, newQty);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + cartItemPrice(item) * cartItemQuantity(item), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (loading) return <LoadingSpinner />;

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't added any artisanal items yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Cart Items */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '100px', height: '100px', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                {cartItemImage(item) ? (
                  <img src={cartItemImage(item)} alt={cartItemName(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }}>🏺</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{cartItemName(item)}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>By Artisan</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                  <button onClick={() => handleRemove(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                ₹{(cartItemPrice(item) * cartItemQuantity(item)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ flex: '1', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.5rem' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};
export default Cart;
