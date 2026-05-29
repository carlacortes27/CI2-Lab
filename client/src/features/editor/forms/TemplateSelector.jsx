import { useCv } from '../../../context/CvContext.jsx';

const templates = [
  { id: 'clasica', name: 'Clásica', accent: '#111827', layout: 'split' },
  { id: 'moderna', name: 'Moderna', accent: '#2563eb', layout: 'band' },
  { id: 'tecnica', name: 'Técnica', accent: '#0f766e', layout: 'code' },
  { id: 'minimalista', name: 'Minimalista', accent: '#111827', layout: 'plain' },
  { id: 'profesional', name: 'Profesional', accent: '#0f2f4f', layout: 'line' },
];

const fonts = ['Arial', 'Georgia', 'Times New Roman', 'Inter'];
const fontSizes = ['8', '10', '11', '12', '14', '16', '18', '20', '22', '24'];

export default function TemplateSelector() {
  const { cv, dispatch } = useCv();

  return (
    <div className="template-selector">
      <div>
        <p className="eyebrow">OPE Comillas</p>
        <h2>Plantilla y estilo</h2>
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
      <div className="style-controls">
        <label>
          <span>Tipo de letra</span>
          <select
            value={cv.style.fontFamily?.split(',')[0] || 'Inter'}
            onChange={event => dispatch({ type: 'UPDATE_STYLE', payload: { fontFamily: event.target.value } })}
          >
            {fonts.map(font => <option key={font}>{font}</option>)}
          </select>
        </label>
        <label>
          <span>Tamaño</span>
          <select
            value={cv.style.fontSize || '11'}
            onChange={event => dispatch({ type: 'UPDATE_STYLE', payload: { fontSize: event.target.value } })}
          >
            {fontSizes.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
