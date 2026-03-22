import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WineCard from '../components/WineCard';

const API = 'http://localhost:5000/api';

// Animated counter hook
function useCountUp(target, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startCounting || hasAnimated.current) return;
    hasAnimated.current = true;

    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, startCounting]);

  return count;
}

// Scroll reveal hook
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function StatItem({ icon, target, suffix, label }) {
  const [ref, visible] = useReveal();
  const count = useCountUp(target, 2000, visible);
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">{count.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [ageVerified, setAgeVerified] = useState(
    localStorage.getItem('vino_age_verified') === 'true'
  );

  const [featuredRef, featuredVisible] = useReveal();
  const [testimonialsRef, testimonialsVisible] = useReveal();
  const [newsletterRef, newsletterVisible] = useReveal();

  useEffect(() => {
    axios.get(`${API}/products?featured=true`)
      .then(res => setFeatured(res.data.slice(0, 8)))
      .catch(err => console.error(err));
  }, []);

  const verifyAge = () => {
    localStorage.setItem('vino_age_verified', 'true');
    setAgeVerified(true);
  };

  return (
    <>
      {/* Age Gate */}
      {!ageVerified && (
        <div className="age-gate">
          <div className="age-gate-card">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍷</div>
            <h2>Welcome to Vino Delights</h2>
            <p>You must be of legal drinking age to enter this website. Are you 21 years or older?</p>
            <div className="age-gate-buttons">
              <button className="btn-primary" onClick={verifyAge}>Yes, I'm 21+</button>
              <button className="btn-secondary" onClick={() => window.location.href = 'https://www.google.com'}>
                No, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">✦ Est. 2020 · Premium Wine Collection</span>
          <h1>Discover the Art of <span>Fine Wine</span></h1>
          <p>
            Explore our curated collection of the world's most exquisite wines — 
            from iconic Bordeaux estates to pristine New Zealand vineyards.
          </p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn-primary">Explore Collection →</Link>
            <a href="#featured" className="btn-secondary">Our Selections</a>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <div className="features-strip">
        <div className="feature-item">
          <div className="feature-icon">🌍</div>
          <h4>Worldwide Selection</h4>
          <p>Wines from 15+ renowned regions across the globe</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🏆</div>
          <h4>Award Winners</h4>
          <p>Only top-rated and critically acclaimed wines</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📦</div>
          <h4>Express Delivery</h4>
          <p>Temperature-controlled shipping within 48 hours</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">✨</div>
          <h4>Expert Curated</h4>
          <p>Hand-selected by our team of certified sommeliers</p>
        </div>
      </div>

      {/* Wine Experience Video */}
      <section className="wine-video-section">
        <div className="wine-video-container">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="wine-video"
          >
            <source src="/videos/Video_Generation_Request_Fulfilled.mp4" type="video/mp4" />
          </video>
          <div className="wine-video-overlay"></div>
          <div className="wine-video-text">
            <span className="wine-video-badge">🎬 The Vino Experience</span>
            <h2>Elegance in Every Sip</h2>
            <p>From vineyard to glass — discover the passion behind every bottle in our collection.</p>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="stats-section">
        <StatItem icon="🍷" target={500} suffix="+" label="Premium Wines" />
        <StatItem icon="😊" target={10000} suffix="+" label="Happy Customers" />
        <StatItem icon="🌍" target={50} suffix="+" label="Wine Regions" />
        <StatItem icon="⭐" target={4} suffix=".8" label="Average Rating" />
      </section>

      {/* Featured Wines */}
      <section
        id="featured"
        ref={featuredRef}
        className={`section reveal-section ${featuredVisible ? 'revealed' : ''}`}
      >
        <div className="section-header">
          <span className="section-badge">Our Collection</span>
          <h2>Featured Wines</h2>
          <p>Hand-picked selections from the world's most celebrated vineyards</p>
        </div>
        <div className="wine-grid">
          {featured.map(wine => (
            <WineCard key={wine._id} wine={wine} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link to="/shop" className="btn-secondary">View All Wines →</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        className={`section reveal-section ${testimonialsVisible ? 'revealed' : ''}`}
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2>What Our Clients Say</h2>
          <p>Trusted by wine enthusiasts and connoisseurs worldwide</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              The Château Margaux was absolutely divine. Vino Delights' packaging and delivery 
              were impeccable — the bottle arrived in perfect condition.
            </p>
            <div className="testimonial-author">Maria Laurent</div>
            <div className="testimonial-role">Wine Collector, Paris</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              I've been ordering from Vino Delights for over a year now. Their curation is 
              unmatched, and the sommelier notes with each bottle are a wonderful touch.
            </p>
            <div className="testimonial-author">James Wellington</div>
            <div className="testimonial-role">Restaurateur, London</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              Exceptional selection, fair prices, and a website that makes browsing a pleasure. 
              The Dom Pérignon for my anniversary was the perfect choice.
            </p>
            <div className="testimonial-author">Priya Sharma</div>
            <div className="testimonial-role">Wine Enthusiast, Mumbai</div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        ref={newsletterRef}
        className={`newsletter reveal-section ${newsletterVisible ? 'revealed' : ''}`}
      >
        <h2>Join the Cellar Club</h2>
        <p>Get exclusive access to limited releases, private tastings, and 10% off your first order.</p>
        <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed! 🍷'); }}>
          <input type="email" placeholder="Enter your email address" required />
          <button type="submit" className="btn-primary btn-small">Subscribe</button>
        </form>
      </section>
    </>
  );
}
