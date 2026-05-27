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
  const [, setHistory] = useState([]);

  function navigate(nextPage) {
    if (nextPage === page) return;
    setHistory(previous => [...previous, page]);
    setPage(nextPage);
  }

  function goBack() {
    setHistory(previous => {
      const copy = [...previous];
      const last = copy.pop();
      setPage(last || 'home');
      return copy;
    });
  }

  return (
    <CvProvider>
      <div className="app-shell">
        <Navbar currentPage={page} onNavigate={navigate} />
        {page !== 'home' && (
          <button type="button" className="back-button" onClick={goBack}>
            Volver
          </button>
        )}
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'create' && <CreateCVPage onNavigate={navigate} />}
        {page === 'upload' && <UploadCVPage onNavigate={navigate} />}
        {page === 'preview' && <CVPreviewPage onNavigate={navigate} />}
      </div>
    </CvProvider>
  );
}
