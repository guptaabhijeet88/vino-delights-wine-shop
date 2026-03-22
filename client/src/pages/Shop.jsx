import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import WineCard from '../components/WineCard';

const API = 'https://vino-delights-wine-shop.onrender.com/api';
const categories = ['All', 'Red', 'White', 'Rosé', 'Sparkling', 'Dessert'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    fetchWines();
  }, [category, sort]);

  const fetchWines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (sort !== 'default') params.append('sort', sort);

      const res = await axios.get(`${API}/products?${params.toString()}`);
      setWines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWines();
  };

  return (
    <div className="shop-page">
      <div className="section-header" style={{ paddingTop: '20px' }}>
        <span className="section-badge">The Cellar</span>
        <h2>Our Wine Collection</h2>
        <p>Browse our handpicked selection of exceptional wines from around the world</p>
      </div>

      <div className="shop-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}

        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="shop-search"
            placeholder="Search wines, regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select className="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="shop-grid">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : wines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: 'var(--cream)', marginBottom: '8px' }}>No wines found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="wine-grid">
            {wines.map(wine => (
              <WineCard key={wine._id} wine={wine} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
