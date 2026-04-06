import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-brand">
        <span className="nav-brand-icon">🍷</span>
        <span className="nav-brand-text">Vino Delights</span>
      </Link>

      <ul className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
        <li><Link to="/" className={isActive('/')}>Home</Link></li>
        <li><Link to="/shop" className={isActive('/shop')}>Shop</Link></li>
        {user && <li><Link to="/orders" className={isActive('/orders')}>Orders</Link></li>}
        {user?.role === 'admin' && (
          <li><Link to="/admin" className={`${isActive('/admin')} admin-link`}>⚙ Admin</Link></li>
        )}
        {/* Mobile-only auth actions inside the menu */}
        <li className="nav-mobile-auth">
          {user ? (
            <>
              <span className="nav-user-name">Hi, {user.name.split(' ')[0]}</span>
              <button className="nav-auth-btn btn-logout" onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-auth-btn btn-login" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </li>
      </ul>

      <div className="nav-actions">
        <Link to="/cart" className="nav-cart">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            <span className="nav-user-name nav-desktop-only">Hi, {user.name.split(' ')[0]}</span>
            <button className="nav-auth-btn btn-logout nav-desktop-only" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-auth-btn btn-login nav-desktop-only">Sign In</Link>
        )}

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
