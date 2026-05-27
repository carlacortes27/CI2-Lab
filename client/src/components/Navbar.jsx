/**
 * Navbar.jsx — Barra de navegación principal
 *
 * ARCHIVO CONGELADO. No añadir enlaces aquí.
 * Para añadir una nueva sección al menú, pon nav:true en routes.config.js.
 */
import { ROUTES } from '../routes.config.js';

const NAV_LINKS = ROUTES.filter(r => r.nav);

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <span className="brand-mark">C</span>
        <span>
          <strong>CV Comillas</strong>
          <small>Editor profesional</small>
        </span>
      </button>
      <nav className="nav-links" aria-label="Navegación principal">
        {NAV_LINKS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={currentPage === key ? 'active' : ''}
            onClick={() => onNavigate(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="nav-actions">
        <button type="button" className="ghost-button">Iniciar sesión</button>
        <button type="button" className="primary-button" onClick={() => onNavigate('create')}>
          Crear CV
        </button>
      </div>
    </header>
  );
}
