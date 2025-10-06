import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div>
      <div className="container mt-4">
        <h1>Welcome to the Outfits</h1>
        <SharedFeed />
        <div className="mt-3 d-flex flex-wrap gap-2">
          <Link to="/login" className="btn btn-outline-primary">Log In</Link>
          <Link to="/signup" className="btn btn-primary">Create Account</Link>
          <Link to="/create" className="btn btn-outline-secondary">Wardrobe / Upload</Link>
          <Link to="/assembler" className="btn btn-outline-secondary">Outfit Assembler</Link>
          <Link to="/season" className="btn btn-outline-secondary">Season Analysis</Link>
        </div>
      </div>
    </div>
  );
}

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

function SharedFeed() {
  const [shared, setShared] = React.useState([]);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/shared`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load shared outfits');
        setShared(data);
      } catch (e) {
        setError('Could not load shared outfits');
      }
    };
    load();
  }, []);

  if (error) return null;
  if (!shared.length) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-3">Shared Outfits</h4>
      <div className="row g-3">
        {shared.map((o) => (
          <div key={o.id} className="col-sm-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body d-flex flex-wrap gap-2 justify-content-center">
                {o.items.map(it => (
                  <div key={it.id} style={{ width: '45%' }}>
                    <img src={`${API_BASE}${it.imageUrl}`} alt="piece" style={{ width: '100%', borderRadius: 8 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
