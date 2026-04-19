import axios from 'axios';

const API = 'https://vino-delights-wine-shop.onrender.com/api';

// In-memory cache with timestamps
const cache = {
  allProducts: { data: null, timestamp: 0 },
  featuredProducts: { data: null, timestamp: 0 },
  categoryProducts: {}, // { [category]: { data, timestamp } }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(entry) {
  return entry && entry.data && (Date.now() - entry.timestamp) < CACHE_DURATION;
}

// Warm up the cache on app load — fire and forget
export function prefetchProducts() {
  // Prefetch all products
  if (!isCacheValid(cache.allProducts)) {
    axios.get(`${API}/products`)
      .then(res => {
        cache.allProducts = { data: res.data, timestamp: Date.now() };
        // Also populate featured cache from the full list
        const featured = res.data.filter(p => p.featured);
        if (featured.length > 0) {
          cache.featuredProducts = { data: featured, timestamp: Date.now() };
        }
      })
      .catch(() => {}); // silent fail — user will still get data on page load
  }
}

// Get all products with optional filters — uses stale-while-revalidate
export async function getCachedProducts(params = {}) {
  const { category, search, sort, featured } = params;

  // For featured products
  if (featured === 'true' && !category && !search && !sort) {
    if (isCacheValid(cache.featuredProducts)) {
      // Return cached immediately, refresh in background
      refreshAllProducts();
      return cache.featuredProducts.data;
    }
  }

  // For specific category (no search/sort)
  if (category && category !== 'All' && !search && (!sort || sort === 'default')) {
    const catCache = cache.categoryProducts[category];
    if (isCacheValid(catCache)) {
      refreshCategoryProducts(category);
      return catCache.data;
    }
  }

  // For unfiltered "All" products
  if ((!category || category === 'All') && !search && (!sort || sort === 'default')) {
    if (isCacheValid(cache.allProducts)) {
      refreshAllProducts();
      return cache.allProducts.data;
    }
  }

  // Cache miss — fetch fresh
  const queryParams = new URLSearchParams();
  if (category && category !== 'All') queryParams.append('category', category);
  if (search) queryParams.append('search', search);
  if (sort && sort !== 'default') queryParams.append('sort', sort);
  if (featured) queryParams.append('featured', featured);

  const res = await axios.get(`${API}/products?${queryParams.toString()}`);
  const data = res.data;

  // Update relevant caches
  if (featured === 'true') {
    cache.featuredProducts = { data, timestamp: Date.now() };
  } else if (category && category !== 'All' && !search && (!sort || sort === 'default')) {
    cache.categoryProducts[category] = { data, timestamp: Date.now() };
  } else if ((!category || category === 'All') && !search && (!sort || sort === 'default')) {
    cache.allProducts = { data, timestamp: Date.now() };
  }

  return data;
}

// Background refreshers
function refreshAllProducts() {
  axios.get(`${API}/products`)
    .then(res => {
      cache.allProducts = { data: res.data, timestamp: Date.now() };
      const featured = res.data.filter(p => p.featured);
      if (featured.length > 0) {
        cache.featuredProducts = { data: featured, timestamp: Date.now() };
      }
    })
    .catch(() => {});
}

function refreshCategoryProducts(category) {
  axios.get(`${API}/products?category=${category}`)
    .then(res => {
      cache.categoryProducts[category] = { data: res.data, timestamp: Date.now() };
    })
    .catch(() => {});
}

// Invalidate cache (call after admin add/edit/delete)
export function invalidateProductCache() {
  cache.allProducts = { data: null, timestamp: 0 };
  cache.featuredProducts = { data: null, timestamp: 0 };
  cache.categoryProducts = {};
}
