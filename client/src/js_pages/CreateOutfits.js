import React from 'react';
// Navbar removed per user's request
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

function CreateOutfitsPage() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [itemType, setItemType] = React.useState('');
  const [vibes, setVibes] = React.useState([]);
  const [showUploader, setShowUploader] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [colorHex, setColorHex] = React.useState('#cccccc');

  const fetchItems = React.useCallback(async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch items');
      setItems(data);
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase().includes('failed to fetch')
        ? 'Could not reach server. Is the backend running on port 5000?'
        : (err.message || 'Something went wrong');
      setError(msg);
    }
  }, []);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      if (itemType) form.append('item_type', itemType);
      if (vibes.length) vibes.forEach(v => form.append('vibes', v));
      if (colorHex) form.append('color', colorHex);
      const res = await fetch(`${API_BASE}/api/items`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setItems((prev) => [data, ...prev]);
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase().includes('failed to fetch')
        ? 'Could not reach server. Is the backend running on port 5000?'
        : (err.message || 'Something went wrong');
      setError(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/items/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase().includes('failed to fetch')
        ? 'Could not reach server. Is the backend running on port 5000?'
        : (err.message || 'Something went wrong');
      setError(msg);
    }
  };

  return (
    <div>
      <div className="container mt-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2>Your Wardrobe</h2>
          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="btn btn-outline-secondary">Home</Link>
            <Link to="/assembler" className="btn btn-outline-secondary">Outfit Assembler</Link>
            <Link to="/season" className="btn btn-outline-secondary">Season Analysis</Link>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowUploader((v) => !v)}
            >
              {showUploader ? 'Close' : (uploading ? 'Uploading…' : 'Upload Clothing')}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {showUploader && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-sm-4">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={itemType} onChange={(e) => setItemType(e.target.value)}>
                    <option value="">Select type</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                    <option value="pullover">Pullover</option>
                  </select>
                </div>
                <div className="col-sm-8">
                  <label className="form-label">Vibes</label>
                  <VibesPicker selected={vibes} onChange={setVibes} />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Color</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    title="Choose item color"
                  />
                </div>
                <div className="col-12">
                  <label className="btn btn-primary mb-0">
                    {uploading ? 'Uploading…' : 'Choose Image & Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pinterest-like masonry grid using CSS columns */}
        <div style={{ columnCount: 3, columnGap: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ breakInside: 'avoid', marginBottom: '1rem', position: 'relative', cursor: 'pointer' }}>
              <img
                src={`${API_BASE}${item.imageUrl}`}
                alt="clothing"
                style={{ width: '100%', borderRadius: 8 }}
                onClick={() => setSelectedItem(item)}
              />
              <button
                className="btn btn-sm btn-danger"
                style={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => onDelete(item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Simple modal for item details */}
        {selectedItem && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedItem(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Item Details</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedItem(null)} />
                </div>
                <div className="modal-body">
                  <img src={`${API_BASE}${selectedItem.imageUrl}`} alt="clothing" style={{ width: '100%', borderRadius: 8 }} />
                  <div className="mt-3">
                    {selectedItem.itemType && (
                      <span className="badge bg-secondary me-2">{selectedItem.itemType}</span>
                    )}
                    {(selectedItem.vibes || []).map((v) => (
                      <span key={v} className="badge bg-primary me-2 mb-2">{v}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedItem(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateOutfitsPage;

// --- Helpers ---
const ALL_VIBES = [
  'pastel','vintage','retro','neon','gold','light','dark','warm','cold','summer','fall','winter','spring','happy','nature','earth','night','space','rainbow','gradient','sunset','sky','sea','skin','food','cream','coffee','wedding','christmas','halloween'
];

function VibesPicker({ selected, onChange }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };
  return (
    <div className="d-flex flex-wrap gap-2">
      {ALL_VIBES.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => toggle(v)}
          className={`btn btn-sm ${selected.includes(v) ? 'btn-primary' : 'btn-outline-secondary'}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

