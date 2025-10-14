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

const ITEM_TYPES = ['top','bottom','shoes','accessories'];

// Color Hunt-inspired palettes (top→bottom order from site)
// Source: https://colorhunt.co/
// const PALETTES = [
//   ['#41A67E', '#05339C', '#1055C9', '#E5C95F'],
//   ['#662222', '#842A3B', '#A3485A', '#F5DAA7'],
//   ['#4E56C0', '#9B5DE0', '#D78FEE', '#FDCFFA'],
//   ['#80A1BA', '#91C4C3', '#B4DEBD', '#FFF7DD'],
//   ['#432323', '#2F5755', '#5A9690', '#E0D9D9'],
//   ['#0046FF', '#73C8D2', '#F5F1DC', '#FF9013'],
//   ['#D97D55', '#F4E9D7', '#B8C4A9', '#6FA4AF'],
//   ['#696FC7', '#A7AAE1', '#F5D3C4', '#F2AEBB'],
//   ['#000B58', '#003161', '#006A67', '#FDEB9E'],
//   ['#19183B', '#708993', '#A1C2BD', '#E7F2EF'],
//   ['#F5EFE6', '#E8DFCA', '#6D94C5', '#CBDCEB'],
//   ['#96A78D', '#B6CEB4', '#D9EDCF', '#F0F0F0'],
//   ['#FFECC0', '#FFC29B', '#F39F9F', '#B95E82'],
//   ['#F5D2D2', '#F8F7BA', '#D8E3C3', '#A3CCDA'],
//   ['#84994F', '#FFE797', '#FCB53B', '#B45253'],
//   ['#6B3F69', '#8D5F8C', '#A376A2', '#DDC3C3'],
//   ['#EF7722', '#FAA533', '#EBEBEB', '#0BA6DF'],
//   ['#1B3C53', '#234C6A', '#456882', '#D2C1B6'],
//   ['#E7F2EF', '#A1C2BD', '#708993', '#19183B'],
//   ['#CBDCEB', '#6D94C5', '#E8DFCA', '#F5EFE6'],
//   ['#F0F0F0', '#D9E9CF', '#B6CEB4', '#96A78D'],
//   ['#A3CCDA', '#BDE3C3', '#F8F7BA', '#F5D2D2'],
//   ['#DDC3C3', '#A376A2', '#8D5F8C', '#6B3F69'],
//   ['#D2C1B6', '#456882', '#234C6A', '#1B3C53'],
//   ['#FFD5D5', '#FDAAAA', '#3A6F43', '#59AC77'],
//   ['#F2AEBB', '#F5D3C4', '#A7AAE1', '#696FC7'],
//   ['#F5DAA7', '#A3485A', '#842A3B', '#662222'],
// ];

function OutfitAssemblerPage() {
    const [items, setItems] = React.useState([]);
    const [error, setError] = React.useState('');
    const [outfits, setOutfits] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const seenOutfitKeys = React.useRef(new Set()); // persist unique outfit combos
  
    // Load items on mount
    React.useEffect(() => {
      const load = async () => {
        setError('');
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/api/items`, { headers: { ...getAuthHeader() } });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to fetch items');
          console.log('Items loaded:', data.length);
          setItems(data);
        } catch (err) {
          const msg = String(err?.message || '').toLowerCase().includes('failed to fetch')
            ? 'Could not reach server. Is the backend running on port 5000?'
            : (err.message || 'Something went wrong');
          console.error('Error loading items:', err);
          setError(msg);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []);
  
    // Generate outfits whenever items change
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
  
        const key = outfit.map(i => i.id).sort((a,b)=>a-b).join('-');
        if (seenOutfitKeys.current.has(key)) return null; // skip duplicates
        seenOutfitKeys.current.add(key);
        if (seenOutfitKeys.current.size > 100) {
          // prune memory: keep last 100
          const arr = Array.from(seenOutfitKeys.current);
          seenOutfitKeys.current = new Set(arr.slice(-100));
        }
  
        return { vibe, items: outfit };
      };
  
      const maxAttempts = 200;
      let attempts = 0;
      while (attempts < maxAttempts && generated.length < 20) {
        const o = makeOne();
        if (o) generated.push(o);
        attempts++;
      }
  
      console.log('Generated', generated.length, 'unique non-repeating outfits');
      setOutfits(generated);
    }, [items]);
  
    React.useEffect(() => {
      if (items.length) generateOutfits();
    }, [items, generateOutfits]);
  
    return (
      <div>
        {/* Nav Bar */}
        <nav
          className="d-flex justify-content-between align-items-center px-4 py-2 shadow-sm mb-4"
          style={{
            backgroundColor: "#f8f9fa",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-outline-secondary">Home</Link>
            <Link to="/create" className="btn btn-outline-secondary">Wardrobe</Link>
          </div>
          <button className="btn btn-sm btn-primary" onClick={generateOutfits}>
            Regenerate Outfits
          </button>
        </nav>
  
        <div className="container mt-3">
          <h2 className="text-center mb-4">Outfit Assembler</h2>
          {error && <div className="alert alert-danger">{error}</div>}
  
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Loading your wardrobe...</p>
            </div>
          )}
  
          {!loading && outfits.length > 0 && (
            <div className="row g-3">
              {outfits.map((o, idx) => (
                <div key={idx} className="col-sm-6 col-lg-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span>Outfit {idx + 1}</span>
                      {o.vibe && <span className="badge bg-primary">{o.vibe}</span>}
                    </div>
                    <div className="card-body d-flex flex-wrap gap-2 justify-content-center">
                      {o.items.map(it => (
                        <div key={it.id} style={{ width: '45%' }}>
                          <img
                            src={`${API_BASE}${it.imageUrl}`}
                            alt="piece"
                            style={{ width: '100%', borderRadius: 8 }}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="mt-2 d-flex flex-wrap justify-content-center gap-1">
                            {it.itemType && <span className="badge bg-secondary">{it.itemType}</span>}
                            {(it.vibes || []).map(v => (
                              <span key={`${it.id}-${v}`} className="badge bg-primary">{v}</span>
                            ))}
                            {it.color && (
                              <span className="badge" style={{ backgroundColor: it.color, color: '#000', border: '1px solid rgba(0,0,0,0.2)' }}>{it.color}</span>
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
      </div>
    );
  }
  
export default OutfitAssemblerPage;