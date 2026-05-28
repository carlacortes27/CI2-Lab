import { useMemo, useState } from 'react';
import { useCv } from '../../context/CvContext.jsx';

const sectionLabels = {
  summary: 'Sobre mi',
  education: 'Educacion',
  experience: 'Experiencia',
  projects: 'Proyectos',
  personalSkills: 'Competencias personales',
  languages: 'Idiomas',
  certifications: 'Certificaciones',
  volunteering: 'Voluntariados',
};

const fonts = ['Arial', 'Georgia', 'Times New Roman', 'Inter'];
const sizes = [
  ['', 'Normal'],
  ['9', 'Muy pequeno'],
  ['10', 'Pequeno'],
  ['11', 'Medio'],
  ['12', 'Grande'],
  ['14', 'Muy grande'],
];

export default function CVPartEditor() {
  const { cv, dispatch } = useCv();
  const blocks = useMemo(() => getEditableBlocks(cv), [cv]);
  const [selectedId, setSelectedId] = useState(blocks[0]?.id || 'summary');
  const selected = blocks.find(block => block.id === selectedId) || blocks[0];

  if (!selected) {
    return (
      <div className="part-editor empty">
        <h2>Editar por partes</h2>
        <p>No hay informacion extraida para ajustar todavia.</p>
      </div>
    );
  }

  const blockStyle = cv.style?.blockStyles?.[selected.id] || {};

  function updateText(value) {
    if (selected.kind === 'summary') {
      dispatch({ type: 'UPDATE_SUMMARY', payload: value });
      return;
    }

    if (selected.kind === 'bullet') {
      dispatch({
        type: 'UPDATE_BULLET',
        payload: {
          section: selected.section,
          itemId: selected.itemId,
          bulletId: selected.bulletId,
          text: value,
        },
      });
      return;
    }

    if (selected.kind === 'itemField') {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: {
          section: selected.section,
          id: selected.itemId,
          data: { [selected.field]: value },
        },
      });
    }
  }

  function updateStyle(key, value) {
    dispatch({
      type: 'UPDATE_BLOCK_STYLE',
      payload: {
        blockId: selected.id,
        style: { [key]: value || undefined },
      },
    });
  }

  return (
    <div className="part-editor">
      <div className="part-editor-head">
        <div>
          <p className="eyebrow">Ajuste fino</p>
          <h2>Editar por partes</h2>
        </div>
        <button
          type="button"
          disabled={!cv.style?.blockStyles?.[selected.id]}
          onClick={() => dispatch({ type: 'RESET_BLOCK_STYLE', payload: { blockId: selected.id } })}
        >
          Quitar estilo
        </button>
      </div>

      <label className="form-field">
        <span>Parte del CV</span>
        <select value={selected.id} onChange={event => setSelectedId(event.target.value)}>
          {blocks.map(block => (
            <option key={block.id} value={block.id}>
              {block.label}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Texto</span>
        <textarea
          rows={selected.kind === 'summary' ? 5 : 3}
          value={selected.text}
          onChange={event => updateText(event.target.value)}
        />
      </label>

      <div className="part-style-grid">
        <label className="form-field">
          <span>Tipo</span>
          <select
            value={blockStyle.fontFamily || ''}
            onChange={event => updateStyle('fontFamily', event.target.value)}
          >
            <option value="">Plantilla</option>
            {fonts.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
        </label>

        <label className="form-field">
          <span>Tamano</span>
          <select
            value={blockStyle.fontSize || ''}
            onChange={event => updateStyle('fontSize', event.target.value)}
          >
            {sizes.map(([value, label]) => <option key={value || 'default'} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="part-toggle-row">
        <label className="check-row">
          <input
            type="checkbox"
            checked={blockStyle.fontWeight === '700'}
            onChange={event => updateStyle('fontWeight', event.target.checked ? '700' : '')}
          />
          Negrita
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={blockStyle.fontStyle === 'italic'}
            onChange={event => updateStyle('fontStyle', event.target.checked ? 'italic' : '')}
          />
          Cursiva
        </label>
      </div>
    </div>
  );
}

function getEditableBlocks(cv) {
  const sections = cv.sections || {};
  const blocks = [];

  if (sections.summary?.visible !== false) {
    blocks.push({
      id: 'summary',
      label: 'Sobre mi - parrafo',
      kind: 'summary',
      text: sections.summary?.text || '',
    });
  }

  for (const section of ['education', 'experience', 'projects']) {
    for (const item of sections[section]?.items || []) {
      const titleField = section === 'education' ? 'degree' : section === 'experience' ? 'role' : 'name';
      const title = item[titleField] || sectionLabels[section];
      blocks.push({
        id: `${section}:${item.id}:${titleField}`,
        label: `${sectionLabels[section]} - ${title}`,
        kind: 'itemField',
        section,
        itemId: item.id,
        field: titleField,
        text: item[titleField] || '',
      });

      for (const bullet of item.bullets || []) {
        blocks.push({
          id: `${section}:${item.id}:bullet:${bullet.id}`,
          label: `${sectionLabels[section]} - Vineta de ${title}`,
          kind: 'bullet',
          section,
          itemId: item.id,
          bulletId: bullet.id,
          text: bullet.text || '',
        });
      }
    }
  }

  for (const item of sections.certifications?.items || []) {
    blocks.push({
      id: `certifications:${item.id}:name`,
      label: `${sectionLabels.certifications} - ${item.name || 'certificado'}`,
      kind: 'itemField',
      section: 'certifications',
      itemId: item.id,
      field: 'name',
      text: item.name || '',
    });
  }

  for (const item of sections.volunteering?.items || []) {
    blocks.push({
      id: `volunteering:${item.id}:description`,
      label: `${sectionLabels.volunteering} - ${item.organization || 'detalle'}`,
      kind: 'itemField',
      section: 'volunteering',
      itemId: item.id,
      field: 'description',
      text: item.description || '',
    });
  }

  return blocks.filter(block => block.text || block.kind === 'summary');
}
