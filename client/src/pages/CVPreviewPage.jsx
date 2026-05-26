import CVPreview from '../components/cv/CVPreview.jsx';
import TemplateSelector from '../components/cv/TemplateSelector.jsx';
import { exportToPDF } from '../services/cvService.js';

export default function CVPreviewPage({ onNavigate }) {
  return (
    <main className="preview-page">
      <section className="preview-toolbar">
        <div>
          <p className="eyebrow">Previsualización</p>
          <h1>CV final</h1>
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={() => onNavigate('create')}>Editar</button>
          <button type="button" className="primary-button" onClick={exportToPDF}>Descargar PDF</button>
        </div>
      </section>
      <TemplateSelector />
      <div className="preview-center">
        <CVPreview />
      </div>
    </main>
  );
}
