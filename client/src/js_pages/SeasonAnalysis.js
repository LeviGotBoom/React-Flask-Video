import React from 'react';
import { Link } from 'react-router-dom';

const SEASONS = {
  Spring: {
    characteristics: 'Warm, light, clear; bright and fresh.',
    colors: ['coral', 'fresh greens', 'golden yellow', 'poppy red', 'warm pastels'],
    avoid: ['dull basics', 'cool black', 'stark white'],
  },
  Summer: {
    characteristics: 'Cool, soft, and light.',
    colors: ['lavender', 'soft pink', 'icy blue', 'powder blue', 'soft neutrals'],
    avoid: ['black', 'white', 'bright warm oranges'],
  },
  Autumn: {
    characteristics: 'Warm, rich, earthy with golden undertones.',
    colors: ['burnt orange', 'olive green', 'deep brown', 'gold', 'rustic red'],
    avoid: ['navy blue', 'cool blues'],
  },
  Winter: {
    characteristics: 'Cool, deep, clear/high contrast.',
    colors: ['emerald', 'sapphire', 'ruby red', 'black', 'navy', 'hot pink', 'icy blue'],
    avoid: ['pastels', 'muted or warm-leaning colors'],
  },
};

function SeasonAnalysisPage() {
  const [season, setSeason] = React.useState('Spring');
  const s = SEASONS[season];

  return (
    <div style={{ backgroundColor: '#fff0f6', minHeight: '100vh' }}>
      {/* ===== Top Nav Bar ===== */}
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
            <Link to="/assembler" className="button">Assembler</Link>
          </div>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <div className="container mt-4">
        <h2 className="text-center mb-4" style={{ color: '#de798cff' }}>
          Season Color Analysis
        </h2>

        {/* ===== Season Selector ===== */}
        <div className="card mb-4" style={{ borderRadius: '20px', border: '1px solid #f5b3c4' }}>
          <div className="card-body text-center">
            <label className="form-label mb-3" style={{ color: '#d47b91', fontWeight: 600 }}>
              Select your season
            </label>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {Object.keys(SEASONS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`button ${season === name ? 'button-filled' : 'button-outline'}`}
                  onClick={() => setSeason(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Season Details ===== */}
        <div className="row g-4">
          <div className="col-md-4">
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: '20px', border: '1px solid #f5b3c4' }}
            >
              <div
                className="card-header"
                style={{
                  backgroundColor: '#fde2e4',
                  color: '#d47b91',
                  fontWeight: 600,
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              >
                Characteristics
              </div>
              <div className="card-body">
                <p className="mb-0" style={{ color: '#555' }}>
                  {s.characteristics}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: '20px', border: '1px solid #f5b3c4' }}
            >
              <div
                className="card-header"
                style={{
                  backgroundColor: '#fde2e4',
                  color: '#d47b91',
                  fontWeight: 600,
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              >
                Recommended Colors
              </div>
              <div className="card-body d-flex flex-wrap gap-2">
                {s.colors.map((c) => (
                  <span key={c} className="tag">{c}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: '20px', border: '1px solid #f5b3c4' }}
            >
              <div
                className="card-header"
                style={{
                  backgroundColor: '#fde2e4',
                  color: '#d47b91',
                  fontWeight: 600,
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              >
                Avoid
              </div>
              <div className="card-body d-flex flex-wrap gap-2">
                {s.avoid.map((c) => (
                  <span key={c} className="tag" style={{ backgroundColor: '#e891a6' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
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
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .button-filled:hover {
          background-color: #e891a6;
          transform: translateY(-1px);
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
      `}</style>
    </div>
  );
}

export default SeasonAnalysisPage;
