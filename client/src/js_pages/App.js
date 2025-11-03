import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div style={{ backgroundColor: '#fff0f6', minHeight: '100vh' }}>
      {/* ===== Top Navigation Bar ===== */}
      <nav
        className="navbar navbar-expand-lg shadow-sm"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '0.75rem 1rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Left side buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link to="/" className="button">Home</Link>
          <Link to="/create" className="button">Wardrobe</Link>
          <Link to="/assembler" className="button">Outfit Assembler</Link>
          <Link to="/season" className="button">Season Analysis</Link>
          </div>

          {/* Right side buttons */}
          <div className="d-flex gap-2">
            <Link to="/login" className="button-outline">Log In</Link>
            <Link to="/signup" className="button-filled">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* ===== Main Page Content ===== */}
      <div className="container mt-4 text-center">
        <h1 className="mb-4" style={{ color: '#de798cff' }}>Welcome to TailorGator</h1>
        <p style={{ color: '#de798cff' }}>Outfit inspiration tailored to you!</p>
      </div>

      {/* ===== Inline Styles ===== */}
      <style>{`
        .button {
          background-color: #fde2e4;
          border: none;
          color: #d47b91;
          padding: 0.5rem 1.1rem;
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
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
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
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .button-filled:hover {
          background-color: #e891a6;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default App;
