import React from 'react';

const SEASONS = {
  Spring: {
    characteristics: 'Warm, light, clear; bright and fresh.',
    colors: ['coral','fresh greens','golden yellow','poppy red','warm pastels'],
    avoid: ['dull basics','cool black','stark white'],
  },
  Summer: {
    characteristics: 'Cool, soft, and light.',
    colors: ['lavender','soft pink','icy blue','powder blue','soft neutrals'],
    avoid: ['black','white','bright warm oranges'],
  },
  Autumn: {
    characteristics: 'Warm, rich, earthy with golden undertones.',
    colors: ['burnt orange','olive green','deep brown','gold','rustic red'],
    avoid: ['navy blue','cool blues'],
  },
  Winter: {
    characteristics: 'Cool, deep, clear/high contrast.',
    colors: ['emerald','sapphire','ruby red','black','navy','hot pink','icy blue'],
    avoid: ['pastels','muted or warm-leaning colors'],
  },
};

function SeasonAnalysisPage() {
  const [season, setSeason] = React.useState('Spring');

  const s = SEASONS[season];

  return (
    <div className="container mt-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>Season Color Analysis</h2>
        <a href="/create" className="btn btn-outline-secondary">Back to Wardrobe</a>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <label className="form-label">Select your season</label>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(SEASONS).map((name) => (
              <button
                key={name}
                type="button"
                className={`btn ${season === name ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSeason(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">Characteristics</div>
            <div className="card-body">
              <p className="mb-0">{s.characteristics}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">Recommended Colors</div>
            <div className="card-body d-flex flex-wrap gap-2">
              {s.colors.map((c) => (
                <span key={c} className="badge bg-success">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">Avoid</div>
            <div className="card-body d-flex flex-wrap gap-2">
              {s.avoid.map((c) => (
                <span key={c} className="badge bg-danger">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeasonAnalysisPage;


