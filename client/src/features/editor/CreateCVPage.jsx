/**
 * CreateCVPage.jsx — Pantalla "Crear desde cero" del Shell B (Herramienta CV)
 *
 * Usa CVToolLayout para la estructura de shell (header + sidebar + workspace).
 * El workspace se divide en dos columnas: formulario (izquierda) + vista previa A4 (derecha).
 */
import { useState } from 'react';
import CVForm          from './forms/CVForm.jsx';
import CVPreview       from './forms/CVPreview.jsx';
import TemplateSelector from './forms/TemplateSelector.jsx';
import { correctSpelling, downloadAsPDF, translateCV } from '../../services/cvService.js';
import { useCv }       from '../../context/CvContext.jsx';
import CVToolLayout    from '../../layouts/CVToolLayout.jsx';
import { T }           from '../../styles/theme.js';

export default function CreateCVPage({ onNavigate }) {
  const { cv, dispatch } = useCv();
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState('');

  async function runAction(actionKey, action, successMsg) {
    setStatus('');
    setLoading(actionKey);
    try {
      const result = await action();
      if (result?.cvData) dispatch({ type: 'SET_CV', payload: result.cvData });
      setStatus(successMsg);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading('');
    }
  }

  async function handleDownload() {
    setStatus('');
    setLoading('pdf');
    try {
      await downloadAsPDF(cv);
      setStatus('PDF descargado correctamente.');
    } catch (err) {
      setStatus(`Error al generar PDF: ${err.message}`);
    } finally {
      setLoading('');
    }
  }

  function handleStep(key) {
    if (key === 'improve') onNavigate?.('upload');
    if (key === 'preview') onNavigate?.('preview');
    // 'create' no hace nada (ya estamos aquí)
  }

  // Acciones del toolbar del header
  const toolbarActions = [
    {
      label:   loading === 'spell' ? 'Corrigiendo' : 'Corrección ortográfica',
      loading: loading === 'spell',
      onClick: () => runAction('spell', () => correctSpelling(cv), 'Corrección aplicada.'),
    },
    {
      label:   loading === 'translate-en' ? 'Traduciendo' : 'Traducir a inglés',
      loading: loading === 'translate-en',
      onClick: () => runAction('translate-en', () => translateCV(cv, 'en'), 'CV traducido al inglés.'),
    },
    {
      label:   loading === 'translate-es' ? 'Traduciendo' : 'Traducir a español',
      loading: loading === 'translate-es',
      onClick: () => runAction('translate-es', () => translateCV(cv, 'es'), 'CV traducido al español.'),
    },
    {
      label:   loading === 'pdf' ? 'Generando' : 'Descargar PDF',
      loading: loading === 'pdf',
      primary: true,
      onClick: handleDownload,
    },
  ];

  return (
    <CVToolLayout
      activeStep="create"
      onNavigate={onNavigate}
      toolbarActions={toolbarActions}
      onStep={handleStep}
    >
      {/* Mensaje de estado (errores / confirmaciones) */}
      {status && (
        <div style={{
          padding:         '10px 24px',
          backgroundColor: status.startsWith('Error') ? '#FEF2F2' : '#F0FDF4',
          borderBottom:    `1px solid ${status.startsWith('Error') ? '#FECACA' : '#BBF7D0'}`,
          fontSize:        13,
          color:           status.startsWith('Error') ? '#B91C1C' : '#15803D',
          fontFamily:      T.font,
          flexShrink:      0,
        }}>
          {status}
        </div>
      )}

      {/* Workspace: dos columnas scrollables */}
      <div style={{
        flex:               1,
        overflow:           'hidden',
        display:            'grid',
        gridTemplateColumns: '1fr 1fr',
      }}>
        {/* Columna izquierda: selector de plantilla + formulario */}
        <div style={{
          overflowY: 'auto',
          padding:   '28px 28px 40px',
          borderRight: `1px solid ${T.border}`,
          display:   'flex',
          flexDirection: 'column',
          gap:       20,
        }}>
          {/* Selector de plantilla y estilo */}
          <div style={{
            backgroundColor: T.white,
            borderRadius:    T.radiusCard,
            boxShadow:       T.shadowCard,
            padding:         24,
          }}>
            <TemplateSelector />
          </div>

          {/* Formulario por secciones */}
          <CVForm />
        </div>

        {/* Columna derecha: vista previa A4 */}
        <div style={{
          overflowY:       'auto',
          padding:         '28px 28px 40px',
          backgroundColor: T.bg,
          display:         'flex',
          flexDirection:   'column',
          gap:             16,
        }}>
          {/* Título del panel */}
          <h2 style={{
            fontSize:   16,
            fontWeight: 600,
            color:      T.t1,
            fontFamily: T.font,
            margin:     0,
          }}>
            Vista previa A4
          </h2>

          {/* Render del CV */}
          <div style={{
            backgroundColor: T.white,
            borderRadius:    T.radiusCard,
            boxShadow:       T.shadowElevated,
            overflow:        'hidden',
          }}>
            <CVPreview />
          </div>
        </div>
      </div>
    </CVToolLayout>
  );
}
