/**
 * App.jsx — Shell principal de la aplicación
 *
 * ARCHIVO CONGELADO. No añadir rutas aquí.
 * Para añadir una ruta nueva, edita routes.config.js.
 */
import { useState } from 'react';
import { CvProvider } from './context/CvContext.jsx';
import Navbar from './components/Navbar.jsx';
import { ROUTES } from './routes.config.js';
import './App.css';

// Props adicionales fijas por ruta (relaciones permanentes entre páginas).
// Para rutas nuevas, añadir la entrada aquí SOLO si la página necesita
// comunicarse con otra página específica.
const EXTRA_PROPS = {
  ope: (navigate) => ({ onNavigateToEditor: () => navigate('create') }),
};

export default function App() {
  const [page, setPage]       = useState('home');
  const [history, setHistory] = useState([]);

  function navigate(nextPage) {
    if (nextPage === page) return;
    setHistory(prev => [...prev, page]);
    setPage(nextPage);
  }

  function goBack() {
    setHistory(prev => {
      const copy = [...prev];
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
            ← Volver
          </button>
        )}
        {ROUTES.map(({ key, Page }) =>
          page === key && (
            <Page
              key={key}
              onNavigate={navigate}
              {...(EXTRA_PROPS[key]?.(navigate) ?? {})}
            />
          )
        )}
      </div>
    </CvProvider>
  );
}
