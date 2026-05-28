import { useState } from 'react';
import CVPreview from './forms/CVPreview.jsx';
import TemplateSelector from './forms/TemplateSelector.jsx';
import { downloadAsPDF } from '../../services/cvService.js';
import { useCv } from '../../context/CvContext.jsx';

export default function CVPreviewPage({ onNavigate }) {
  const { cv } = useCv();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setStatus('');
    setLoading(true);
    try {
      await downloadAsPDF(cv);
      setStatus('PDF descargado correctamente.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
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
          <button type="button" className="primary-button" disabled={loading} onClick={handleDownload}>
            {loading ? 'Generando PDF…' : 'Descargar PDF'}
          </button>
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
