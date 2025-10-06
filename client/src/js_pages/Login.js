import React from 'react';
import { useNavigate } from 'react-router-dom';

function getApiBase() {
  const env = process.env.REACT_APP_API_BASE;
  if (env) return env;
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;
    }
    return '';
  }
  return 'http://localhost:5000';
}
const API_BASE = getApiBase();

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      navigate('/create');
    } catch (err) {
      const msg = err?.message?.toLowerCase().includes('failed to fetch')
        ? 'Could not reach server. Is the backend running on port 5000?'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h1 className="mt-4 mb-3">Log in</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Username or Email</label>
          <input
            type="text"
            className="form-control"
            name="usernameOrEmail"
            value={form.usernameOrEmail}
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>
        <button disabled={loading} type="submit" className="btn btn-primary w-100">
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
      <p className="mt-3 text-center">
        New here? <a href="/signup">Create an account</a>
      </p>
    </div>
  );
}

export default LoginPage;

