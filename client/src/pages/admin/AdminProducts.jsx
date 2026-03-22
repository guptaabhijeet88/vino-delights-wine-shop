import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API = 'https://vino-delights-wine-shop.onrender.com/api';

const emptyProduct = {
  name: '', description: '', price: '', category: 'Red', region: '',
  year: '', rating: 4, image: '', stock: 50, volume: '750ml',
  alcoholContent: '', featured: false
};

export default function AdminProducts() {
  const { token } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = () => {
    axios.get(`${API}/admin/products`, { headers })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name, description: product.description, price: product.price,
      category: product.category, region: product.region, year: product.year || '',
      rating: product.rating, image: product.image, stock: product.stock,
      volume: product.volume, alcoholContent: product.alcoholContent || '', featured: product.featured
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock), rating: Number(form.rating), year: form.year ? Number(form.year) : undefined };
      if (editing) {
        await axios.put(`${API}/admin/products/${editing}`, data, { headers });
        toast.success('Product updated successfully!');
      } else {
        await axios.post(`${API}/admin/products`, data, { headers });
        toast.success('Product added successfully!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/admin/products/${id}`, { headers });
      toast.success(`"${name}" deleted`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const { data } = await axios.put(`${API}/admin/products/${product._id}`, {
        featured: !product.featured
      }, { headers });
      setProducts(prev => prev.map(p => p._id === product._id ? data : p));
      toast.success(data.featured ? `"${data.name}" added to featured!` : `"${data.name}" removed from featured`);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading products...</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="admin-btn primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id}>
                <td>
                  <div className="product-cell">
                    <img
                      src={p.image}
                      alt=""
                      className="admin-thumb"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <div className="product-cell-name">{p.name}</div>
                      <div className="product-cell-region">{p.region}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-category">{p.category}</span></td>
                <td>₹{p.price.toLocaleString()}</td>
                <td><span className={p.stock < 10 ? 'text-danger' : ''}>{p.stock}</span></td>
                <td>{'★'.repeat(Math.round(p.rating))}</td>
                <td>
                  <button
                    className={`featured-toggle ${p.featured ? 'active' : ''}`}
                    onClick={() => toggleFeatured(p)}
                    title={p.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {p.featured ? '⭐' : '☆'}
                  </button>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="admin-btn small" onClick={() => openEdit(p)}>Edit</button>
                    <button className="admin-btn small danger" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="pm-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-field full">
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="admin-field">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option>Red</option><option>White</option><option>Rosé</option>
                    <option>Sparkling</option><option>Dessert</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Price (₹)</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} required />
                </div>
                <div className="admin-field">
                  <label>Region</label>
                  <input name="region" value={form.region} onChange={handleChange} required />
                </div>
                <div className="admin-field">
                  <label>Year</label>
                  <input name="year" type="number" value={form.year} onChange={handleChange} />
                </div>
                <div className="admin-field">
                  <label>Stock</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
                </div>
                <div className="admin-field">
                  <label>Rating</label>
                  <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} />
                </div>
                <div className="admin-field">
                  <label>Volume</label>
                  <input name="volume" value={form.volume} onChange={handleChange} />
                </div>
                <div className="admin-field">
                  <label>Alcohol %</label>
                  <input name="alcoholContent" value={form.alcoholContent} onChange={handleChange} />
                </div>
                <div className="admin-field full">
                  <label>Image URL</label>
                  <input name="image" value={form.image} onChange={handleChange} required />
                </div>
                <div className="admin-field full">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} required />
                </div>
                <div className="admin-field">
                  <label className="admin-checkbox">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                    Featured Product
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
