import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div>
      {/* ===== Top Navigation Bar ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-light bg-light shadow-sm"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '0.75rem 1rem',
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Left side buttons */}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link to="/create" className="btn btn-outline-secondary">Wardrobe / Upload</Link>
            <Link to="/assembler" className="btn btn-outline-secondary">Outfit Assembler</Link>
            <Link to="/season" className="btn btn-outline-secondary">Season Analysis</Link>
          </div>

          {/* Right side: smaller login buttons */}
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-sm btn-outline-primary">Log In</Link>
            <Link to="/signup" className="btn btn-sm btn-primary">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* ===== Main Page Content ===== */}
      <div className="container mt-4 text-center">
        <h1 className="mb-4">Welcome to your Outfit Creator</h1>
      </div>
    </div>
  );
}

export default App;