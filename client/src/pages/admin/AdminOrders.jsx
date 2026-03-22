import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API = 'http://localhost:5000/api';
const STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { token } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = () => {
    axios.get(`${API}/admin/orders`, { headers })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`${API}/admin/orders/${id}`, { status }, { headers });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
      toast.success(`Order #${id.slice(-6).toUpperCase()} → ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="admin-loading">Loading orders...</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-filter-tabs">
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              className={`admin-filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s} {s === 'All' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Location</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order._id}>
                <td className="monospace">#{order._id.slice(-6).toUpperCase()}</td>
                <td>
                  <div>{order.user?.name || 'N/A'}</div>
                  <div className="text-small">{order.user?.email}</div>
                </td>
                <td>
                  {order.items.map((item, i) => (
                    <div key={i} className="text-small">{item.name} × {item.quantity}</div>
                  ))}
                </td>
                <td className="text-gold">₹{order.totalAmount.toLocaleString()}</td>
                <td className="text-small">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </td>
                <td className="text-small">{formatDate(order.createdAt)}</td>
                <td>
                  <select
                    className={`status-select status-${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
