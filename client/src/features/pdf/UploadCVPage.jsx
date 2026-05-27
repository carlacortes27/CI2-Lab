import { useState } from 'react';
import CVPreview from '../editor/forms/CVPreview.jsx';
import { useCv } from '../../context/CvContext.jsx';
import { analyzeUploadedCV, exportToPDF } from '../../services/cvService.js';

const templates = [
  { id: 'clasica', name: 'Clásica', accent: '#111827', layout: 'split' },
  { id: 'moderna', name: 'Moderna', accent: '#2563eb', layout: 'band' },
  { id: 'tecnica', name: 'Técnica', accent: '#0f766e', layout: 'code' },
  { id: 'minimalista', name: 'Minimalista', accent: '#111827', layout: 'plain' },
  { id: 'profesional', name: 'Profesional', accent: '#0f2f4f', layout: 'line' },
];

export default function UploadCVPage() {
  const { dispatch } = useCv();
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('upload');
  const [status, setStatus] = useState('');

  async function pickFile(selected) {
    const next = selected?.[0];
    if (!next) return;

    if (!isPdf(next)) {
      setFile(null);
      setStep('upload');
      setStatus('Solo se aceptan archivos PDF.');
      return;
    }

    setFile(next);
    setStep('analyzing');
    setStatus('Analizando el contenido del CV...');

    try {
      const result = await analyzeUploadedCV(next);
      if (!result?.cvData) {
        throw new Error('No se ha podido estructurar el contenido del PDF.');
      }
      dispatch({ type: 'SET_CV', payload: result.cvData });
      setStatus('Contenido extraído. Elige una plantilla.');
      setStep('templates');
    } catch (error) {
      setFile(null);
      setStep('upload');
      setStatus(error.message);
    }
  }

  function chooseTemplate(template) {
    dispatch({
      type: 'UPDATE_STYLE',
      payload: {
        template: template.id,
        accentColor: template.accent,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 'medium',
      },
    });
    setStep('preview');
    setStatus(`Plantilla ${template.name} aplicada.`);
  }

  function resetFlow() {
    setFile(null);
    setStep('upload');
    setStatus('');
  }

  return (
    <main className={`upload-page upload-flow upload-step-${step}`}>
      <section className="upload-card">
        <p className="eyebrow">CV Comillas</p>
        <h1>Sube tu CV</h1>

        {step === 'upload' && (
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
            <strong>Arrastra aquí tu CV en PDF</strong>
            <small>o pulsa para seleccionar archivo</small>
          </label>
        )}

        {step === 'analyzing' && (
          <div className="upload-progress">
            <span className="drop-icon">PDF</span>
            <strong>{file?.name}</strong>
            <small>Extrayendo educación, experiencia, idiomas, competencias y proyectos.</small>
          </div>
        )}

        {status && <p className="status-message">{status}</p>}

        {step === 'templates' && (
          <div className="upload-template-stage">
            <div>
              <h2>Elige plantilla</h2>
              <p>El contenido del PDF se recreará dentro del diseño seleccionado.</p>
            </div>
            <div className="template-list upload-template-list">
              {templates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  className="template-card"
                  onClick={() => chooseTemplate(template)}
                >
                  <span className={`template-mini ${template.layout}`} style={{ '--accent': template.accent }} />
                  <strong>{template.name}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="upload-actions">
            <button type="button" className="primary-button" onClick={exportToPDF}>Descargar PDF</button>
            <button type="button" className="outline-button" onClick={() => setStep('templates')}>Cambiar plantilla</button>
            <button type="button" className="ghost-button" onClick={resetFlow}>Subir otro PDF</button>
          </div>
        )}
      </section>

      {step === 'preview' && (
        <section className="upload-side">
          <h2>Preview del CV convertido</h2>
          <div className="preview-center">
            <CVPreview />
          </div>
        </section>
      )}
    </main>
  );
}

function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
