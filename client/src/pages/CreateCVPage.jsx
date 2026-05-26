import CVForm from '../components/cv/CVForm.jsx';
import CVPreview from '../components/cv/CVPreview.jsx';
import TemplateSelector from '../components/cv/TemplateSelector.jsx';
import { correctCVText, exportToPDF, translateCV } from '../services/cvService.js';
import { useCv } from '../context/CvContext.jsx';

export default function CreateCVPage({ onNavigate }) {
  const { cv } = useCv();

  return (
    <main className="builder-page">
      <aside className="builder-sidebar">
        <p className="eyebrow">Construye tu CV</p>
        <h1>Crear CV</h1>
        <p>Completa cada bloque y visualiza el resultado al instante.</p>
        <div className="choice-panel">
          <button type="button" className="choice active">Crear desde cero</button>
          <button type="button" className="choice" onClick={() => onNavigate('upload')}>
            Mejorar CV existente
          </button>
        </div>
        <button type="button" className="outline-button full" onClick={() => onNavigate('preview')}>
          Abrir vista previa
        </button>
      </aside>

      <section className="builder-workspace">
        <div className="builder-header">
          <TemplateSelector />
          <div className="toolbar-actions">
            <button type="button" onClick={() => correctCVText(cv)}>Corregir ortografía</button>
            <button type="button" onClick={() => translateCV(cv, 'en')}>Traducir a inglés</button>
            <button type="button" onClick={() => translateCV(cv, 'es')}>Traducir a español</button>
            <button type="button" className="primary-button" onClick={exportToPDF}>Descargar PDF</button>
          </div>
        </div>
        <div className="builder-columns">
          <CVForm />
          <div className="preview-pane">
            <h2>Vista previa en tiempo real</h2>
            <CVPreview />
          </div>
        </div>
      </section>
    </main>
  );
}
