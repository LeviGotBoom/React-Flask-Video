import React from 'react';
// Navbar removed per user's request

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

const ITEM_TYPES = ['top','bottom','shoes','accessories','pullover'];

// Color Hunt-inspired palettes provided by user (top→bottom order from site)
// Source: https://colorhunt.co/
const PALETTES = [
  ['#41A67E', '#05339C', '#1055C9', '#E5C95F'],
  ['#662222', '#842A3B', '#A3485A', '#F5DAA7'],
  ['#4E56C0', '#9B5DE0', '#D78FEE', '#FDCFFA'],
  ['#80A1BA', '#91C4C3', '#B4DEBD', '#FFF7DD'],
  ['#432323', '#2F5755', '#5A9690', '#E0D9D9'],
  ['#0046FF', '#73C8D2', '#F5F1DC', '#FF9013'],
  ['#D97D55', '#F4E9D7', '#B8C4A9', '#6FA4AF'],
  ['#696FC7', '#A7AAE1', '#F5D3C4', '#F2AEBB'],
  ['#000B58', '#003161', '#006A67', '#FDEB9E'],
  // Additional palettes provided by user
  ['#19183B', '#708993', '#A1C2BD', '#E7F2EF'],
  ['#F5EFE6', '#E8DFCA', '#6D94C5', '#CBDCEB'],
  ['#96A78D', '#B6CEB4', '#D9EDCF', '#F0F0F0'],
  ['#FFECC0', '#FFC29B', '#F39F9F', '#B95E82'],
  ['#F5D2D2', '#F8F7BA', '#D8E3C3', '#A3CCDA'],
  ['#84994F', '#FFE797', '#FCB53B', '#B45253'],
  ['#6B3F69', '#8D5F8C', '#A376A2', '#DDC3C3'],
  ['#EF7722', '#FAA533', '#EBEBEB', '#0BA6DF'],
  ['#1B3C53', '#234C6A', '#456882', '#D2C1B6'],
  // User-supplied orderings (top→bottom)
  ['#E7F2EF', '#A1C2BD', '#708993', '#19183B'],
  ['#CBDCEB', '#6D94C5', '#E8DFCA', '#F5EFE6'],
  ['#F0F0F0', '#D9E9CF', '#B6CEB4', '#96A78D'],
  ['#A3CCDA', '#BDE3C3', '#F8F7BA', '#F5D2D2'],
  ['#DDC3C3', '#A376A2', '#8D5F8C', '#6B3F69'],
  ['#D2C1B6', '#456882', '#234C6A', '#1B3C53'],
  ['#FFD5D5', '#FDAAAA', '#3A6F43', '#59AC77'],
  ['#F2AEBB', '#F5D3C4', '#A7AAE1', '#696FC7'],
  ['#F5DAA7', '#A3485A', '#842A3B', '#662222'],
];

function OutfitAssemblerPage() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [outfits, setOutfits] = React.useState([]);

  React.useEffect(() => {
    const load = async () => {
      setError('');
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
      }
    };
    load();
  }, []);

  const generate = React.useCallback(() => {
    // Group items by type
    const byType = ITEM_TYPES.reduce((acc, t) => { acc[t] = []; return acc; }, {});
    for (const it of items) {
      if (it.itemType && byType[it.itemType]) byType[it.itemType].push(it);
    }
    // Build a vibe frequency map to bias matching
    const vibeCounts = new Map();
    for (const it of items) {
      (it.vibes || []).forEach(v => vibeCounts.set(v, (vibeCounts.get(v) || 0) + 1));
    }
    const allVibes = Array.from(vibeCounts.keys());
    // Helper for weighted random vibe (more frequent vibes more likely)
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

    function hexToRgb(h) {
      if (!h) return null;
      const s = h.replace('#','');
      const bigint = parseInt(s.length === 3 ? s.split('').map(c=>c+c).join('') : s, 16);
      return { r: (bigint>>16)&255, g: (bigint>>8)&255, b: bigint&255 };
    }
    function distance(a, b) {
      if (!a || !b) return Infinity;
      const dr=a.r-b.r, dg=a.g-b.g, db=a.b-b.b;
      return Math.sqrt(dr*dr+dg*dg+db*db);
    }

    // Try to build outfits by palette first
    const paletteSeen = new Set();
    const outfitsFromPalettes = [];
    for (const pal of PALETTES) {
      // For each required type pick the closest color in this palette
      const pickForType = (type) => {
        const pool = byType[type] || [];
        if (pool.length === 0) return null;
        let best = null; let bestScore = Infinity;
        for (const it of pool) {
          const rgb = hexToRgb(it.color);
          // distance to closest color in palette
          let dmin = Infinity;
          for (const c of pal) {
            dmin = Math.min(dmin, distance(rgb, hexToRgb(c)));
          }
          if (dmin < bestScore) { bestScore = dmin; best = it; }
        }
        return best;
      };

      const top = pickForType('top');
      const bottom = pickForType('bottom');
      const shoes = pickForType('shoes');
      if (!top || !bottom || !shoes) continue;

      const usedIds = new Set([top.id, bottom.id, shoes.id]);
      const tryExtra = (type) => {
        const pool = byType[type] || [];
        let best = null; let bestScore = Infinity;
        for (const it of pool) {
          if (usedIds.has(it.id)) continue;
          const rgb = hexToRgb(it.color);
          let dmin = Infinity;
          for (const c of pal) dmin = Math.min(dmin, distance(rgb, hexToRgb(c)));
          if (dmin < bestScore) { bestScore = dmin; best = it; }
        }
        if (best) usedIds.add(best.id);
        return best;
      };

      const accessories = tryExtra('accessories');
      const pullover = tryExtra('pullover');
      const outfitItems = [top, bottom, shoes].concat(accessories ? [accessories] : [], pullover ? [pullover] : []);
      const key = [...usedIds].sort((a,b)=>a-b).join('-');
      if (!paletteSeen.has(key)) {
        paletteSeen.add(key);
        outfitsFromPalettes.push({ vibe: null, items: outfitItems });
      }
    }

    // Fallback generator (vibe + color similarity) for more variety
    const makeOne = () => {
      const vibe = pickVibe();
      const outfit = [];
      for (const type of ITEM_TYPES) {
        const pool = byType[type];
        if (!pool || pool.length === 0) continue;
        // Prefer items with the chosen vibe; fallback to any
        const preferred = vibe ? pool.filter(p => (p.vibes || []).includes(vibe)) : [];
        const source = preferred.length ? preferred : pool;
        const pick = source[Math.floor(Math.random() * source.length)];
        if (pick) outfit.push(pick);
      }
      // Require at least top, bottom, and shoes
      const hasTop = outfit.some(i => i.itemType === 'top');
      const hasBottom = outfit.some(i => i.itemType === 'bottom');
      const hasShoes = outfit.some(i => i.itemType === 'shoes');
      if (!hasTop || !hasBottom || !hasShoes) return null;
      // Color harmony bias: reorder outfit so remaining picks prefer similar/complementary colors
      const colors = outfit.map(i => ({ i, rgb: hexToRgb(i.color) }));
      // simple score: average pairwise distance (lower is better) with a small vibe bonus for matches
      const pairScore = () => {
        let total = 0, cnt = 0;
        for (let a = 0; a < colors.length; a++) {
          for (let b = a+1; b < colors.length; b++) {
            total += distance(colors[a].rgb, colors[b].rgb);
            cnt += 1;
          }
        }
        return cnt ? total/cnt : 0;
      };
      // try a few random swaps to lower score (hill-climb)
      let best = outfit.slice();
      let bestScore = pairScore();
      for (let k = 0; k < 5; k++) {
        const a = Math.floor(Math.random()*colors.length);
        const b = Math.floor(Math.random()*colors.length);
        const tmp = colors[a]; colors[a]=colors[b]; colors[b]=tmp;
        const s = pairScore();
        if (s < bestScore) {
          bestScore = s;
          best = colors.map(c => c.i);
        }
      }
      return { vibe, items: best };
    };

    const generated = [...outfitsFromPalettes];
    const seen = new Set(generated.map(o => o.items.map(x=>x.id).sort((a,b)=>a-b).join('-')));
    // Upper bound on unique outfits given constraints
    const maxTheoretical = Math.min(
      (byType.top?.length || 0),
      (byType.bottom?.length || 0),
      (byType.shoes?.length || 0)
    );
    let attempts = 0;
    const maxAttempts = Math.max(50, (maxTheoretical || 6) * 20);
    while (attempts < maxAttempts) {
      const o = makeOne();
      if (o) {
        const key = o.items.map(x => x.id).sort((a,b)=>a-b).join('-');
        if (!seen.has(key)) {
          seen.add(key);
          generated.push(o);
          // stop if we likely hit the maximum distinct combos available
          if (generated.length >= maxTheoretical) break;
        }
      }
      attempts += 1;
    }
    setOutfits(generated);
  }, [items]);

  React.useEffect(() => {
    if (items.length) generate();
  }, [items, generate]);

  return (
    <div>
      <div className="container mt-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2>Outfit Assembler</h2>
          <div className="d-flex align-items-center gap-2">
            <a href="/" className="btn btn-outline-secondary">Home</a>
            <a href="/create" className="btn btn-outline-secondary">Back to Wardrobe</a>
            <button className="btn btn-primary" onClick={generate}>Generate</button>
          </div>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {/* Grid of outfits: each card shows up to one item per type; click to enlarge */}
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
                      <img src={`${API_BASE}${it.imageUrl}`} alt="piece" style={{ width: '100%', borderRadius: 8 }} />
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
                <div className="card-footer text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/api/shared`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                          body: JSON.stringify({ itemIds: o.items.map(i => i.id) }),
                        });
                        if (!res.ok) {
                          const d = await res.json();
                          throw new Error(d.error || 'Failed to share');
                        }
                        alert('Outfit shared!');
                      } catch (e) {
                        alert(e.message || 'Failed to share');
                      }
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OutfitAssemblerPage;


