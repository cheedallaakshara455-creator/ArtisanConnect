import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProductImage } from '../api/productImages';

const ProductCard = ({ product, onAddToCart }) => {
  const { user } = useContext(AuthContext);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImage(product);
  const rating = product.rating || 0;
  const categoryName = typeof product.category === 'string'
    ? product.category
    : product.category?.name || product.categoryName || 'Craft';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '200px', width: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt={product.name} onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '4rem' }}>🏺</span>
          )}
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ background: 'var(--bg-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              {categoryName}
            </span>
            <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
              {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
            </div>
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-dark)', lineHeight: 1.3 }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {(product.artisanName || 'A')[0]}
            </div>
            <span>{product.artisanName || 'Unknown Artisan'}</span>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
              ₹{product.price?.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
      {user?.role === 'CUSTOMER' && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.5rem' }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart && onAddToCart(product); }}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};
export default ProductCard;
