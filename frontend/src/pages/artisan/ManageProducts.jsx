import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast, ToastContainer } from '../../components/Toast';
import { responseList } from '../../api/response';
import { getProductImage } from '../../api/productImages';

const ManageProducts = () => {
  const { user } = useContext(AuthContext);
  const { toasts, showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', categoryId: '', price: '', stock: '', material: '', origin: '', images: ''
  });

  const fetchProducts = () => {
    setLoading(true);
    api.get(`/api/products/artisan/${user.id}`)
      .then(res => setProducts(responseList(res)))
      .catch(() => showToast('Failed to fetch products', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/api/categories').then(res => setCategories(responseList(res))).catch(console.error);
  }, [user]);

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name, description: product.description || '', categoryId: product.category?.id || '',
        price: product.price, stock: product.stock, material: product.material || '', origin: product.origin || '',
        images: (product.images || []).join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', categoryId: categories[0]?.id || '', price: '', stock: '', material: '', origin: '', images: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      images: formData.images.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingId) await api.put(`/api/products/${editingId}`, payload);
      else await api.post('/api/products', payload);
      
      showToast(editingId ? 'Product updated' : 'Product created', 'success');
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        showToast('Product deleted', 'success');
        fetchProducts();
      } catch (err) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  if (loading && products.length === 0) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <ToastContainer toasts={toasts} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Manage Products</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add New Product</button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Image</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Name</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Category</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Price</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Stock</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Status</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    {getProductImage(p) ? <img src={getProductImage(p)} onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} /> : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>🏺</div>}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '1rem' }}>{typeof p.category === 'string' ? p.category : p.category?.name || p.categoryName || '-'}</td>
                <td style={{ padding: '1rem' }}>₹{p.price?.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: p.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{p.stock}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: p.status === 'APPROVED' ? '#dcfce3' : p.status === 'PENDING' ? '#fef3c7' : '#fee2e2', color: p.status === 'APPROVED' ? '#16a34a' : p.status === 'PENDING' ? '#d97706' : '#dc2626' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => openModal(p)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem', fontWeight: 'bold' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products found. Start adding your crafts!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Product Name*</label>
                <input required className="form-control" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label>Category*</label>
                <select required className="form-control" value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Price (₹)*</label>
                  <input required type="number" min="0" step="0.01" className="form-control" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label>Stock*</label>
                  <input required type="number" min="0" className="form-control" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Material</label>
                  <input className="form-control" value={formData.material} onChange={e=>setFormData({...formData, material: e.target.value})} />
                </div>
                <div>
                  <label>Origin (City/State)</label>
                  <input className="form-control" value={formData.origin} onChange={e=>setFormData({...formData, origin: e.target.value})} />
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea className="form-control" rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label>Images (Comma separated URLs)</label>
                <textarea className="form-control" rows="2" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" value={formData.images} onChange={e=>setFormData({...formData, images: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageProducts;
