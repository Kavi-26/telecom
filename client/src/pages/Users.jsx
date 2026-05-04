import { useState, useEffect } from 'react';
import { User, UserPlus, Mail, Shield, Trash2, Edit2, Search, X, Check } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', role: 'operator', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, email: user.email, role: user.role, password: '' });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', role: 'operator', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Error saving user');
    }
  };

  const handleExport = (type) => {
    const columns = [
      { header: 'Username', dataKey: 'username' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Role', dataKey: 'role' },
      { header: 'Created At', dataKey: 'created_at' }
    ];

    if (type === 'excel') {
      exportToExcel(users, `User_List_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(users, columns, 'System Users List', `Users_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      <Navbar 
        title="User Management" 
        subtitle={`Displaying ${users.length} registered personnel from system database`} 
        onRefresh={fetchUsers}
      />

      <header className="users-header">
        <div className="header-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}>Excel</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}>PDF</button>
            <button className="add-btn" onClick={() => handleOpenModal()}>
              <UserPlus size={18} /> Add New User
            </button>
          </div>
        </div>
      </header>

      <div className="users-grid">
        {filteredUsers.map(u => (
          <div key={u.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div className={`user-badge ${u.role}`}>{u.role.replace('_', ' ')}</div>
            </div>
            <div className="user-card-body">
              <h3>{u.username}</h3>
              <p><Mail size={14} /> {u.email}</p>
              <p><Shield size={14} /> {u.role === 'admin' ? 'Full System Access' : 'Dashboard Access Only'}</p>
            </div>
            <div className="user-card-footer">
              <button className="icon-btn edit" onClick={() => handleOpenModal(u)} title="Edit User"><Edit2 size={16} /></button>
              <button className="icon-btn delete" onClick={() => handleDelete(u.id)} title="Delete User"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No users found matching your search.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="admin">Administrator</option>
                  <option value="noc_manager">NOC Manager</option>
                  <option value="noc_supervisor">NOC Supervisor</option>
                  <option value="ran_engineer">RAN Engineer</option>
                  <option value="core_engineer">CORE Engineer</option>
                  <option value="ip_engineer">IP Transport Engineer</option>
                  <option value="analyst">Network Analyst</option>
                  <option value="operator">System Operator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password {editingUser && '(Leave blank to keep current)'}</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">
                  <Check size={18} /> {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
