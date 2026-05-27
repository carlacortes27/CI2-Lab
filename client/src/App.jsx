/**
 * App.jsx — Shell principal de la aplicación
 *
 * ARCHIVO CONGELADO. No añadir rutas aquí.
 * Para añadir una ruta nueva, edita routes.config.js.
 */
import { useState, useRef } from 'react';
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

/** Duración (ms) de la animación de salida — debe coincidir con el CSS. */
const LEAVE_MS = 190;

export default function App() {
  const [page, setPage]       = useState('home');
  const [history, setHistory] = useState([]);
  const [leaving, setLeaving] = useState(false);
  const isAnimating            = useRef(false);

  function navigate(nextPage) {
    if (nextPage === page || isAnimating.current) return;
    isAnimating.current = true;
    setLeaving(true);
    setTimeout(() => {
      setHistory(prev => [...prev, page]);
      setPage(nextPage);
      setLeaving(false);
      isAnimating.current = false;
    }, LEAVE_MS);
  }

  function goBack() {
    if (isAnimating.current) return;
    const copy = [...history];
    const last = copy.pop() || 'home';
    isAnimating.current = true;
    setLeaving(true);
    setTimeout(() => {
      setHistory(copy);
      setPage(last);
      setLeaving(false);
      isAnimating.current = false;
    }, LEAVE_MS);
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
        <div className={`page-wrapper ${leaving ? 'page-leaving' : 'page-entering'}`}>
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
      </div>
    </CvProvider>
  );
}
