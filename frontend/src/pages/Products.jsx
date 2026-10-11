import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { responseData, responseList, responsePage } from '../api/response';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const page = parseInt(searchParams.get('page')) || 0;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    api.get('/api/categories').then(res => setCategories(responseList(res))).catch(() => {});
  }, [retryCount]);

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    const params = new URLSearchParams({ page, size: 12 });
    if (search) params.append('search', search);
    // The UI keeps category names in the URL, while the API filters by ID.
    const selectedCategory = categories.find(c => c.name === category);
    if (selectedCategory) params.append('categoryId', selectedCategory.id);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    api.get(`/api/products?${params.toString()}`)
      .then(res => {
        const payload = responsePage(res);
        setProducts(payload.content);
        setTotalPages(payload?.totalPages || 1);
      })
      .catch(err => {
        console.error(err);
        setLoadError(err.response?.data?.message || 'Products could not be loaded. Check the backend, then refresh.');
        setProducts([]);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [page, search, category, minPrice, maxPrice, categories, retryCount]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', 0); // Reset page on filter change
    setSearchParams(newParams);
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '2rem', padding: '2rem 1rem' }}>
      {/* Sidebar Filters */}
      <aside style={{ width: '250px', flexShrink: 0 }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Filters</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => updateFilter('category', '')}
                style={{ textAlign: 'left', background: 'none', border: 'none', color: !category ? 'var(--primary)' : 'var(--text-dark)', fontWeight: !category ? 'bold' : 'normal', cursor: 'pointer' }}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => updateFilter('category', c.name)}
                  style={{ textAlign: 'left', background: 'none', border: 'none', color: category === c.name ? 'var(--primary)' : 'var(--text-dark)', fontWeight: category === c.name ? 'bold' : 'normal', cursor: 'pointer' }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Price Range (₹)</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="number" placeholder="Min" className="form-control" style={{ padding: '0.4rem', fontSize: '0.9rem' }} value={minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
              <span>-</span>
              <input type="number" placeholder="Max" className="form-control" style={{ padding: '0.4rem', fontSize: '0.9rem' }} value={maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-dark)' }}>Discover Crafts</h2>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-control" 
            style={{ width: '300px' }} 
            value={search}
            onChange={e => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Active Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {category && <span style={{ background: 'var(--bg-light)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>Category: {category} <button onClick={()=>updateFilter('category','')} style={{background:'none',border:'none',color:'var(--primary)',cursor:'pointer'}}>×</button></span>}
          {search && <span style={{ background: 'var(--bg-light)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>Search: {search} <button onClick={()=>updateFilter('search','')} style={{background:'none',border:'none',color:'var(--primary)',cursor:'pointer'}}>×</button></span>}
        </div>

        {loading ? <LoadingSpinner /> : (
          loadError ? (
            <div role="alert" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--error)' }}>
              <h3>Unable to load products</h3>
              <p>{loadError}</p>
              <button className="btn btn-primary" onClick={() => setRetryCount(count => count + 1)}>
                Retry
              </button>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-3">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                <button className="btn btn-outline" disabled={page === 0} onClick={() => updateFilter('page', page - 1)}>Previous</button>
                <span style={{ display: 'flex', alignItems: 'center' }}>Page {page + 1} of {totalPages}</span>
                <button className="btn btn-outline" disabled={page >= totalPages - 1} onClick={() => updateFilter('page', page + 1)}>Next</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😞</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};
export default Products;
