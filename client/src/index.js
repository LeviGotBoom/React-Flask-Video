// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import './index.css';
// import App from './js_pages/App';   // or './js_pages/App' if that’s where it lives
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );

// reportWebVitals();
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './js_pages/App';
import SignUpPage from './js_pages/SignUp';
import LoginPage from './js_pages/Login';
import CreateOutfitsPage from './js_pages/CreateOutfits';
import OutfitAssemblerPage from './js_pages/OutfitAssembler';
import SeasonAnalysisPage from './js_pages/SeasonAnalysis';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create" element={<CreateOutfitsPage />} />
      <Route path="/assembler" element={<OutfitAssemblerPage />} />
      <Route path="/season" element={<SeasonAnalysisPage />} />
    </Routes>
  </BrowserRouter>
);
