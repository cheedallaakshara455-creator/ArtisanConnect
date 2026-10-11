import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast, ToastContainer } from '../../components/Toast';
import { responseList } from '../../api/response';

const ManageOrders = () => {
  const { toasts, showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    api.get('/api/admin/orders')
      .then(res => setOrders(responseList(res)))
      .catch(() => showToast('Failed to fetch orders', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/orders/${id}/status?status=${newStatus}`);
      showToast(`Order #${id} status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  const filteredOrders = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  if (loading && orders.length === 0) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <ToastContainer toasts={toasts} />
      <h1 style={{ marginBottom: '2rem' }}>Manage Orders (All Platform)</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <select className="form-control" style={{ width: '250px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Order#</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Customer</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Date</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Total</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Status</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div>{o.user?.username || 'Unknown'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  {new Date(o.orderDate).toLocaleString()}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ₹{o.totalAmount.toFixed(2)}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: '#f1f5f9' }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    className="form-control" 
                    style={{ padding: '0.4rem', fontSize: '0.9rem', width: '130px' }}
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ManageOrders;
