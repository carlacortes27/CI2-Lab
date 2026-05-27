import icaiLogo from '../assets/imagen comillas.jpg';

export default function Navbar({ onNavigate }) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <img className="brand-logo" src={icaiLogo} alt="ICAI Comillas" />
        <span>
          <strong>CV Comillas</strong>
          <small>Comillas Career</small>
        </span>
      </button>

      <div className="nav-actions">
        <button type="button" className="ghost-button">Iniciar sesion</button>
      </div>
    </header>
  );
}
