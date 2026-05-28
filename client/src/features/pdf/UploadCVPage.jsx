import { useRef, useState } from 'react';
import CVPreview from '../editor/forms/CVPreview.jsx';
import TemplateSelector from '../editor/forms/TemplateSelector.jsx';
import CVPartEditor from './CVPartEditor.jsx';
import { downloadAsPDF, improveUploadedCV } from '../../services/cvService.js';
import { useCv } from '../../context/CvContext.jsx';

export default function UploadCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState('summary');

  function pickFile(selected) {
    const next = selected?.[0];
    if (!next) return;

    if (next.type !== 'application/pdf') {
      setStatus('Solo se aceptan archivos PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(next);
    setConverted(false);
    setSelectedBlockId('summary');
    setStatus(`PDF seleccionado: ${next.name}. Ahora puedes elegir plantilla y extraer la informacion.`);
  }

  function resetUpload() {
    setFile(null);
    setConverted(false);
    setSelectedBlockId('summary');
    setStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function extractPdfData(pdfFile) {
    setLoading(true);
    setStatus(`Leyendo ${pdfFile.name} y extrayendo la informacion del CV...`);

    try {
      const result = await improveUploadedCV(pdfFile);
      if (result?.cvData) {
        const cvWithStyle = { ...result.cvData, style: { ...result.cvData.style, ...cv.style } };
        dispatch({ type: 'SET_CV', payload: cvWithStyle });
        setConverted(true);
        setSelectedBlockId('summary');
        setStatus('Informacion extraida. Elige una plantilla para reorganizar el CV.');
      }
    } catch (error) {
      setConverted(false);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setLoading(true);
    setStatus('Generando PDF...');
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
        <h1>Subir o mejorar CV</h1>
        <p>
          Sube un PDF con tu CV. La aplicacion extrae sus datos y genera un CV nuevo
          con la plantilla que elijas.
        </p>

        <ol className="upload-steps" aria-label="Flujo de conversion">
          <li className={file ? 'done' : 'active'}>Subir PDF</li>
          <li className={file ? 'active' : ''}>Elegir plantilla</li>
          <li className={converted ? 'active' : ''}>Editar partes</li>
          <li className={converted ? 'active' : ''}>Descargar PDF</li>
        </ol>

        <label
          className="dropzone"
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            pickFile(event.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={event => pickFile(event.target.files)}
          />
          <span className="drop-icon">PDF</span>
          <strong>{file ? file.name : 'Arrastra aqui tu CV en PDF'}</strong>
          <small>
            {file
              ? `${Math.round(file.size / 1024)} KB. Pulsa aqui para elegir otro PDF.`
              : 'o pulsa para seleccionar archivo'}
          </small>
        </label>

        {loading && <p className="status-message">Procesando el PDF...</p>}
        {status && <p className="status-message">{status}</p>}

        {file && (
          <div className="upload-actions">
            <button
              type="button"
              className={converted ? undefined : 'primary-button'}
              disabled={loading}
              onClick={() => extractPdfData(file)}
            >
              {loading ? 'Extrayendo...' : converted ? 'Volver a extraer informacion' : 'Extraer informacion del PDF'}
            </button>
            {converted && (
              <button type="button" className="primary-button" disabled={loading} onClick={handleDownload}>
                {loading ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            )}
            <button type="button" disabled={loading} onClick={() => fileInputRef.current?.click()}>
              Subir otro PDF
            </button>
            <button type="button" disabled={loading} onClick={resetUpload}>
              Empezar de nuevo
            </button>
            {converted && (
              <button type="button" onClick={() => onNavigate('create')}>
                Editar datos extraidos
              </button>
            )}
          </div>
        )}

        {converted && <CVPartEditor selectedBlockId={selectedBlockId} />}
      </section>

      <section className="upload-side">
        {file ? (
          <>
            <h2>Elige una plantilla</h2>
            <TemplateSelector />
            {converted ? (
              <>
                <h2 className="preview-title">Preview del nuevo CV</h2>
                <div className="preview-mini">
                  <CVPreview
                    editable
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                  />
                </div>
              </>
            ) : (
              <div className="upload-empty-preview compact">
                <span className="drop-icon">PDF</span>
                <h2>Extrae los datos</h2>
                <p>Despues de elegir plantilla, pulsa "Extraer informacion del PDF" para generar la preview.</p>
              </div>
            )}
          </>
        ) : (
          <div className="upload-empty-preview">
            <span className="drop-icon">CV</span>
            <h2>Preview pendiente</h2>
            <p>Cuando subas el PDF, aqui veras el nuevo CV generado con la informacion extraida.</p>
          </div>
        )}
      </section>
    </main>
  );
}
