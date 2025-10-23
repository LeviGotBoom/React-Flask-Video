import React from 'react';
import { Link } from 'react-router-dom';

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

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const ITEM_TYPES = ['top', 'bottom', 'shoes', 'accessories'];

function OutfitAssemblerPage() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [outfits, setOutfits] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const seenOutfitKeys = React.useRef(new Set());

  React.useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/items`, { headers: { ...getAuthHeader() } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch items');
        setItems(data);
      } catch (err) {
        const msg = String(err?.message || '').toLowerCase().includes('failed to fetch')
          ? 'Could not reach server. Is the backend running on port 5000?'
          : (err.message || 'Something went wrong');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const generateOutfits = React.useCallback(() => {
    if (items.length === 0) {
      setOutfits([]);
      return;
    }

    const byType = ITEM_TYPES.reduce((acc, t) => { acc[t] = []; return acc; }, {});
    for (const it of items) {
      if (it.itemType && byType[it.itemType]) byType[it.itemType].push(it);
    }

    const vibeCounts = new Map();
    for (const it of items) {
      (it.vibes || []).forEach(v => vibeCounts.set(v, (vibeCounts.get(v) || 0) + 1));
    }
    const allVibes = Array.from(vibeCounts.keys());

    const pickVibe = () => {
      if (allVibes.length === 0) return null;
      const weights = allVibes.map(v => vibeCounts.get(v) || 1);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < allVibes.length; i++) {
        r -= weights[i];
        if (r <= 0) return allVibes[i];
      }
      return allVibes[0];
    };

    const generated = [];
    const makeOne = () => {
      const vibe = pickVibe();
      const outfit = [];
      for (const type of ITEM_TYPES) {
        const pool = byType[type];
        if (!pool || pool.length === 0) continue;
        const preferred = vibe ? pool.filter(p => (p.vibes || []).includes(vibe)) : [];
        const source = preferred.length ? preferred : pool;
        const pick = source[Math.floor(Math.random() * source.length)];
        if (pick) outfit.push(pick);
      }

      const hasTop = outfit.some(i => i.itemType === 'top');
      const hasBottom = outfit.some(i => i.itemType === 'bottom');
      const hasShoes = outfit.some(i => i.itemType === 'shoes');
      if (!hasTop || !hasBottom || !hasShoes) return null;

      const key = outfit.map(i => i.id).sort((a, b) => a - b).join('-');
      if (seenOutfitKeys.current.has(key)) return null;
      seenOutfitKeys.current.add(key);

      return { vibe, items: outfit };
    };

    let attempts = 0;
    const maxAttempts = 200;
    while (attempts < maxAttempts && generated.length < 20) {
      const o = makeOne();
      if (o) generated.push(o);
      attempts++;
    }
    setOutfits(generated);
  }, [items]);

  React.useEffect(() => {
    if (items.length) generateOutfits();
  }, [items, generateOutfits]);

  return (
    <div style={{ backgroundColor: '#fff0f6', minHeight: '100vh' }}>
      {/* ===== Full-Width Top Navigation Bar ===== */}
      <nav
        className="shadow-sm"
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '0.75rem 2rem',
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Link to="/" className="button">Home</Link>
            <Link to="/create" className="button">Wardrobe</Link>
          </div>
          <button className="button-outline" onClick={generateOutfits}>
            Regenerate Outfits
          </button>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <div className="container mt-3">
        <h2 className="text-center mb-4" style={{ color: '#de798cff' }}>Outfit Assembler</h2>
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-pink" role="status"></div>
            <p className="mt-2" style={{ color: '#de7990' }}>Loading your wardrobe...</p>
          </div>
        )}

        {!loading && outfits.length > 0 && (
          <div className="row g-4">
            {outfits.map((o, idx) => (
              <div key={idx} className="col-sm-6 col-lg-4">
                <div className="card shadow-sm" style={{ borderRadius: '20px', border: '1px solid #f5b3c4' }}>
                  <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fde2e4', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                    <span style={{ color: '#d47b91', fontWeight: 600 }}>Outfit {idx + 1}</span>
                    {o.vibe && <span className="tag">{o.vibe}</span>}
                  </div>
                  <div className="card-body d-flex flex-wrap gap-2 justify-content-center">
                    {o.items.map(it => (
                      <div key={it.id} style={{ width: '45%' }}>
                        <img
                          src={`${API_BASE}${it.imageUrl}`}
                          alt="piece"
                          style={{ width: '100%', borderRadius: 8 }}
                          onError={(e) => {
                            e.target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="mt-2 d-flex flex-wrap justify-content-center gap-1">
                          {it.itemType && <span className="tag">{it.itemType}</span>}
                          {(it.vibes || []).map(v => (
                            <span key={`${it.id}-${v}`} className="tag">{v}</span>
                          ))}
                          {it.color && (
                            <span className="tag" style={{ backgroundColor: it.color, color: '#fff' }}>
                              {it.color}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

        .button-outline {
          border: 2px solid #f5b3c4;
          color: #de7990;
          border-radius: 25px;
          padding: 0.45rem 1rem;
          font-weight: 500;
          background-color: transparent;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .button-outline:hover {
          background-color: #f5b3c4;
          color: white;
        }

        .tag {
          display: inline-block;
          background-color: #f5b3c4;
          color: white;
          border-radius: 15px;
          padding: 0.25rem 0.7rem;
          font-size: 0.85rem;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(245, 179, 196, 0.4);
          transition: all 0.2s ease;
        }
        .tag:hover {
          background-color: #e891a6;
          transform: translateY(-1px);
        }

        .text-pink {
          color: #de7990 !important;
        }
      `}</style>
    </div>
  );
}

export default OutfitAssemblerPage;
