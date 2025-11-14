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

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ username: '', email: '', password: '' });
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
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
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
    <div
      style={{
        backgroundColor: '#fff0f6',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="card shadow-sm"
        style={{
          maxWidth: 420,
          width: '100%',
          borderRadius: '20px',
          borderColor: '#f5b3c4',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(255, 182, 193, 0.3)',
        }}
      >
        <div className="card-body">
          <h1
            className="text-center mb-4"
            style={{ color: '#de798cff', fontWeight: 700 }}
          >
            Create Your Account
          </h1>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control pink-input"
                name="username"
                value={form.username}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control pink-input"
                name="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control pink-input"
                name="password"
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="button-filled w-100"
              style={{ fontSize: '1rem' }}
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-3 text-center" style={{ color: '#d47b91' }}>
            Already have an account?{' '}
            <a
              href="/login"
              style={{ color: '#de7990', textDecoration: 'none', fontWeight: 600 }}
            >
              Log in
            </a>
          </p>
        </div>
      </div>

      {/* ===== Shared Styles ===== */}
      <style>{`
        .button {
          background-color: #fde2e4;
          border: none;
          color: #d47b91;
          padding: 0.45rem 1rem;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow: 0 2px 5px rgba(255, 182, 193, 0.3);
        }
        .button:hover {
          background-color: #f9ccd3;
          color: #c85b75;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(255, 182, 193, 0.4);
        }

        .button-filled {
          background-color: #f5b3c4;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 0.55rem 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .button-filled:hover {
          background-color: #e891a6;
          transform: translateY(-1px);
        }

        .pink-input {
          border: 2px solid #f5b3c4;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .pink-input:focus {
          border-color: #e891a6;
          box-shadow: 0 0 6px rgba(245, 179, 196, 0.6);
        }
      `}</style>
    </div>
  );
}

export default SignUpPage;
