import { useRef, useState } from 'react';
import CVPreview from '../editor/forms/CVPreview.jsx';
import TemplateSelector from '../editor/forms/TemplateSelector.jsx';
import CVPartEditor from './CVPartEditor.jsx';
import { downloadAsPDF, improveUploadedCV } from '../../services/cvService.js';
import { useCv } from '../../context/CvContext.jsx';

const accentColors = [
  '#f5b21b',
  '#111827',
  '#0f2f4f',
  '#2563eb',
  '#0f766e',
  '#7c3aed',
  '#b45309',
];

export default function UploadCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [photoName, setPhotoName] = useState('');
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
    setStatus(`PDF seleccionado: ${next.name}. Puedes extraer sus datos o seguir editando manualmente.`);
  }

  function pickPhoto(selected) {
    const next = selected?.[0];
    if (!next) return;

    if (!['image/jpeg', 'image/jpg'].includes(next.type)) {
      setStatus('La imagen debe estar en formato JPG.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    if (next.size > 2 * 1024 * 1024) {
      setStatus('La imagen JPG no puede superar 2 MB.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'UPDATE_PERSONAL', payload: { photoUrl: reader.result } });
      setPhotoName(next.name);
      setStatus(`Imagen seleccionada: ${next.name}. Aparecera en el CV final.`);
    };
    reader.readAsDataURL(next);
  }

  function removePhoto() {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { photoUrl: '' } });
    setPhotoName('');
    if (photoInputRef.current) photoInputRef.current.value = '';
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
        const cvWithStyle = {
          ...result.cvData,
          personal: {
            ...(result.cvData.personal || {}),
            photoUrl: result.cvData.personal?.photoUrl || cv.personal?.photoUrl || '',
          },
          style: { ...result.cvData.style, ...cv.style },
          preferences: { ...(result.cvData.preferences || {}), ...(cv.preferences || {}) },
        };
        dispatch({ type: 'SET_CV', payload: cvWithStyle });
        setConverted(true);
        setSelectedBlockId('summary');
        setStatus('Informacion extraida. Ya puedes editar secciones, diseno y texto en la vista previa.');
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
      <section className="upload-workspace">
        <button type="button" className="upload-back" onClick={() => onNavigate?.('home')}>
          Volver
        </button>

        <div className="upload-hero">
          <span className="section-mark" aria-hidden="true" />
          <h1>Mejorar CV</h1>
          <p>
            Importa un PDF si lo tienes, edita el contenido por secciones y ajusta el diseno con
            una vista previa A4 siempre visible.
          </p>
        </div>

        <section className="upload-card upload-import-card">
          <div className="upload-card-header">
            <div>
              <p className="eyebrow">Importacion opcional</p>
              <h2>Subir PDF</h2>
            </div>
            {converted && <span className="upload-state-pill">Datos extraidos</span>}
          </div>

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
                ? `${formatFileSize(file.size)}. Pulsa para cambiar el archivo.`
                : 'o haz clic para seleccionar archivo. Tambien puedes editar sin subir PDF.'}
            </small>
          </label>

          {file && (
            <div className="upload-file-row">
              <span className="file-icon">PDF</span>
              <div>
                <strong>{file.name}</strong>
                <small>{formatFileSize(file.size)}</small>
              </div>
              <button type="button" aria-label="Quitar PDF" disabled={loading} onClick={resetUpload}>
                x
              </button>
            </div>
          )}

          {(loading || status) && (
            <p className={`status-message ${loading ? 'working' : ''}`}>
              {loading ? 'Procesando el PDF...' : status}
            </p>
          )}

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
            </div>
          )}
        </section>

        <section className="upload-card editor-shell-card">
          <CVPartEditor selectedBlockId={selectedBlockId} onSelectBlock={setSelectedBlockId} />
        </section>

        <section className="upload-card design-panel">
          <DesignPanel
            cv={cv}
            dispatch={dispatch}
            photoInputRef={photoInputRef}
            photoName={photoName}
            loading={loading}
            pickPhoto={pickPhoto}
            removePhoto={removePhoto}
          />
        </section>
      </section>

      <section className="upload-side">
        <div className="upload-preview-copy">
          <span className="section-mark" aria-hidden="true" />
          <h2>Vista previa A4</h2>
          <p>
            Edita secciones, plantilla, color y foto; el documento se actualiza al instante.
          </p>
        </div>

        <div className="preview-mini" aria-live="polite">
          <div className="preview-scale">
            <CVPreview
              editable
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />
          </div>
        </div>

        <div className="preview-privacy">
          Tu informacion se guarda en este navegador y solo tu puedes acceder a tu CV.
        </div>

        <button type="button" className="primary-button full preview-download" disabled={loading} onClick={handleDownload}>
          {loading ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </section>
    </main>
  );
}

function formatFileSize(size) {
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DesignPanel({ cv, dispatch, photoInputRef, photoName, loading, pickPhoto, removePhoto }) {
  return (
    <div className="design-panel-inner">
      <div className="upload-card-header">
        <div>
          <p className="eyebrow">Diseno</p>
          <h2>Plantilla, color y foto</h2>
        </div>
      </div>

      <TemplateSelector />

      <div className="accent-panel">
        <div>
          <h3>Color de acento</h3>
          <p>Aplica el color principal a cabeceras, lineas y destacados del CV.</p>
        </div>
        <div className="accent-swatches" aria-label="Colores de acento">
          {accentColors.map(color => (
            <button
              key={color}
              type="button"
              className={cv.style?.accentColor === color ? 'selected' : ''}
              style={{ '--swatch': color }}
              aria-label={`Usar color ${color}`}
              onClick={() => dispatch({ type: 'UPDATE_STYLE', payload: { accentColor: color } })}
            />
          ))}
          <label className="accent-custom">
            <span>Personalizado</span>
            <input
              type="color"
              value={cv.style?.accentColor || '#f5b21b'}
              onChange={event => dispatch({ type: 'UPDATE_STYLE', payload: { accentColor: event.target.value } })}
            />
          </label>
        </div>
      </div>

      <div className="upload-photo-panel">
        <div className="photo-upload-preview">
          {cv.personal?.photoUrl ? (
            <img src={cv.personal.photoUrl} alt="Vista previa de la imagen de perfil" />
          ) : (
            <span>JPG</span>
          )}
        </div>
        <div className="upload-photo-copy">
          <strong>Foto JPG</strong>
          <small>{photoName || 'Opcional. Maximo 2 MB y preferiblemente fondo claro.'}</small>
          <div className="photo-upload-controls">
            <label className="dark-button photo-button">
              Subir imagen JPG
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,.jpg,.jpeg"
                onChange={event => pickPhoto(event.target.files)}
              />
            </label>
            {cv.personal?.photoUrl && (
              <button type="button" className="outline-button" disabled={loading} onClick={removePhoto}>
                Eliminar foto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
