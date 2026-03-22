import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const API = 'https://vino-delights-wine-shop.onrender.com/api';

export default function Checkout() {
  const { cart, cartTotal, fetchCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const shippingCost = cartTotal >= 5000 ? 0 : 299;
  const totalAmount = cartTotal + shippingCost;

  // Validation
  const validateForm = () => {
    // Full Name
    if (form.fullName.trim().length < 2) {
      setError('Please enter your full name');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Street
    if (form.street.trim().length < 5) {
      setError('Please enter a valid street address (at least 5 characters)');
      return false;
    }

    // City
    if (form.city.trim().length < 2) {
      setError('Please enter a valid city');
      return false;
    }

    // State
    if (form.state.trim().length < 2) {
      setError('Please enter a valid state');
      return false;
    }

    // Pincode - exactly 6 digits
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(form.pincode.trim())) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }

    // Phone - 10 digits (with optional +91 prefix)
    const cleanPhone = form.phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^(91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    return true;
  };

  const handleOnlinePayment = async () => {
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/payment/create-order`, {
        shippingAddress: form
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPendingOrderId(data.orderId);
      setShowPaymentModal(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await axios.post(`${API}/payment/verify`, {
        orderId: pendingOrderId,
        shippingAddress: form
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchCart();
      setShowPaymentModal(false);
      navigate('/orders');
    } catch (err) {
      setError('Payment verification failed. Contact support.');
      setShowPaymentModal(false);
    }
  };

  const handleCOD = async () => {
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API}/orders`, {
        shippingAddress: form
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (paymentMethod === 'online') {
      await handleOnlinePayment();
    } else {
      await handleCOD();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <h1>Checkout</h1>
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <p>Your cart is empty. Add some wines first!</p>
          <button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: '20px' }}>
            Browse Wines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button className="back-link" onClick={() => navigate('/cart')}>← Back to Cart</button>
      <h1>Checkout</h1>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h3 style={{ color: 'var(--cream)', marginBottom: '24px', fontSize: '20px' }}>Shipping Address</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>Email Address <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(from your account)</span></label>
            <input type="email" name="email" value={form.email} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          </div>
        </div>

        <div className="form-group">
          <label>Street Address</label>
          <input name="street" value={form.street} onChange={handleChange} placeholder="123 Wine Street, Apt 4" required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" required />
          </div>
          <div className="form-group">
            <label>State</label>
            <input name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pincode</label>
            <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" maxLength="6" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" required />
          </div>
        </div>

        {/* Payment Method Selection */}
        <h3 style={{ color: 'var(--cream)', marginBottom: '20px', marginTop: '32px', fontSize: '20px' }}>Payment Method</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <label
            style={{
              flex: 1,
              padding: '20px',
              background: paymentMethod === 'online' ? 'rgba(114, 47, 55, 0.2)' : 'var(--bg-glass)',
              border: `1px solid ${paymentMethod === 'online' ? 'var(--burgundy)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
              style={{ accentColor: 'var(--burgundy)' }}
            />
            <div>
              <div style={{ color: 'var(--cream)', fontWeight: '600', fontSize: '15px' }}>💳 Pay Online</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Cards, UPI, Net Banking</div>
            </div>
          </label>

          <label
            style={{
              flex: 1,
              padding: '20px',
              background: paymentMethod === 'cod' ? 'rgba(114, 47, 55, 0.2)' : 'var(--bg-glass)',
              border: `1px solid ${paymentMethod === 'cod' ? 'var(--burgundy)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              style={{ accentColor: 'var(--burgundy)' }}
            />
            <div>
              <div style={{ color: 'var(--cream)', fontWeight: '600', fontSize: '15px' }}>📦 Cash on Delivery</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Pay when you receive</div>
            </div>
          </label>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cart.map(item => (
            item.product && (
              <div className="checkout-item" key={item._id}>
                <span>{item.product.name} × {item.quantity}</span>
                <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            )
          ))}
          <div className="checkout-item">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
          {loading ? 'Processing...' : paymentMethod === 'online' ? '💳 Pay ₹' + totalAmount.toLocaleString() : '🍷 Place Order (COD)'}
        </button>
      </form>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          amount={totalAmount}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
