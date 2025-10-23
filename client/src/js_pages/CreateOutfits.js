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

function CreateOutfitsPage() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [itemType, setItemType] = React.useState('');
  const [vibes, setVibes] = React.useState([]);
  const [showUploader, setShowUploader] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [colorHex, setColorHex] = React.useState('#cccccc');
  const [editingItem, setEditingItem] = React.useState(null);

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

  const onUpdateTags = async (id, updates) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setItems((prev) => prev.map(i => i.id === id ? data : i));
      setEditingItem(null);
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase().includes('failed to fetch')
        ? 'Could not reach server. Is the backend running on port 5000?'
        : (err.message || 'Something went wrong');
      setError(msg);
    }
  };

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
            <Link to="/assembler" className="button">Assembler</Link>
            <Link to="/season" className="button">Season Analysis</Link>
          </div>
          <button
            type="button"
            className="button-outline"
            onClick={() => setShowUploader((v) => !v)}
          >
            {showUploader ? 'Close' : (uploading ? 'Uploading…' : 'Upload Clothing')}
          </button>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <div className="container mt-3">
        <h2 className="text-center mb-4" style={{ color: '#de798cff' }}>Your Wardrobe</h2>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {showUploader && (
          <div className="card mb-3" style={{ borderRadius: '20px', borderColor: '#f5b3c4' }}>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-sm-4">
                  <label className="form-label">Type</label>
                  <select
                    className="cute-select"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
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
                  <label className="button mb-0" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Uploading…' : '📸 Choose Image & Upload'}
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

        {/* ===== Item Grid ===== */}
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
                className="button-filled"
                style={{ position: 'absolute', top: 8, right: 8, padding: '0.3rem 0.6rem' }}
                onClick={() => onDelete(item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* ===== Modal for Item Details ===== */}
        {selectedItem && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedItem(null)}>
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Item Details</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedItem(null)} />
                </div>
                <div className="modal-body">
                  <img src={`${API_BASE}${selectedItem.imageUrl}`} alt="clothing" style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />
                  
                  {editingItem?.id === selectedItem.id ? (
                    <EditTagsForm
                      item={editingItem}
                      onChange={setEditingItem}
                      onSave={() => onUpdateTags(editingItem.id, {
                        item_type: editingItem.itemType,
                        vibes: editingItem.vibes,
                        color: editingItem.color,
                      })}
                      onCancel={() => setEditingItem(null)}
                    />
                  ) : (
                    <div>
                      <div className="mb-3">
                        {selectedItem.itemType && (
                          <span className="tag me-2">{selectedItem.itemType}</span>
                        )}
                        {selectedItem.color && (
                          <span 
                            className="tag me-2" 
                            style={{ backgroundColor: selectedItem.color, color: '#fff' }}
                          >
                            {selectedItem.color}
                          </span>
                        )}
                      </div>
                      <div className="mb-3">
                        {(selectedItem.vibes || []).map((v) => (
                          <span key={v} className="tag me-2 mb-2">{v}</span>
                        ))}
                      </div>
                      <button className="button-outline" onClick={() => setEditingItem({...selectedItem})}>
                        Edit Tags
                      </button>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="button-outline" onClick={() => setSelectedItem(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Styles ===== */}
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

          .button-filled {
            background-color: #f5b3c4;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 0.45rem 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
          }
          .button-filled:hover {
            background-color: #e891a6;
            transform: translateY(-1px);
          }

          /* Cute dropdown */
          .cute-select {
            width: 100%;
            padding: 0.5rem 1rem;
            border: 2px solid #f5b3c4;
            border-radius: 20px;
            background-color: #fffafc;
            color: #d47b91;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(255, 182, 193, 0.3);
            transition: all 0.3s ease;
            outline: none;
          }
          .cute-select:hover {
            border-color: #f3a3b9;
          }
          .cute-select:focus {
            border-color: #e891a6;
            box-shadow: 0 0 6px rgba(245, 179, 196, 0.6);
          }

          /* Pink tags */
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
        `}</style>
      </div>
    </div>
  );
}

export default CreateOutfitsPage;

/* --- Helpers --- */
const ALL_VIBES = [
  'casual','shoujo','vintage','formal','boho','chic','minimalist','preppy','streetwear','gothic','athleisure','grunge','y2k','acubi','coquette','cottagecore','fairycore','girly','edgy','country',
];

function VibesPicker({ selected, onChange }) {
  const toggle = (tag) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  };
  return (
    <div className="d-flex flex-wrap gap-2">
      {ALL_VIBES.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => toggle(v)}
          className={`button ${selected.includes(v) ? 'button-filled' : 'button-outline'}`}
          style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function EditTagsForm({ item, onChange, onSave, onCancel }) {
  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Type</label>
        <select
          className="cute-select"
          value={item.itemType || ''}
          onChange={(e) => onChange({ ...item, itemType: e.target.value })}
        >
          <option value="">Select type</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Color</label>
        <input
          type="color"
          className="form-control form-control-color"
          value={item.color || '#cccccc'}
          onChange={(e) => onChange({ ...item, color: e.target.value })}
          title="Choose item color"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Vibes</label>
        <VibesPicker
          selected={item.vibes || []}
          onChange={(newVibes) => onChange({ ...item, vibes: newVibes })}
        />
      </div>

      <div className="d-flex gap-2">
        <button className="button-filled" onClick={onSave}>Save</button>
        <button className="button-outline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
