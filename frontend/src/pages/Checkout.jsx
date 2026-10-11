import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { responseData, responseList } from '../api/response';
import { cartItemName, cartItemPrice, cartItemQuantity } from '../api/cart';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: '', phone: '', shippingAddress: '', paymentMethod: 'RAZORPAY' });

  useEffect(() => {
    api.get('/api/cart').then(res => {
      const items = responseList(res);
      setCartItems(items);
      if (items.length === 0) navigate('/cart');
    }).catch(console.error).finally(() => setLoading(false));
  }, [navigate]);

  const subtotal = cartItems.reduce((acc, item) => acc + cartItemPrice(item) * cartItemQuantity(item), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const totalAmount = subtotal + shipping;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Create order
      const orderRes = await api.post('/api/orders', {
        shippingAddress: formData.shippingAddress,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod
      });
      const orderId = responseData(orderRes).id;

      if (formData.paymentMethod === 'RAZORPAY') {
        // 2. Init Razorpay
        const rzInit = await api.post(`/api/payment/create-order/${orderId}`);
        const { orderId: rzOrderId, keyId, amount } = responseData(rzInit);

        const options = {
          key: keyId,
          amount: amount,
          currency: "INR",
          name: "Artisan Connect",
          description: "Purchase of handcrafted items",
          order_id: rzOrderId,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              await api.post('/api/payment/verify', {
                orderId: orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              navigate('/orders');
            } catch (err) {
              alert('Payment verification failed.');
              navigate('/orders'); // still navigate, order is unpaid
            }
          },
          prefill: { name: formData.fullName, contact: formData.phone },
          theme: { color: "#8b5a2b" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setSubmitting(false); // keep false, waiting for modal
      } else {
        // COD
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const message = err.response?.status === 403
        ? 'This account cannot place shopper orders. Log in with a shopper account to complete checkout.'
        : serverMessage || 'Could not place your order. Please try again.';
      alert(message);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Form */}
        <div style={{ flex: '2', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Shipping Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-control" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Complete Address</label>
              <textarea name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} className="form-control" rows="4" required placeholder="House/Flat No, Street, Landmark, City, State, Pincode" />
            </div>

            <h3 style={{ marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="RAZORPAY" checked={formData.paymentMethod === 'RAZORPAY'} onChange={handleChange} />
                <b>Razorpay (Cards, UPI, NetBanking)</b>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} />
                <b>Cash on Delivery (COD)</b>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }} disabled={submitting}>
              {submitting ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div style={{ flex: '1', background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{cartItemQuantity(item)}x {cartItemName(item)}</span>
                <span>₹{(cartItemPrice(item) * cartItemQuantity(item)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.5rem' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.5rem' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <span>Total Payable</span>
            <span style={{ color: 'var(--primary)' }}>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
