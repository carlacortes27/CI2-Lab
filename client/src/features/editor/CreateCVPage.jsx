import { useState } from 'react';
import CVForm from './forms/CVForm.jsx';
import CVPreview from './forms/CVPreview.jsx';
import TemplateSelector from './forms/TemplateSelector.jsx';
import { correctSpelling, downloadAsPDF, translateCV } from '../../services/cvService.js';
import { useCv } from '../../context/CvContext.jsx';

export default function CreateCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState('');

  async function runAction(label, action, successMessage) {
    setStatus('');
    setLoading(label);
    try {
      const result = await action();
      if (result?.cvData) dispatch({ type: 'SET_CV', payload: result.cvData });
      setStatus(successMessage);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading('');
    }
  }

  async function handleDownload() {
    setStatus('');
    setLoading('pdf');
    try {
      await downloadAsPDF(cv.personal?.fullName || 'cv-comillas');
      setStatus('PDF descargado correctamente.');
    } catch (error) {
      setStatus(`Error al generar PDF: ${error.message}`);
    } finally {
      setLoading('');
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
            <button
              type="button"
              disabled={!!loading}
              onClick={() => runAction('spell', () => correctSpelling(cv), 'Corrección aplicada.')}
            >
              {loading === 'spell' ? 'Corrigiendo...' : 'Corrección ortográfica'}
            </button>
            <button
              type="button"
              disabled={!!loading}
              onClick={() => runAction('translate-en', () => translateCV(cv, 'en'), 'CV traducido al inglés.')}
            >
              {loading === 'translate-en' ? 'Traduciendo...' : 'Traducir a inglés'}
            </button>
            <button
              type="button"
              disabled={!!loading}
              onClick={() => runAction('translate-es', () => translateCV(cv, 'es'), 'CV traducido al español.')}
            >
              {loading === 'translate-es' ? 'Traduciendo...' : 'Traducir a español'}
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!!loading}
              onClick={handleDownload}
            >
              {loading === 'pdf' ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
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
