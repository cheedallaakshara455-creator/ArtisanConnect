import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast, ToastContainer } from '../../components/Toast';
import { responseData } from '../../api/response';

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const ArtisanProfile = () => {
  const { user } = useContext(AuthContext);
  const { toasts, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    craftType: '', bio: '', location: '', state: '', yearsExperience: '', bannerImage: ''
  });

  useEffect(() => {
    api.get(`/api/artisans/${user.id}`)
      .then(res => {
        const profile = responseData(res);
        if (profile) {
          setFormData({
            craftType: profile.craftType || '',
            bio: profile.bio || '',
            location: profile.location || '',
            state: profile.state || '',
            yearsExperience: profile.yearsExperience || '',
            bannerImage: profile.bannerImage || ''
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/artisans/profile', {
        ...formData,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <ToastContainer toasts={toasts} />
      
      <h1 style={{ marginBottom: '2rem' }}>Artisan Profile Setup</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Editor Form */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Craft Type (e.g., Terracotta Pottery, Madhubani Painting)</label>
              <input type="text" name="craftType" value={formData.craftType} onChange={handleChange} className="form-control" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Bio / Story</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="form-control" rows="5" placeholder="Tell customers about your heritage, process, and passion..." />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City/Town</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-control" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State</label>
                <select name="state" value={formData.state} onChange={handleChange} className="form-control">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Years of Experience</label>
              <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} className="form-control" min="0" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Banner Image URL</label>
              <input type="url" name="bannerImage" value={formData.bannerImage} onChange={handleChange} className="form-control" placeholder="https://..." />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-muted)' }}>Live Preview</h3>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
            <div style={{ height: '150px', background: formData.bannerImage ? `url(${formData.bannerImage}) center/cover` : 'linear-gradient(135deg, var(--primary) 0%, #a0734e 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '-40px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {user.username[0].toUpperCase()}
              </div>
            </div>
            <div style={{ padding: '50px 20px 20px 20px' }}>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>{user.username}</h2>
              <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>{formData.craftType || 'Artisan Craft Type'}</div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {formData.location || formData.state ? <span>📍 {formData.location}{formData.location && formData.state ? ', ' : ''}{formData.state}</span> : null}
                {formData.yearsExperience && <span>⏳ {formData.yearsExperience} Yrs Exp</span>}
              </div>
              <p style={{ margin: 0, color: 'var(--text-dark)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                {formData.bio || 'Your bio will appear here. Share your story with customers!'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ArtisanProfile;
