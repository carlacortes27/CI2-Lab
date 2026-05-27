export default function Navbar({ currentPage, onNavigate }) {
  const links = [
    ['home', 'Inicio'],
    ['create', 'Crear CV'],
    ['upload', 'Subir CV'],
    ['preview', 'Vista previa'],
  ];

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
        {links.map(([page, label]) => (
          <button
            key={page}
            type="button"
            className={currentPage === page ? 'active' : ''}
            onClick={() => onNavigate(page)}
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
