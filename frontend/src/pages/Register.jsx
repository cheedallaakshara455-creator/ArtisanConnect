import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid = {
    username: /^[a-zA-Z0-9_]{3,20}$/.test(formData.username),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: /^[6-9]\d{9}$/.test(formData.phone),
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password),
    confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  };
  
  const allValid = isValid.username && isValid.email && isValid.phone && isValid.password && isValid.confirmPassword;

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (pw.length === 0) return { width: '0%', color: 'transparent' };
    if (pw.length < 8) return { width: '33%', color: '#ef4444' }; // weak
    if (pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return { width: '100%', color: '#10b981' }; // strong
    return { width: '66%', color: '#f59e0b' }; // medium
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', { ...formData, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '3rem 1rem' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-dark)' }}>Create an Account</h2>
        
        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setRole('CUSTOMER')}
            style={{ flex: 1, padding: '1rem', border: `2px solid ${role === 'CUSTOMER' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '8px', background: role === 'CUSTOMER' ? 'var(--bg-light)' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛍️</div>
            <div style={{ fontWeight: 600, color: role === 'CUSTOMER' ? 'var(--primary)' : 'var(--text-muted)' }}>Shopper</div>
          </button>
          <button 
            type="button"
            onClick={() => setRole('ARTISAN')}
            style={{ flex: 1, padding: '1rem', border: `2px solid ${role === 'ARTISAN' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '8px', background: role === 'ARTISAN' ? 'var(--bg-light)' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧑🎨</div>
            <div style={{ fontWeight: 600, color: role === 'ARTISAN' ? 'var(--primary)' : 'var(--text-muted)' }}>Artisan</div>
          </button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username {formData.username.length > 0 && (isValid.username ? '✓' : '✗')}</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address {formData.email.length > 0 && (isValid.email ? '✓' : '✗')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number {formData.phone.length > 0 && (isValid.phone ? '✓' : '✗')}</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password {formData.password.length > 0 && (isValid.password ? '✓' : '✗')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" required />
            <div style={{ height: '4px', background: '#e5e7eb', marginTop: '0.5rem', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: getPasswordStrength().width, background: getPasswordStrength().color, transition: 'all 0.3s' }}></div>
            </div>
            <small style={{ color: 'var(--text-muted)' }}>Min 8 chars, 1 letter, 1 number.</small>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password {formData.confirmPassword.length > 0 && (isValid.confirmPassword ? '✓' : '✗')}</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control" required />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '1rem' }} disabled={!allValid || loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
