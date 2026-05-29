import { useAuth } from '../../context/useAuth.js';
import { useRedirect } from '../../context/RedirectContext.jsx';
import icaiScreenImage from '../../assets/Imagen pantalla icai.png';

const CARD_ICONS = {
  editDocument: (
    <>
      <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      <path d="M14 4v5h5" />
      <path d="m13 15 5.4-5.4a1.4 1.4 0 0 1 2 2L15 17l-3 1 1-3Z" />
    </>
  ),
  uploadDocument: (
    <>
      <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      <path d="M14 4v5h5" />
      <path d="M12 17V11" />
      <path d="m9 14 3-3 3 3" />
    </>
  ),
  briefcase: (
    <>
      <path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <path d="M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <path d="M3 12h18" />
      <path d="M10 12v2h4v-2" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M5 13h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1Z" />
      <path d="M19 13h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1Z" />
      <path d="M16 19c0 1.1-.9 2-2 2h-2" />
      <path d="M10 21h2" />
    </>
  ),
};

function CardIcon({ type, fallback }) {
  if (!type) return fallback;

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {CARD_ICONS[type]}
    </svg>
  );
}

export default function HomePage({ onNavigate }) {
  const { user, logout } = useAuth();
  const { saveIntendedPage } = useRedirect();
  const cards = [
    {
      iconType: 'editDocument',
      title: 'Crear CV',
      text: 'Diseña un CV profesional con plantillas adaptadas al perfil universitario.',
      action: 'Crear CV',
      page: 'create',
    },
    {
      iconType: 'uploadDocument',
      title: 'Subir o mejorar CV',
      text: 'Carga tu CV actual para revisarlo, mejorarlo y llevarlo a una plantilla limpia.',
      action: 'Mejorar CV',
      page: 'upload',
    },
    {
      iconType: 'briefcase',
      title: 'Ofertas',
      text: 'Consulta prácticas y oportunidades de empleo conectadas con Comillas.',
      action: 'Ver ofertas',
      page: 'ope',
    },
    {
      iconType: 'headset',
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
            <img src={icaiScreenImage} alt="" className="laptop-screen-image" />
          </div>
        </div>
      </section>

      <section className="action-grid" aria-label="Acciones principales">
        {cards.map(card => (
          <article className="action-card" key={card.title}>
            <span className="card-icon">
              <CardIcon type={card.iconType} fallback={card.icon} />
            </span>
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
                    saveIntendedPage(card.page);
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
