import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { responseData, responseList } from '../api/response';

const ArtisanPublicProfile = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/artisans/${id}`).catch(() => null),
      api.get(`/api/products/artisan/${id}`).catch(() => ({ data: [] }))
    ]).then(([artRes, prodRes]) => {
      if (artRes && responseData(artRes)) setArtisan(responseData(artRes));
      if (prodRes) setProducts(responseList(prodRes));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  
  if (!artisan) return <div className="container" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Artisan profile not found</div>;

  return (
    <div>
      {/* Banner */}
      <div style={{ height: '250px', background: artisan.bannerImage ? `url(${artisan.bannerImage}) center/cover` : 'linear-gradient(135deg, var(--primary) 0%, #a0734e 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-50px', left: '10%', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {artisan.user?.username ? artisan.user.username[0].toUpperCase() : 'A'}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1.5rem', borderRadius: '8px', marginBottom: '10px', backdropFilter: 'blur(4px)' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {artisan.user?.username || 'Artisan'}
              {artisan.isVerified && <span style={{ color: '#10b981', fontSize: '1.2rem' }} title="Verified Artisan">✓</span>}
            </h1>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{artisan.craftType || 'Crafts Maker'}</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '3rem', padding: '0 1rem 3rem 1rem' }}>
        {/* Sidebar Info */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>About</h3>
            <p style={{ color: 'var(--text-dark)', lineHeight: 1.6 }}>{artisan.bio || 'This artisan hasn\'t added a bio yet.'}</p>
          </div>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Details</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-dark)' }}>
              <li>📍 <b>Location:</b> {artisan.location ? `${artisan.location}, ${artisan.state}` : 'Not specified'}</li>
              <li>⏳ <b>Experience:</b> {artisan.yearsExperience ? `${artisan.yearsExperience} Years` : 'Not specified'}</li>
              <li>✉️ <b>Contact:</b> {artisan.user?.email || 'N/A'}</li>
              <li>🏺 <b>Products:</b> {products.length}</li>
            </ul>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Crafts by {artisan.user?.username} <span style={{ background: 'var(--bg-light)', color: 'var(--primary)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '1rem' }}>{products.length}</span>
          </h2>
          
          {products.length === 0 ? (
            <div style={{ background: '#f8fafc', padding: '4rem', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <h3>No products available</h3>
              <p>This artisan hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ArtisanPublicProfile;
