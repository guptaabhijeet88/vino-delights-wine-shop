import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Orders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setOrders(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const getStatusClass = (status) => {
    return `order-status status-${status.toLowerCase()}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="orders-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🔐</div>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your orders</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="orders-page">
      <div className="loading-container"><div className="loading-spinner"></div></div>
    </div>
  );

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start exploring our collection!</p>
          <Link to="/shop" className="btn-primary">Browse Wines</Link>
        </div>
      ) : (
        orders.map(order => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <div>
                <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
                <div className="order-date">{formatDate(order.createdAt)}</div>
              </div>
              <span className={getStatusClass(order.status)}>{order.status}</span>
            </div>

            <div className="order-items">
              {order.items.map((item, idx) => (
                <div className="order-item" key={idx}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                📍 {order.shippingAddress.city}, {order.shippingAddress.state}
              </div>
              <div className="order-total">₹{order.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
