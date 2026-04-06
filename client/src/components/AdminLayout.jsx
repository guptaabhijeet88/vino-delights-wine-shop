import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path ? 'admin-nav-item active' : 'admin-nav-item';

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <span className="admin-logo">🍷</span>
          <div>
            <div className="admin-brand">Vino Admin</div>
            <div className="admin-role">Dashboard</div>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/admin" className={isActive('/admin')}>
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products')}>
            <span className="admin-nav-icon">🍷</span>
            <span>Products</span>
          </Link>
          <Link to="/admin/orders" className={isActive('/admin/orders')}>
            <span className="admin-nav-icon">📦</span>
            <span>Orders</span>
          </Link>
          <Link to="/admin/users" className={isActive('/admin/users')}>
            <span className="admin-nav-icon">👥</span>
            <span>Users</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <span className="admin-nav-icon">🏪</span>
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h2 className="admin-page-title">
              {location.pathname === '/admin' && 'Dashboard Overview'}
              {location.pathname === '/admin/products' && 'Product Management'}
              {location.pathname === '/admin/orders' && 'Order Management'}
              {location.pathname === '/admin/users' && 'User Management'}
            </h2>
          </div>
          <div className="admin-header-right">
            <span className="admin-user-badge">👑 {user?.name}</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
