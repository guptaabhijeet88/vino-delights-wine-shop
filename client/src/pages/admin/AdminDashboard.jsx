import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;
  if (!stats) return <div className="admin-loading">Failed to load stats</div>;

  const formatCurrency = (n) => '₹' + n.toLocaleString();

  return (
    <div className="admin-dashboard">
      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon products">🍷</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Products</div>
          </div>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="admin-row">
        <div className="admin-card">
          <h3>Order Status Breakdown</h3>
          <div className="status-bars">
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span>Confirmed</span>
                <span>{stats.confirmedOrders}</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill confirmed" style={{ width: stats.totalOrders ? `${(stats.confirmedOrders / stats.totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span>Shipped</span>
                <span>{stats.shippedOrders}</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill shipped" style={{ width: stats.totalOrders ? `${(stats.shippedOrders / stats.totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span>Delivered</span>
                <span>{stats.deliveredOrders}</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill delivered" style={{ width: stats.totalOrders ? `${(stats.deliveredOrders / stats.totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>Monthly Revenue</h3>
          <div className="chart-bars">
            {stats.monthlyRevenue.map((m, i) => (
              <div key={i} className="chart-bar-col">
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(4, (m.revenue / Math.max(...stats.monthlyRevenue.map(x => x.revenue || 1))) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="chart-bar-label">{m.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Selling */}
      <div className="admin-row">
        <div className="admin-card">
          <h3>Recent Orders</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="monospace">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card narrow">
          <h3>Low Stock Alert</h3>
          <div className="low-stock-list">
            {stats.lowStock.map((p, i) => (
              <div key={i} className="low-stock-item">
                <div className="low-stock-name">{p.name}</div>
                <span className={`badge ${p.stock < 5 ? 'badge-critical' : 'badge-warning'}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
            {stats.lowStock.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>All stocked up! ✓</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
