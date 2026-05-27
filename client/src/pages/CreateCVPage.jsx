import { useState } from 'react';
import CVForm from '../components/cv/CVForm.jsx';
import CVPreview from '../components/cv/CVPreview.jsx';
import TemplateSelector from '../components/cv/TemplateSelector.jsx';
import { correctSpelling, exportToPDF, savePreviewToCloud, translateCV } from '../services/cvService.js';
import { useCv } from '../context/CvContext.jsx';

export default function CreateCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const [status, setStatus] = useState('');

  async function runBackendAction(action, successMessage) {
    setStatus('');
    try {
      const result = await action();
      if (result?.cvData) dispatch({ type: 'SET_CV', payload: result.cvData });
      setStatus(successMessage);
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="builder-page">
      <aside className="builder-sidebar">
        <p className="eyebrow">CV Comillas</p>
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
            <button type="button" onClick={() => runBackendAction(() => correctSpelling(cv), 'Corrección aplicada.')}>Corrección ortográfica</button>
            <button type="button" onClick={() => runBackendAction(() => translateCV(cv, 'en'), 'Traducción a inglés solicitada.')}>Traducir a inglés</button>
            <button type="button" onClick={() => runBackendAction(() => translateCV(cv, 'es'), 'Traducción a español solicitada.')}>Traducir a español</button>
            <button type="button" className="primary-button" onClick={exportToPDF}>Descargar PDF</button>
            <button type="button" onClick={() => runBackendAction(() => savePreviewToCloud(cv), 'CV enviado a la nube.')}>Guardar en la nube</button>
          </div>
        </div>
        {status && <p className="status-message">{status}</p>}
        <div className="builder-columns">
          <CVForm />
          <div className="preview-pane">
            <h2>Vista previa A4</h2>
            <CVPreview />
          </div>
        </div>
      </section>
    </main>
  );
}
