import { useAuth } from '../../context/useAuth.js';

export default function HomePage({ onNavigate }) {
  const { user, logout } = useAuth();
  const cards = [
    {
      icon: 'ID',
      title: 'Crear CV',
      text: 'Diseña un CV profesional con plantillas adaptadas al perfil universitario.',
      action: 'Crear CV',
      page: 'create',
    },
    {
      icon: 'PDF',
      title: 'Subir o mejorar CV',
      text: 'Carga tu CV actual para revisarlo, mejorarlo y llevarlo a una plantilla limpia.',
      action: 'Mejorar CV',
      page: 'upload',
    },
    {
      icon: 'OPE',
      title: 'OPE / Ofertas',
      text: 'Consulta prácticas y oportunidades de empleo conectadas con Comillas.',
      action: 'Ver ofertas',
      page: 'ope',
    },
    {
      icon: 'INFO',
      title: 'Contacto OPE',
      text: 'Conecta con la Oficina de Prácticas y Empleo para resolver tus dudas.',
      action: 'Ver contacto',
      isContact: true,
    },
  ];

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Comillas Career</p>
          <h1>Impulsa tu carrera desde Comillas</h1>
          <p>
            Crea tu CV, mejora tu perfil y encuentra prácticas u oportunidades ajustadas a tu
            trayectoria desde un mismo espacio.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <span className="hero-user">Hola, {user.name}</span>
                <button type="button" className="dark-button" onClick={() => onNavigate('create')}>
                  Crear mi CV
                </button>
                <button type="button" className="outline-button" onClick={logout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button type="button" className="dark-button" onClick={() => onNavigate('login')}>
                  Iniciar sesión
                </button>
                <button type="button" className="outline-button" onClick={() => onNavigate('register')}>
                  Registrarse
                </button>
              </>
            )}
          </div>
          <p className="hero-note">
            Una plataforma para estudiantes de Comillas que preparan su futuro profesional.
          </p>
        </div>

        <div className="hero-device" aria-hidden="true">
          <div className="laptop-panel">
            <div className="panel-top">
              <span />
              <span />
            </div>
            <div className="panel-grid">
              <div className="panel-sidebar" />
              <div className="panel-main">
                <strong>Hola, Marta</strong>
                <div className="panel-stats">
                  <span>5</span>
                  <span>12</span>
                  <span>2</span>
                </div>
                <div className="panel-line wide" />
                <div className="panel-line" />
                <div className="panel-line short" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="action-grid" aria-label="Acciones principales">
        {cards.map(card => (
          <article className="action-card" key={card.title}>
            <span className="card-icon">{card.icon}</span>
            <h2>{card.title}</h2>
            {card.isContact ? (
              <div className="contact-content">
                <p className="contact-item">
                  <strong>Email:</strong>
                  <br />
                  <a href="mailto:ope@comillas.edu">ope@comillas.edu</a>
                </p>
                <p className="contact-item">
                  <strong>Teléfono:</strong>
                  <br />
                  <a href="tel:+34915406000">+34 91 540 6000</a>
                </p>
                <p className="contact-item">
                  <strong>Dirección:</strong>
                  <br />
                  Calle Alberto Aguilera, 32
                  <br />
                  28015 Madrid
                </p>
              </div>
            ) : (
              <p>{card.text}</p>
            )}
            {!card.isContact && (
              <button 
                type="button" 
                onClick={() => {
                  if (!user && ['create', 'upload', 'ope'].includes(card.page)) {
                    onNavigate('login');
                  } else {
                    onNavigate(card.page);
                  }
                }}
              >
                {card.action}
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
