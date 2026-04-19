import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import WineCard from '../components/WineCard';
import { SkeletonGrid } from '../components/SkeletonWineCard';
import { getCachedProducts } from '../utils/productCache';

const categories = ['All', 'Red', 'White', 'Rosé', 'Sparkling', 'Dessert'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const prevRequest = useRef(0);

  useEffect(() => {
    fetchWines();
  }, [category, sort]);

  const fetchWines = async () => {
    const requestId = ++prevRequest.current;
    try {
      setLoading(true);
      const data = await getCachedProducts({
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        sort: sort !== 'default' ? sort : undefined,
      });
      // Only update if this is still the latest request
      if (requestId === prevRequest.current) {
        setWines(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (requestId === prevRequest.current) {
        setLoading(false);
      }
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
          <SkeletonGrid count={12} />
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
