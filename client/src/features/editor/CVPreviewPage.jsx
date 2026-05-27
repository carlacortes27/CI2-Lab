import { useState } from 'react';
import CVPreview from './forms/CVPreview.jsx';
import TemplateSelector from './forms/TemplateSelector.jsx';
import { exportToPDF, savePreviewToCloud } from '../../services/cvService.js';
import { useCv } from '../../context/CvContext.jsx';

export default function CVPreviewPage({ onNavigate }) {
  const { cv } = useCv();
  const [status, setStatus] = useState('');

  async function saveCloud() {
    setStatus('');
    try {
      await savePreviewToCloud(cv);
      setStatus('CV enviado a la nube.');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="preview-page">
      <section className="preview-toolbar">
        <div>
          <p className="eyebrow">CV Comillas</p>
          <h1>Vista previa del CV</h1>
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={() => onNavigate('create')}>Editar</button>
          <button type="button" className="primary-button" onClick={exportToPDF}>Descargar PDF</button>
          <button type="button" onClick={saveCloud}>Guardar en la nube</button>
        </div>
      </section>
      {status && <p className="status-message">{status}</p>}
      <TemplateSelector />
      <div className="preview-center">
        <CVPreview />
      </div>
    </main>
  );
}
