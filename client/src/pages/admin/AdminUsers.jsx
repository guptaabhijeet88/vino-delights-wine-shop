import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API = 'https://vino-delights-wine-shop.onrender.com/api';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = () => {
    axios.get(`${API}/admin/users`, { headers })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    const userName = users.find(u => u._id === id)?.name || 'User';
    if (!window.confirm(`Change ${userName}'s role to "${role}"?`)) return;
    try {
      const { data } = await axios.put(`${API}/admin/users/${id}/role`, { role }, { headers });
      setUsers(prev => prev.map(u => u._id === id ? data : u));
      toast.success(`${data.name} is now ${role === 'admin' ? 'an Admin 👑' : 'a regular User 👤'}`);
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="admin-toolbar-info">
          Total: {users.length} users · {users.filter(u => u.role === 'admin').length} admins
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="text-small">{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                    {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </td>
                <td className="text-small">{formatDate(u.createdAt)}</td>
                <td>
                  {u._id !== currentUser?.id ? (
                    <button
                      className={`admin-btn small ${u.role === 'admin' ? 'danger' : 'primary'}`}
                      onClick={() => changeRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                    >
                      {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  ) : (
                    <span className="text-small text-muted">You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
