import comillasLogo from '../assets/comillas-logo.svg';
import { useAuth } from '../context/useAuth.js';

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <img className="brand-logo" src={comillasLogo} alt="Comillas Universidad Pontificia" />
        <span>
          <strong>CV Comillas</strong>
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
