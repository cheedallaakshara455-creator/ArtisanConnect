import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast, ToastContainer } from '../../components/Toast';
import { responseData, responseList, responsePage } from '../../api/response';
import { getProductImage } from '../../api/productImages';

const AdminDashboard = () => {
  const { toasts, showToast } = useToast();
  const [stats, setStats] = useState({ totalUsers: 0, totalArtisans: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [pendingArtisans, setPendingArtisans] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      api.get('/api/admin/analytics').catch(() => ({ data: {} })),
      api.get('/api/admin/users').catch(() => ({ data: [] })),
      // Just getting all products to filter client-side for simplicity in dashboard
      api.get('/api/products?page=0&size=100').catch(() => ({ data: { content: [] } }))
    ]).then(([st, usrs, prods]) => {
      setStats(responseData(st) || {});
      
      const pArtisans = responseList(usrs).filter(u => u.role === 'ARTISAN' && u.artisanProfile && !u.artisanProfile.isVerified);
      setPendingArtisans(pArtisans);
      
      const pProds = responsePage(prods).content.filter(p => p.status === 'PENDING');
      setPendingProducts(pProds);
      
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyArtisan = async (profileId) => {
    try {
      await api.put(`/api/admin/artisans/${profileId}/verify`);
      showToast('Artisan verified', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to verify artisan', 'error');
    }
  };

  const handleApproveProduct = async (id) => {
    try {
      await api.put(`/api/admin/products/${id}/approve`);
      showToast('Product approved', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to approve product', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <ToastContainer toasts={toasts} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/admin/users" className="btn btn-outline">Manage Users</Link>
          <Link to="/admin/orders" className="btn btn-outline">Manage Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          ['Total Users', stats.totalUsers || 0, '👥'],
          ['Total Artisans', stats.totalArtisans || 0, '🧑🎨'],
          ['Total Products', stats.totalProducts || 0, '🏺'],
          ['Total Orders', stats.totalOrders || 0, '📦'],
          ['Revenue', `₹${(stats.totalRevenue || 0).toFixed(2)}`, '💰']
        ].map(([label, val, icon]) => (
          <div key={label} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Pending Verifications */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-dark)' }}>Pending Artisan Verifications</h2>
          {pendingArtisans.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No pending verifications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingArtisans.map(art => (
                <div key={art.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{art.username}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{art.artisanProfile?.craftType || 'No craft type'}</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleVerifyArtisan(art.artisanProfile.id)}>Verify</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Products */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-dark)' }}>Pending Product Approvals</h2>
          {pendingProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No products awaiting approval.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingProducts.slice(0, 5).map(prod => (
                <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      {getProductImage(prod) && <img src={getProductImage(prod)} onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={prod.name} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{prod.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>by {prod.artisanName}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => handleApproveProduct(prod.id)}>Approve</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
