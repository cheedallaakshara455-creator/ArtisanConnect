import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { useToast, ToastContainer } from '../components/Toast';
import { responseData, responseList } from '../api/response';
import { getProductImages } from '../api/productImages';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { toasts, showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  
  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/api/products/${id}`),
      api.get(`/api/reviews/product/${id}`).catch(()=>({data:[]}))
    ]).then(([prodRes, revRes]) => {
      const productPayload = responseData(prodRes);
      setProduct(productPayload);
      const productImages = getProductImages(productPayload);
      setSelectedImg(productImages[0] || '');
      setImageFailed(false);
      setReviews(responseList(revRes));
    }).catch(err => {
      console.error(err);
      showToast('Error loading product', 'error');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return showToast('Please login to add to cart', 'error');
    try {
      await api.post('/api/cart', { productId: product.id, quantity: qty });
      showToast('Added to cart successfully!', 'success');
    } catch (err) {
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post('/api/reviews', { productId: product.id, rating, comment });
      setReviews(prev => [responseData(res), ...prev]);
      setComment('');
      showToast('Review submitted!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="container" style={{padding:'4rem',textAlign:'center'}}>Product not found</div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <ToastContainer toasts={toasts} />
      
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link> / 
        <Link to="/products" style={{ color: 'var(--primary)', textDecoration: 'none' }}> Products</Link> / 
        <span style={{ color: 'var(--text-dark)' }}> {product.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '3rem', marginBottom: '4rem' }}>
        {/* Images */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#f5f5f5', borderRadius: '12px', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {selectedImg && !imageFailed ? (
              <img src={selectedImg} alt={product.name} onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '6rem' }}>🏺</span>
            )}
          </div>
          {getProductImages(product).length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
              {getProductImages(product).map((img, idx) => (
                <div key={idx} onClick={() => { setSelectedImg(img); setImageFailed(false); }} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: selectedImg === img ? '2px solid var(--primary)' : '2px solid transparent' }}>
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumbnail" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ flex: '1' }}>
          <span style={{ background: 'var(--bg-light)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>{typeof product.category === 'string' ? product.category : product.category?.name || product.categoryName || 'Craft'}</span>
          <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', color: 'var(--text-dark)' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <StarRating rating={product.rating || 0} />
            <span style={{ color: 'var(--text-muted)' }}>({reviews.length} reviews)</span>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>₹{product.price?.toFixed(2)}</div>
          
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>{product.description || 'No description available.'}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Material:</span> <br/><b>{product.material || 'N/A'}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Origin:</span> <br/><b>{product.origin || 'N/A'}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Stock:</span> <br/><b style={{ color: product.stock > 0 ? '#10b981' : '#ef4444' }}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}</b></div>
          </div>

          {user?.role === 'CUSTOMER' && product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <button style={{ padding: '0.5rem 1rem', background: 'white', border: 'none', cursor: 'pointer' }} onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-light)', fontWeight: 'bold' }}>{qty}</div>
                <button style={{ padding: '0.5rem 1rem', background: 'white', border: 'none', cursor: 'pointer' }} onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.8rem', fontSize: '1.1rem' }} onClick={handleAddToCart}>
                Add to Cart 🛒
              </button>
            </div>
          )}

          {/* Artisan Info */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {(product.artisanName || 'A')[0]}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.2rem 0' }}>{product.artisanName}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authentic Artisan</p>
            </div>
            {product.artisanId && (
              <Link to={`/artisans/${product.artisanId}`} className="btn btn-outline">View Profile</Link>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Customer Reviews</h2>
        
        {user?.role === 'CUSTOMER' && (
          <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', marginBottom: '3rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Write a Review</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rating</label>
              <StarRating rating={rating} interactive={true} onRate={setRating} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <textarea 
                value={comment} 
                onChange={e=>setComment(e.target.value)} 
                className="form-control" 
                rows="4" 
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{rev.customerName || 'Anonymous'}</div>
                  <StarRating rating={rev.rating} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                </div>
                <p style={{ margin: 0, color: 'var(--text-dark)', lineHeight: 1.6 }}>{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
