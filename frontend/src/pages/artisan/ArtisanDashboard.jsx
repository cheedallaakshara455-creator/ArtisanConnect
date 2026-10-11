import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { responseData, responseList } from '../../api/response';

const ArtisanDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/artisans/${user.id}`).catch(() => ({ data: {} })),
      api.get(`/api/products/artisan/${user.id}`).catch(() => ({ data: [] })),
      api.get('/api/orders/artisan').catch(() => ({ data: [] }))
          ]).then(([prof, prods, ords]) => {
        setProfile(responseData(prof));
        setProducts(responseList(prods));
        setOrders(responseList(ords));
      }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PAID');

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Welcome back, {user.username}! 🎨</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your store, products, and incoming orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/artisan/products" className="btn btn-primary">Add New Product</Link>
          <Link to="/artisan/profile" className="btn btn-outline">Edit Profile</Link>
        </div>
      </div>

      {profile && !profile.isVerified && (
        <div style={{ background: '#fffbeb', color: '#b45309', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #fcd34d' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <b>Verification Pending</b><br/>
            Your artisan profile is under review by our admin team. You can still add products, but they will become visible once your account is verified.
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Products</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{products.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{orders.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{pendingOrders.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Orders */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Orders</h2>
            <Link to="/orders" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0' }}>Order ID</th>
                <th style={{ padding: '0.75rem 0' }}>Date</th>
                <th style={{ padding: '0.75rem 0' }}>Amount</th>
                <th style={{ padding: '0.75rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>#{o.id}</td>
                  <td style={{ padding: '1rem 0' }}>{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0' }}>₹{o.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Artisan Tips</h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-dark)', lineHeight: 1.6 }}>
              <li style={{ marginBottom: '0.5rem' }}>Upload high-quality images of your craft.</li>
              <li style={{ marginBottom: '0.5rem' }}>Write detailed descriptions including material and origin.</li>
              <li style={{ marginBottom: '0.5rem' }}>Keep your stock numbers updated regularly.</li>
              <li style={{ marginBottom: '0.5rem' }}>Complete your public profile to build trust.</li>
            </ul>
          </div>
          <Link to={`/artisans/${user.id}`} className="btn btn-outline" style={{ textAlign: 'center', padding: '1rem' }}>
            View Public Profile
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ArtisanDashboard;
