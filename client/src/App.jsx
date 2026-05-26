import { useState } from 'react';
import { CvProvider } from './context/CvContext.jsx';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import CreateCVPage from './pages/CreateCVPage.jsx';
import UploadCVPage from './pages/UploadCVPage.jsx';
import CVPreviewPage from './pages/CVPreviewPage.jsx';
import './App.css';

export default function App() {
  const [page, setPage] = useState('home');

  return (
    <CvProvider>
      <div className="app-shell">
        <Navbar currentPage={page} onNavigate={setPage} />
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'create' && <CreateCVPage onNavigate={setPage} />}
        {page === 'upload' && <UploadCVPage onNavigate={setPage} />}
        {page === 'preview' && <CVPreviewPage onNavigate={setPage} />}
      </div>
    </CvProvider>
  );
}
