import icaiLogo from '../assets/imagen comillas.jpg';
import { useAuth } from '../context/useAuth.js';

export default function Navbar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const hiddenForShell = currentPage === 'create' || currentPage === 'ope';

  if (hiddenForShell) return null;

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <img className="brand-logo" src={icaiLogo} alt="ICAI Universidad Pontificia Comillas" />
        <span>
          <strong>OPE Comillas</strong>
          <small>Comillas Career</small>
        </span>
      </button>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="session-name">Hola, {user.name}</span>
            <button type="button" className="ghost-button" onClick={logout}>
              Cerrar sesion
            </button>
          </>
        ) : (
          <>
            <button type="button" className="ghost-button" onClick={() => onNavigate('login')}>
              Iniciar sesion
            </button>
            <button type="button" className="primary-button" onClick={() => onNavigate('register')}>
              Registrarse
            </button>
          </>
        )}
      </div>
    </header>
  );
}
