import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast, ToastContainer } from '../../components/Toast';
import { responseList } from '../../api/response';

const ManageUsers = () => {
  const { toasts, showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/admin/users')
      .then(res => setUsers(responseList(res)))
      .catch(() => showToast('Failed to fetch users', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/api/admin/users/${id}/status`);
      showToast('User status updated', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.username || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <ToastContainer toasts={toasts} />
      <h1 style={{ marginBottom: '2rem' }}>Manage Users</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search by username or email..." 
          className="form-control" 
          style={{ width: '300px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ width: '200px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ARTISAN">Artisan</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>ID</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Username</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Email / Phone</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Role</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Status</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Joined</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{u.id}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ padding: '1rem' }}>
                  <div>{u.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: u.role === 'ADMIN' ? '#f3e8ff' : u.role === 'ARTISAN' ? '#dbeafe' : '#f1f5f9', color: u.role === 'ADMIN' ? '#7e22ce' : u.role === 'ARTISAN' ? '#1d4ed8' : '#475569' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: u.active ? '#dcfce3' : '#fee2e2', color: u.active ? '#16a34a' : '#dc2626' }}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  {u.role !== 'ADMIN' && (
                    <button 
                      className="btn" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: u.active ? '#ef4444' : '#10b981', color: 'white', border: 'none' }}
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ManageUsers;
