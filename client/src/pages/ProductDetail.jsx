import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import WineCard from '../components/WineCard';

const API = 'http://localhost:5000/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Wishlist
  const [wishlisted, setWishlisted] = useState(false);

  // Image zoom
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    axios.get(`${API}/products/${id}`)
      .then(res => {
        setProduct(res.data);
        // Check wishlist
        const saved = JSON.parse(localStorage.getItem('vino_wishlist') || '[]');
        setWishlisted(saved.includes(res.data._id));
        // Fetch related products (same category)
        return axios.get(`${API}/products?category=${res.data.category}`);
      })
      .then(res => {
        setRelatedProducts(res.data.filter(p => p._id !== id).slice(0, 4));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch reviews
    fetchReviews();
  }, [id]);

  const fetchReviews = () => {
    axios.get(`${API}/reviews/${id}`)
      .then(res => {
        setReviews(res.data.reviews);
        setReviewCount(res.data.count);
        setAvgRating(res.data.avgRating);
      })
      .catch(err => console.error(err));
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const success = await addToCart(product._id, quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('vino_wishlist') || '[]');
    let updated;
    if (wishlisted) {
      updated = saved.filter(wid => wid !== product._id);
    } else {
      updated = [...saved, product._id];
    }
    localStorage.setItem('vino_wishlist', JSON.stringify(updated));
    setWishlisted(!wishlisted);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setReviewError('');
    try {
      await axios.post(`${API}/reviews/${id}`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`${API}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'empty'}`} style={{ fontSize: '20px' }}>★</span>
      );
    }
    return stars;
  };

  const renderClickableStars = (currentRating, onChange) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star review-star-picker ${i <= currentRating ? '' : 'empty'}`}
          onClick={() => onChange(i)}
        >★</span>
      );
    }
    return stars;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const discountPercent = product?.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  if (loading) return (
    <div className="product-detail">
      <div className="loading-container"><div className="loading-spinner"></div></div>
    </div>
  );

  if (!product) return (
    <div className="product-detail" style={{ textAlign: 'center', padding: '200px 20px' }}>
      <h2>Product not found</h2>
      <button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: '20px' }}>
        Back to Shop
      </button>
    </div>
  );

  // Check if current user already reviewed
  const userHasReviewed = user && reviews.some(r => r.user?._id === user.id);

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div style={{ padding: '0 60px 0 0' }}>
          <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
          <div
            className={`product-detail-image zoom-container ${isZooming ? 'zooming' : ''}`}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleImageMouseMove}
          >
            <img
              src={product.image}
              alt={product.name}
              style={isZooming ? {
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: 'scale(1.8)'
              } : {}}
            />
            {discountPercent > 0 && (
              <span className="product-discount-badge">-{discountPercent}% OFF</span>
            )}
          </div>
        </div>

        <div className="product-detail-info">
          <div className="product-detail-top-row">
            <span className="product-detail-category">{product.category}</span>
            <button
              className={`wishlist-btn-detail ${wishlisted ? 'active' : ''}`}
              onClick={toggleWishlist}
              title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {wishlisted ? '❤️' : '🤍'} {wishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
          <h1>{product.name}</h1>
          <div className="product-detail-region">
            📍 {product.region} {product.year && `· ${product.year}`}
          </div>
          <div className="product-rating-summary">
            <div className="stars-row">
              {renderStars(avgRating || product.rating)}
            </div>
            <span className="rating-number">{avgRating || product.rating}/5</span>
            <span className="review-count-badge">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="product-pricing">
            <div className="product-detail-price">₹{product.price.toLocaleString()}</div>
            {product.mrp && product.mrp > product.price && (
              <>
                <div className="product-detail-mrp">₹{product.mrp.toLocaleString()}</div>
                <div className="product-detail-discount-badge">{discountPercent}% OFF</div>
              </>
            )}
          </div>
          <p className="product-detail-desc">{product.description}</p>

          <div className="product-meta">
            <div className="product-meta-item">
              <div className="product-meta-label">Volume</div>
              <div className="product-meta-value">{product.volume}</div>
            </div>
            <div className="product-meta-item">
              <div className="product-meta-label">Alcohol</div>
              <div className="product-meta-value">{product.alcoholContent || 'N/A'}</div>
            </div>
            <div className="product-meta-item">
              <div className="product-meta-label">Stock</div>
              <div className="product-meta-value">{product.stock > 0 ? `${product.stock} left` : 'Sold Out'}</div>
            </div>
          </div>

          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div className="product-detail-actions">
            <button
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {added ? '✓ Added to Cart!' : product.stock === 0 ? 'Sold Out' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Reviews Section ===== */}
      <section className="reviews-section">
        <div className="section-header">
          <span className="section-badge">Customer Reviews</span>
          <h2>What People Say</h2>
          <p>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} · {avgRating || product.rating}★ average rating</p>
        </div>

        {/* Review Form */}
        {user && !userHasReviewed && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="review-form-stars">
              <label>Your Rating:</label>
              <div className="star-picker">
                {renderClickableStars(reviewForm.rating, (r) => setReviewForm(f => ({ ...f, rating: r })))}
              </div>
            </div>
            <input
              type="text"
              className="review-input"
              placeholder="Review title (e.g., Amazing wine!)"
              value={reviewForm.title}
              onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))}
              required
              maxLength={100}
            />
            <textarea
              className="review-textarea"
              placeholder="Share your experience with this wine... What did you like? How did it taste? What did you pair it with?"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              required
              maxLength={1000}
              rows={4}
            />
            {reviewError && <div className="review-error">{reviewError}</div>}
            <button type="submit" className="btn-primary btn-small" disabled={submitting}>
              {submitting ? 'Submitting...' : '✍️ Submit Review'}
            </button>
          </form>
        )}

        {!user && (
          <div className="review-login-prompt">
            <p>Want to share your experience? <span onClick={() => navigate('/login')}>Log in to write a review</span></p>
          </div>
        )}

        {userHasReviewed && (
          <div className="review-login-prompt">
            <p>✅ You've already reviewed this product. Thank you for your feedback!</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar">{getInitials(review.user?.name)}</div>
                  <div className="review-meta">
                    <div className="review-author">{review.user?.name || 'Anonymous'}</div>
                    <div className="review-date">{formatDate(review.createdAt)}</div>
                  </div>
                  <div className="review-rating-badge">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <h4 className="review-title">{review.title}</h4>
                <p className="review-comment">{review.comment}</p>
                {user && review.user?._id === user.id && (
                  <button className="review-delete-btn" onClick={() => handleDeleteReview(review._id)}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===== Related Products ===== */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="section-header">
            <span className="section-badge">You May Also Like</span>
            <h2>Similar Wines</h2>
            <p>More wines from the {product.category} collection</p>
          </div>
          <div className="wine-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {relatedProducts.map(wine => (
              <WineCard key={wine._id} wine={wine} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
