import { useCv } from '../../context/CvContext.jsx';

const templates = [
  { id: 'clasica', name: 'Clasica', accent: '#f5b21b', layout: 'split' },
  { id: 'moderna', name: 'Moderna', accent: '#2563eb', layout: 'band' },
  { id: 'tecnica', name: 'Tecnica', accent: '#10b981', layout: 'code' },
  { id: 'minimalista', name: 'Minimalista', accent: '#111827', layout: 'plain' },
  { id: 'profesional', name: 'Profesional', accent: '#7c3aed', layout: 'line' },
];

export default function TemplateSelector() {
  const { cv, dispatch } = useCv();

  return (
    <div className="template-selector">
      <div>
        <p className="eyebrow">Plantillas</p>
        <h2>Elige estilo</h2>
      </div>
      <div className="template-list">
        {templates.map(template => (
          <button
            key={template.id}
            type="button"
            className={cv.style.template === template.id ? 'template-card selected' : 'template-card'}
            onClick={() => dispatch({ type: 'UPDATE_STYLE', payload: { template: template.id, accentColor: template.accent } })}
          >
            <span className={`template-mini ${template.layout}`} style={{ '--accent': template.accent }} />
            <strong>{template.name}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
