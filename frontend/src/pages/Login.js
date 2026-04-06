import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} className="login-brand-logo" alt="Bhavishya Aqua Logo" />
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 32 }}>
            <span>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">System Identify / Username</label>
            <input
              className="form-control"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. admin_bhavishya"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Secure Access / Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Authenticating...</> : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
