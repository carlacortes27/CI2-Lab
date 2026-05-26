import { useState } from 'react';
import TemplateSelector from '../components/cv/TemplateSelector.jsx';
import { improveUploadedCV } from '../services/cvService.js';

export default function UploadCVPage({ onNavigate }) {
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
    setStatus('CV cargado');
  }

  async function improve() {
    await improveUploadedCV(file);
    setStatus('Mejora preparada como placeholder');
  }

  return (
    <main className="upload-page">
      <section className="upload-card">
        <p className="eyebrow">Subir CV existente</p>
        <h1>Analiza y mejora tu curriculum</h1>
        <p>Arrastra tu PDF o selecciona el archivo desde tu ordenador.</p>

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
          <strong>{file ? file.name : 'Arrastra aqui tu CV en PDF'}</strong>
          <small>o pulsa para seleccionar archivo</small>
        </label>

        {status && <p className="status-message">{status}</p>}

        <div className="upload-actions">
          <button type="button" disabled={!file}>Analizar CV</button>
          <button type="button" disabled={!file} onClick={improve}>Mejorar CV</button>
          <button type="button" disabled={!file} onClick={() => onNavigate('create')}>Elegir plantilla</button>
        </div>
      </section>
      <section className="upload-side">
        <h2>Plantillas disponibles</h2>
        <TemplateSelector />
      </section>
    </main>
  );
}
