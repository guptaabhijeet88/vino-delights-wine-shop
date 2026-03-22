import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function WineCard({ wine }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('vino_wishlist') || '[]');
    return saved.includes(wine._id);
  });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await addToCart(wine._id);
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('vino_wishlist') || '[]');
    let updated;
    if (wishlisted) {
      updated = saved.filter(id => id !== wine._id);
    } else {
      updated = [...saved, wine._id];
    }
    localStorage.setItem('vino_wishlist', JSON.stringify(updated));
    setWishlisted(!wishlisted);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.3;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star">★</span>);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  const discountPercent = wine.mrp && wine.mrp > wine.price
    ? Math.round(((wine.mrp - wine.price) / wine.mrp) * 100)
    : 0;

  return (
    <div className="wine-card" onClick={() => navigate(`/product/${wine._id}`)}>
      <div className="wine-card-image">
        {!imageLoaded && <div className="wine-card-img-skeleton"></div>}
        <img
          src={wine.image}
          alt={wine.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='375' height='500' viewBox='0 0 375 500'%3E%3Crect fill='%231a0a10' width='375' height='500'/%3E%3Ctext x='187' y='230' text-anchor='middle' font-size='60' fill='%23C5A572'%3E🍷%3C/text%3E%3Ctext x='187' y='280' text-anchor='middle' font-size='14' fill='%23888' font-family='sans-serif'%3EImage unavailable%3C/text%3E%3C/svg%3E";
            setImageLoaded(true);
          }}
        />
        {/* Top badges row */}
        <div className="wine-card-badges-top">
          <span className="wine-card-category">{wine.category}</span>
          {wine.featured && <span className="wine-card-featured">★ Featured</span>}
        </div>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="wine-card-discount">-{discountPercent}%</span>
        )}

        {/* Wishlist heart */}
        <button
          className={`wine-card-wishlist ${wishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>

        {/* Quick add overlay */}
        <div className="wine-card-overlay">
          <button className="wine-card-quick-add" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
        </div>
      </div>

      <div className="wine-card-body">
        <div className="wine-card-region">
          📍 {wine.region} {wine.year && `· ${wine.year}`}
        </div>
        <h3 className="wine-card-name">{wine.name}</h3>
        <div className="wine-card-rating">
          <div className="wine-card-stars">{renderStars(wine.rating)}</div>
          <span className="wine-card-rating-num">{wine.rating}</span>
        </div>
        <div className="wine-card-divider"></div>
        <div className="wine-card-footer">
          <div className="wine-card-price-block">
            <div className="wine-card-price">₹{wine.price.toLocaleString()}</div>
            {wine.mrp && wine.mrp > wine.price && (
              <div className="wine-card-mrp">₹{wine.mrp.toLocaleString()}</div>
            )}
          </div>
          <div className="wine-card-volume-tag">
            {wine.volume}
          </div>
        </div>
      </div>
    </div>
  );
}
