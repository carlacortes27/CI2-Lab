export default function HomePage({ onNavigate }) {
  const cards = [
    {
      icon: 'CV',
      title: 'Crear CV',
      text: 'Construye un CV profesional desde cero, elige plantilla y revisa el resultado en tiempo real.',
      action: 'Empezar',
      page: 'create',
    },
    {
      icon: 'PDF',
      title: 'Subir CV',
      text: 'Carga un PDF existente para analizarlo, mejorarlo y adaptarlo a una plantilla profesional.',
      action: 'Subir PDF',
      page: 'upload',
    },
  ];

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Comillas Career</p>
          <h1>Impulsa tu carrera desde un CV claro y profesional</h1>
          <p>
            Crea, mejora, traduce y descarga tu curriculum con una estructura pensada para estudiantes
            y primeras experiencias profesionales.
          </p>
          <div className="hero-actions">
            <button type="button" className="dark-button" onClick={() => onNavigate('create')}>
              Crear mi CV
            </button>
            <button type="button" className="outline-button" onClick={() => onNavigate('upload')}>
              Subir CV existente
            </button>
          </div>
        </div>
        <div className="hero-device" aria-hidden="true">
          <div className="mini-dashboard">
            <div className="mini-sidebar" />
            <div className="mini-content">
              <span />
              <span />
              <span />
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </section>

      <section className="action-grid">
        {cards.map(card => (
          <article className="action-card" key={card.title}>
            <span className="card-icon">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <button type="button" onClick={() => onNavigate(card.page)}>
              {card.action}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
