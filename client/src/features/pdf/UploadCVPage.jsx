import { useState } from 'react';
import CVPreview from '../editor/forms/CVPreview.jsx';
import TemplateSelector from '../editor/forms/TemplateSelector.jsx';
import { downloadAsPDF, improveUploadedCV } from '../../services/cvService.js';
import { useCv } from '../../context/CvContext.jsx';

export default function UploadCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState(false);

  function pickFile(selected) {
    const next = selected?.[0];
    if (!next) return;
    if (next.type !== 'application/pdf') {
      setStatus('Solo se aceptan archivos PDF.');
      return;
    }
    setFile(next);
    setConverted(false);
    setStatus(`Archivo cargado: ${next.name}`);
  }

  async function convertToTemplate() {
    if (!file) return;
    setLoading(true);
    setStatus('Extrayendo contenido del PDF… puede tardar unos segundos.');
    try {
      const result = await improveUploadedCV(file);
      if (result?.cvData) {
        // Preservar la plantilla que el usuario haya elegido
        const cvWithStyle = { ...result.cvData, style: { ...result.cvData.style, ...cv.style } };
        dispatch({ type: 'SET_CV', payload: cvWithStyle });
        setConverted(true);
        setStatus('CV extraído correctamente. Elige una plantilla y descarga tu PDF.');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setLoading(true);
    setStatus('Generando PDF…');
    try {
      await downloadAsPDF(cv);
      setStatus('PDF descargado.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="upload-page">
      <section className="upload-card">
        <p className="eyebrow">CV Comillas</p>
        <h1>Mejorar CV existente</h1>
        <p>Sube tu CV en PDF, elige una plantilla y descarga tu CV renovado con el nuevo diseño.</p>

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
          <button
            type="button"
            className="primary-button"
            disabled={!file || loading}
            onClick={convertToTemplate}
          >
            {loading && !converted ? 'Procesando…' : 'Convertir a plantilla'}
          </button>

          {converted && (
            <>
              <button type="button" disabled={loading} onClick={handleDownload}>
                {loading ? 'Generando PDF…' : 'Descargar PDF'}
              </button>
              <button type="button" onClick={() => onNavigate('create')}>
                Editar en el editor
              </button>
            </>
          )}
        </div>

        {converted && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
            Cambia la plantilla en el panel derecho para ver diferentes estilos.
          </p>
        )}
      </section>

      <section className="upload-side">
        <h2>Elige tu plantilla</h2>
        <TemplateSelector />
        <div className="preview-mini">
          <CVPreview />
        </div>
      </section>
    </main>
  );
}
