import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { responseList } from '../api/response';

const CATEGORIES = [
  { icon: '🏺', name: 'Pottery' },
  { icon: '🧵', name: 'Textiles' },
  { icon: '🪵', name: 'Woodcraft' },
  { icon: '💎', name: 'Jewelry' },
  { icon: '🎨', name: 'Paintings' },
  { icon: '👜', name: 'Leather goods' },
  { icon: '🎋', name: 'Bamboo Craft' },
  { icon: '🪨', name: 'Stone Craft' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/products?page=0&size=8').then(res => {
      setFeaturedProducts(responseList(res));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${search}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="hero-section">
        <div className="container hero-content">
          <span className="hero-badge">✨ Authentic Handmade Crafts</span>
          <h1 style={{fontSize:'3.5rem', color:'var(--text-dark)', lineHeight:1.2, margin:'1rem 0'}}>Discover the Art of <br/><span style={{color:'var(--primary)'}}>Traditional Craftsmanship</span></h1>
          <p style={{fontSize:'1.2rem', color:'var(--text-muted)', marginBottom:'2rem', maxWidth:'600px'}}>Support local artisans, preserve cultural heritage, and bring unique handcrafted pieces into your life.</p>
          <form onSubmit={handleSearch} style={{display:'flex', gap:'0.5rem', maxWidth:'500px', marginBottom:'2rem'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} className="form-control" placeholder="Search for pottery, textiles, jewelry..." style={{flex:1}} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
            <Link to="/products" className="btn btn-primary" style={{padding:'0.8rem 2rem', fontSize:'1rem'}}>Shop Now 🛍️</Link>
            <Link to="/register" className="btn btn-outline" style={{padding:'0.8rem 2rem', fontSize:'1rem'}}>Become an Artisan</Link>
          </div>
        </div>
      </section>


      {/* Categories */}
      <section className="container" style={{padding:'4rem 1.5rem'}}>
        <h2 style={{textAlign:'center', fontSize:'2rem', marginBottom:'0.5rem'}}>Browse by Category</h2>
        <p style={{textAlign:'center', color:'var(--text-muted)', marginBottom:'2.5rem'}}>Explore our wide range of handcrafted traditions</p>
        <div className="grid grid-cols-4">
          {CATEGORIES.map(cat=>(
            <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} className="card" style={{textAlign:'center', padding:'2rem 1rem', cursor:'pointer', textDecoration:'none'}}>
              <div style={{fontSize:'2.5rem', marginBottom:'0.5rem'}}>{cat.icon}</div>
              <h3 style={{fontSize:'1rem', margin:0}}>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{background:'#FFF8F3', padding:'4rem 0'}}>
        <div className="container">
          <h2 style={{textAlign:'center', fontSize:'2rem', marginBottom:'0.5rem'}}>Featured Products</h2>
          <p style={{textAlign:'center', color:'var(--text-muted)', marginBottom:'2.5rem'}}>Handpicked authentic crafts from our artisans</p>
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-4">
              {featuredProducts.slice(0,8).map(p=><ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div style={{textAlign:'center', marginTop:'2rem'}}>
            <Link to="/products" className="btn btn-outline">View All Products →</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container" style={{padding:'4rem 1.5rem'}}>
        <h2 style={{textAlign:'center', fontSize:'2rem', marginBottom:'0.5rem'}}>How It Works</h2>
        <p style={{textAlign:'center', color:'var(--text-muted)', marginBottom:'2.5rem'}}>Simple steps to connect with artisans</p>
        <div className="grid grid-cols-3">
          {[['🔍','Discover','Browse thousands of unique handcrafted items from verified artisans across India.'],['🛒','Purchase','Buy directly from artisans with secure Razorpay payment gateway.'],['📦','Receive','Get your authentic handmade products delivered right to your doorstep.']].map(([icon,title,desc])=>(
            <div key={title} className="card" style={{textAlign:'center', padding:'2.5rem'}}>
              <div style={{fontSize:'3rem', marginBottom:'1rem'}}>{icon}</div>
              <h3>{title}</h3>
              <p style={{color:'var(--text-muted)'}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Artisan CTA */}
      <section style={{background:'linear-gradient(135deg, var(--primary) 0%, #a0734e 100%)', padding:'4rem 0', color:'white', textAlign:'center'}}>
        <div className="container">
          <h2 style={{color:'white', fontSize:'2rem'}}>Are You an Artisan?</h2>
          <p style={{color:'rgba(255,255,255,0.85)', marginBottom:'2rem', fontSize:'1.1rem'}}>Join thousands of artisans selling their craft online. No middlemen, no commission hassle.</p>
          <Link to="/register" className="btn" style={{background:'white', color:'var(--primary)', padding:'0.8rem 2.5rem', fontSize:'1rem', fontWeight:600}}>Join as Artisan →</Link>
        </div>
      </section>
    </div>
  );
};
export default Home;
