import { useCv } from '../../context/CvContext.jsx';

const labels = {
  summary: 'Sobre mí',
  education: 'Educación',
  experience: 'Experiencia laboral',
  projects: 'Proyectos destacados',
  technicalSkills: 'Competencias técnicas',
  personalSkills: 'Competencias personales',
  languages: 'Idiomas',
  certifications: 'Certificaciones',
  volunteering: 'Voluntariados',
};

const photoTemplates = new Set(['moderna', 'profesional']);

export default function CVPreview() {
  const { cv } = useCv();
  const p = cv.personal;
  const s = cv.sections;
  const accent = cv.style.accentColor;
  const showPhoto = photoTemplates.has(cv.style.template) && p.photoUrl;

  return (
    <article
      className={`cv-sheet template-${cv.style.template} font-${cv.style.fontSize || 'medium'}`}
      style={{ '--accent': accent, fontFamily: cv.style.fontFamily }}
    >
      <header className="cv-head">
        {showPhoto ? <img className="cv-photo" src={p.photoUrl} alt="" /> : <div className="cv-avatar">{initials(p.fullName)}</div>}
        <div>
          <h1>{p.fullName || 'Nombre completo'}</h1>
          {p.headline && <p>{p.headline}</p>}
          <div className="cv-contact">
            {[p.phone, p.email, p.location, ...(p.links || []).filter(link => link.url && link.label !== 'GitHub').map(link => link.url)]
              .filter(Boolean)
              .map(item => <span key={item}>{item}</span>)}
          </div>
        </div>
      </header>

      {cv.layout.order.map(key => {
        if (!s[key]?.visible) return null;
        return <PreviewSection key={key} sectionKey={key} data={s[key]} />;
      })}
    </article>
  );
}

function PreviewSection({ sectionKey, data }) {
  return (
    <section className="cv-section">
      <h2>{labels[sectionKey]}</h2>
      {sectionKey === 'summary' && <p className="cv-summary">{fourLines(data.text)}</p>}
      {sectionKey === 'education' && data.items.map(item => <TimelineItem key={item.id} title={item.degree} subtitle={`${item.institution}${item.location ? ` | ${item.location}` : ''}`} date={item.duration || dateRange(item)} bullets={item.bullets} />)}
      {sectionKey === 'experience' && data.items.map(item => <TimelineItem key={item.id} title={item.role} subtitle={item.company} date={item.duration || dateRange(item)} bullets={item.bullets} />)}
      {sectionKey === 'projects' && data.items.map(item => <TimelineItem key={item.id} title={item.name} subtitle={[item.description, item.technologies].filter(Boolean).join(' | ')} date={item.link} bullets={item.bullets} />)}
      {sectionKey === 'technicalSkills' && <SkillGroups groups={data.groups} />}
      {sectionKey === 'personalSkills' && <Pills items={data.items} />}
      {sectionKey === 'languages' && (
        <div className="cv-list-grid">
          {data.items.map(item => <span key={item.id}><strong>{item.name}</strong> {item.level}{item.certificate ? ` | ${item.certificate}` : ''}{item.note ? ` | ${item.note}` : ''}</span>)}
        </div>
      )}
      {sectionKey === 'certifications' && data.items.map(item => (
        <div className="cv-line" key={item.id}>
          <strong>{item.name}</strong>
          <span>{[item.issuer, item.level, item.date].filter(Boolean).join(' | ')}</span>
        </div>
      ))}
      {sectionKey === 'volunteering' && data.items.map(item => <div className="cv-line" key={item.id}><strong>{item.organization}</strong><span>{[item.date, item.description].filter(Boolean).join(' | ')}</span></div>)}
    </section>
  );
}

function TimelineItem({ title, subtitle, date, bullets = [] }) {
  return (
    <div className="cv-item">
      <div className="cv-item-top">
        <strong>{title}</strong>
        {date && <span>{date}</span>}
      </div>
      {subtitle && <p className="cv-subtitle">{subtitle}</p>}
      {bullets?.length > 0 && (
        <ul>
          {bullets.filter(bullet => bullet.text).slice(0, 3).map(bullet => <li key={bullet.id}>{bullet.text}</li>)}
        </ul>
      )}
    </div>
  );
}

function SkillGroups({ groups = {} }) {
  return (
    <div className="skill-groups">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <strong>{group}</strong>
          <Pills items={items} />
        </div>
      ))}
    </div>
  );
}

function Pills({ items = [] }) {
  return (
    <div className="pill-list">
      {items.map(item => <span key={item}>{item}</span>)}
    </div>
  );
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CV';
}

function dateRange(item) {
  return [item.startDate, item.current ? 'Actualidad' : item.endDate].filter(Boolean).join(' - ');
}

function fourLines(text = '') {
  return String(text).split('\n').slice(0, 4).join('\n');
}
