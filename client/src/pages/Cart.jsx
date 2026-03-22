import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🔐</div>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your cart</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1>Shopping Cart</h1>
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Discover our exquisite wine collection and add your favorites</p>
          <Link to="/shop" className="btn-primary">Browse Wines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h1>

      {cart.map(item => (
        item.product && (
          <div className="cart-item" key={item._id}>
            <div className="cart-item-image">
              <img src={item.product.image} alt={item.product.name} />
            </div>
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.product.name}</h3>
              <div className="cart-item-region">
                📍 {item.product.region} · {item.product.category}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div className="quantity-controls" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                  <button className="qty-btn" onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="cart-item-actions">
              <button className="btn-remove" onClick={() => removeFromCart(item.product._id)} title="Remove">✕</button>
              <div className="cart-item-price">₹{(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
          </div>
        )
      ))}

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>₹{cartTotal.toLocaleString()}</span>
        </div>
        <div className="cart-summary-row">
          <span>Shipping</span>
          <span style={{ color: 'var(--gold)' }}>{cartTotal >= 5000 ? 'Free' : '₹299'}</span>
        </div>
        <div className="cart-summary-row total">
          <span>Total</span>
          <span>₹{(cartTotal + (cartTotal >= 5000 ? 0 : 299)).toLocaleString()}</span>
        </div>
        {cartTotal < 5000 && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Add ₹{(5000 - cartTotal).toLocaleString()} more for free shipping
          </p>
        )}
        <div className="cart-actions">
          <Link to="/shop" className="btn-secondary btn-small">Continue Shopping</Link>
          <button className="btn-primary btn-small" onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
