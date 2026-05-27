import { useState } from 'react';
import CVPreview from '../components/cv/CVPreview.jsx';
import TemplateSelector from '../components/cv/TemplateSelector.jsx';
import { analyzeUploadedCV, exportToPDF, improveUploadedCV, savePreviewToCloud } from '../services/cvService.js';
import { useCv } from '../context/CvContext.jsx';

export default function UploadCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  function pickFile(selected) {
    const next = selected?.[0];
    if (!next) return;
    if (next.type !== 'application/pdf') {
      setStatus('Solo se aceptan archivos PDF.');
      return;
    }
    setFile(next);
    setStatus(`Archivo cargado: ${next.name}`);
  }

  async function run(action, successMessage) {
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
    <main className="upload-page">
      <section className="upload-card">
        <p className="eyebrow">CV Comillas</p>
        <h1>Mejorar CV existente</h1>
        <p>Sube un PDF para analizarlo, mejorarlo y pasarlo a una plantilla editable.</p>

        <label
          className="dropzone"
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            pickFile(event.dataTransfer.files);
          }}
        >
          <input type="file" accept="application/pdf" onChange={event => pickFile(event.target.files)} />
          <span className="drop-icon">PDF</span>
          <strong>{file ? file.name : 'Arrastra aquí tu CV en PDF'}</strong>
          <small>{file ? `${Math.round(file.size / 1024)} KB` : 'o pulsa para seleccionar archivo'}</small>
        </label>

        {status && <p className="status-message">{status}</p>}

        <div className="upload-actions">
          <button type="button" disabled={!file} onClick={() => run(() => analyzeUploadedCV(file), 'Análisis del CV solicitado.')}>Analizar CV</button>
          <button type="button" disabled={!file} onClick={() => run(() => improveUploadedCV(file), 'Mejora del CV solicitada.')}>Mejorar CV</button>
          <button type="button" disabled={!file} onClick={() => onNavigate('create')}>Elegir plantilla</button>
          <button type="button" className="primary-button" disabled={!file} onClick={exportToPDF}>Descargar PDF</button>
          <button type="button" disabled={!file} onClick={() => run(() => savePreviewToCloud(cv), 'CV enviado a la nube.')}>Guardar en la nube</button>
        </div>
      </section>
      <section className="upload-side">
        <h2>Plantillas CV Comillas</h2>
        <TemplateSelector />
        <div className="preview-mini">
          <CVPreview />
        </div>
      </section>
    </main>
  );
}
