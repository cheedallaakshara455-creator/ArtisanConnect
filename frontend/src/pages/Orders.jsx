import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { responseList } from '../api/response';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const endpoint = user?.role === 'ARTISAN' ? '/api/orders/artisan' : '/api/orders/my';
    api.get(endpoint)
      .then(res => {
        setOrders(responseList(res));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff7ed', text: '#ea580c' }; // Orange
      case 'PAID': return { bg: '#eff6ff', text: '#2563eb' }; // Blue
      case 'PROCESSING': return { bg: '#f3e8ff', text: '#9333ea' }; // Purple
      case 'SHIPPED': return { bg: '#ccfbf1', text: '#0d9488' }; // Teal
      case 'DELIVERED': return { bg: '#dcfce3', text: '#16a34a' }; // Green
      case 'CANCELLED': return { bg: '#fee2e2', text: '#dc2626' }; // Red
      default: return { bg: '#f3f4f6', text: '#4b5563' }; // Gray
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>{user?.role === 'ARTISAN' ? 'Customer Orders' : 'My Orders'}</h1>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ margin: '0 0 1rem 0' }}>No orders found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You don't have any {user?.role === 'ARTISAN' ? 'incoming' : 'past'} orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const statusStyle = getStatusColor(order.status);
            return (
              <div key={order.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {/* Header */}
                <div 
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', cursor: 'pointer', background: expandedId === order.id ? '#f8fafc' : 'white', transition: 'background 0.2s' }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Order #{order.id}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(order.orderDate).toLocaleString()}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{order.totalAmount.toFixed(2)}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.orderItems?.length || 0} items</div>
                    </div>
                    <div style={{ background: statusStyle.bg, color: statusStyle.text, padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {order.status}
                    </div>
                    <div style={{ transform: expandedId === order.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* Details */}
                {expandedId === order.id && (
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', background: '#fafafa' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 1rem 0' }}>Shipping Info</h4>
                        <div style={{ color: 'var(--text-dark)', lineHeight: 1.6 }}>
                          {user?.role === 'ARTISAN' && order.user && (
                            <div><b>Customer:</b> {order.user.username} ({order.user.email})</div>
                          )}
                          <div><b>Phone:</b> {order.phone}</div>
                          <div><b>Address:</b><br/>{order.shippingAddress}</div>
                          <div style={{ marginTop: '0.5rem' }}><b>Payment:</b> {order.paymentMethod}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ margin: '0 0 1rem 0' }}>Items</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {order.orderItems?.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                {item.productImage ? <img src={item.productImage} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>🏺</div>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</div>
                              </div>
                              <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Orders;
