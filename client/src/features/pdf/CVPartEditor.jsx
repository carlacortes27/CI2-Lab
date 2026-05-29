import { useMemo, useState } from 'react';
import { useCv } from '../../context/CvContext.jsx';
import { Field, Select, TextArea } from '../editor/forms/FormControls.jsx';

const sectionLabels = {
  personal: 'Datos personales',
  summary: 'Sobre mi',
  education: 'Formacion',
  experience: 'Experiencia',
  projects: 'Proyectos',
  technicalSkills: 'Competencias tecnicas',
  personalSkills: 'Competencias personales',
  languages: 'Idiomas',
  certifications: 'Certificaciones',
  volunteering: 'Voluntariado',
};

const sectionTabs = [
  'personal',
  'summary',
  'education',
  'experience',
  'projects',
  'technicalSkills',
  'personalSkills',
  'languages',
  'certifications',
  'volunteering',
];

const fonts = ['Arial', 'Georgia', 'Times New Roman', 'Inter'];
const sizes = [
  ['', 'Normal'],
  ['9', 'Muy pequeno'],
  ['10', 'Pequeno'],
  ['11', 'Medio'],
  ['12', 'Grande'],
  ['14', 'Muy grande'],
];
const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
const technicalGroups = [
  ['lenguajes', 'Lenguajes'],
  ['software', 'Software'],
  ['herramientas', 'Herramientas'],
  ['tecnologias', 'Tecnologias'],
];

export default function CVPartEditor({ selectedBlockId, onSelectBlock }) {
  const { cv, dispatch } = useCv();
  const blocks = useMemo(() => getEditableBlocks(cv), [cv]);
  const selected = blocks.find(block => block.id === selectedBlockId) || blocks[0];
  const [activeSection, setActiveSection] = useState(selected?.section || 'summary');

  const blockStyle = selected ? cv.style?.blockStyles?.[selected.id] || {} : {};

  function selectBlock(blockId, section = activeSection) {
    setActiveSection(section);
    onSelectBlock?.(blockId);
  }

  function addItem(section) {
    const item = emptyItem(section);
    dispatch({ type: 'ADD_ITEM', payload: { section, item } });
    selectBlock(blockIdForItem(section, item), section);
  }

  function addBullet(section, itemId) {
    const bullet = { id: newId('bullet'), text: '' };
    dispatch({ type: 'ADD_BULLET', payload: { section, itemId, bullet } });
    selectBlock(`${section}:${itemId}:bullet:${bullet.id}`, section);
  }

  function updateStyle(key, value) {
    if (!selected) return;
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
          <p className="eyebrow">Edicion en vivo</p>
          <h2>Editar partes</h2>
          <p className="part-selected">
            {selected ? selected.label : 'Elige una seccion para empezar'}
          </p>
        </div>
      </div>

      <div className="part-section-tabs" aria-label="Secciones editables">
        {sectionTabs.map(section => (
          <button
            key={section}
            type="button"
            className={activeSection === section ? 'active' : ''}
            onClick={() => setActiveSection(section)}
          >
            {sectionLabels[section]}
          </button>
        ))}
      </div>

      <div className="part-editor-body">
        <SectionEditor
          section={activeSection}
          cv={cv}
          dispatch={dispatch}
          selectedBlockId={selectedBlockId}
          selectBlock={selectBlock}
          addItem={addItem}
          addBullet={addBullet}
        />
      </div>

      <div className="part-style-panel">
        <div>
          <h3>Estilo del bloque seleccionado</h3>
          <p>{selected ? selected.label : 'Selecciona texto en la preview o una tarjeta del editor.'}</p>
        </div>

        <div className="part-style-grid">
          <label className="form-field">
            <span>Tipo</span>
            <select
              value={blockStyle.fontFamily || ''}
              disabled={!selected}
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
              disabled={!selected}
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
              disabled={!selected}
              checked={blockStyle.fontWeight === '700'}
              onChange={event => updateStyle('fontWeight', event.target.checked ? '700' : '')}
            />
            Negrita
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              disabled={!selected}
              checked={blockStyle.fontStyle === 'italic'}
              onChange={event => updateStyle('fontStyle', event.target.checked ? 'italic' : '')}
            />
            Cursiva
          </label>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, cv, dispatch, selectedBlockId, selectBlock, addItem, addBullet }) {
  const data = cv.sections?.[section] || {};

  if (section === 'summary') {
    return (
      <TextArea
        label="Perfil profesional"
        rows={5}
        value={data.text || ''}
        placeholder="Resume tu perfil, tus intereses y el valor que aportas."
        onChange={text => {
          selectBlock('summary', 'summary');
          dispatch({ type: 'UPDATE_SUMMARY', payload: text });
        }}
      />
    );
  }

  if (section === 'personal') {
    const personal = cv.personal || {};
    const links = personal.links || [];

    function updatePersonal(payload) {
      dispatch({ type: 'UPDATE_PERSONAL', payload });
    }

    function updateLink(id, data) {
      updatePersonal({
        links: links.map(link => link.id === id ? { ...link, ...data } : link),
      });
    }

    return (
      <div className="part-card-list">
        <div className="part-form-grid">
          <Field label="Nombre completo" value={personal.fullName} onChange={fullName => updatePersonal({ fullName })} />
          <Field label="Titular" value={personal.headline} onChange={headline => updatePersonal({ headline })} />
          <Field label="Email" value={personal.email} onChange={email => updatePersonal({ email })} />
          <Field label="Telefono" value={personal.phone} onChange={phone => updatePersonal({ phone })} />
          <Field label="Ubicacion" value={personal.location} onChange={location => updatePersonal({ location })} />
        </div>

        <div className="part-list-head">
          <strong>Enlaces</strong>
          <button
            type="button"
            className="primary-button"
            onClick={() => updatePersonal({ links: [...links, { id: newId('link'), label: 'Portfolio', url: '' }] })}
          >
            Anadir
          </button>
        </div>

        {links.map(link => (
          <article className="part-content-card" key={link.id}>
            <div className="part-content-head">
              <strong>{link.label || 'Enlace'}</strong>
              <button
                type="button"
                onClick={() => updatePersonal({ links: links.filter(current => current.id !== link.id) })}
              >
                Eliminar
              </button>
            </div>
            <div className="part-form-grid">
              <Field label="Etiqueta" value={link.label} onChange={label => updateLink(link.id, { label })} />
              <Field label="URL" value={link.url} onChange={url => updateLink(link.id, { url })} />
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (section === 'technicalSkills') {
    const groups = data.groups || {};
    return (
      <div className="part-card-list">
        {technicalGroups.map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={(groups[key] || []).join(', ')}
            placeholder="Python, SQL, Excel"
            onChange={value => dispatch({
              type: 'UPDATE_SECTION',
              payload: {
                section,
                data: { groups: { ...groups, [key]: splitList(value) } },
              },
            })}
          />
        ))}
      </div>
    );
  }

  if (section === 'personalSkills') {
    return (
      <TextArea
        label="Competencias separadas por coma"
        rows={4}
        value={(data.items || []).join(', ')}
        placeholder="Comunicacion, liderazgo, pensamiento analitico"
        onChange={value => dispatch({
          type: 'UPDATE_SECTION',
          payload: { section, data: { items: splitList(value) } },
        })}
      />
    );
  }

  return (
    <div className="part-card-list">
      <div className="part-list-head">
        <strong>{sectionLabels[section]}</strong>
        <button type="button" className="primary-button" onClick={() => addItem(section)}>
          Anadir
        </button>
      </div>

      {(data.items || []).length === 0 && (
        <div className="part-empty-state">
          <strong>Sin contenido todavia</strong>
          <p>Anade una entrada para que aparezca en la vista previa del CV.</p>
        </div>
      )}

      {(data.items || []).map(item => (
        <EditableItem
          key={item.id}
          section={section}
          item={item}
          dispatch={dispatch}
          selectedBlockId={selectedBlockId}
          selectBlock={selectBlock}
          addBullet={addBullet}
        />
      ))}
    </div>
  );
}

function EditableItem({ section, item, dispatch, selectedBlockId, selectBlock, addBullet }) {
  function update(data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section, id: item.id, data } });
  }

  function remove() {
    dispatch({ type: 'DELETE_ITEM', payload: { section, id: item.id } });
  }

  return (
    <article className={`part-content-card ${isItemSelected(section, item, selectedBlockId) ? 'selected' : ''}`}>
      <div className="part-content-head">
        <strong>{itemTitle(section, item)}</strong>
        <button type="button" onClick={remove}>Eliminar</button>
      </div>

      {section === 'education' && (
        <>
          <Field label="Titulacion" value={item.degree} onChange={degree => { selectBlock(`education:${item.id}:degree`, section); update({ degree }); }} />
          <div className="part-form-grid">
            <Field label="Centro" value={item.institution} onChange={institution => update({ institution })} />
            <Field label="Ubicacion" value={item.location} onChange={location => update({ location })} />
            <Field label="Periodo" value={item.duration} placeholder="2022 - Actualidad" onChange={duration => update({ duration })} />
          </div>
          <Bullets section={section} item={item} dispatch={dispatch} selectBlock={selectBlock} addBullet={addBullet} />
        </>
      )}

      {section === 'experience' && (
        <>
          <Field label="Puesto" value={item.role} onChange={role => { selectBlock(`experience:${item.id}:role`, section); update({ role }); }} />
          <div className="part-form-grid">
            <Field label="Empresa" value={item.company} onChange={company => update({ company })} />
            <Field label="Periodo" value={item.duration} placeholder="Jun 2025 - Jul 2025" onChange={duration => update({ duration })} />
          </div>
          <Bullets section={section} item={item} dispatch={dispatch} selectBlock={selectBlock} addBullet={addBullet} />
        </>
      )}

      {section === 'projects' && (
        <>
          <Field label="Proyecto" value={item.name} onChange={name => { selectBlock(`projects:${item.id}:name`, section); update({ name }); }} />
          <TextArea label="Descripcion" rows={3} value={item.description} onChange={description => update({ description })} />
          <div className="part-form-grid">
            <Field label="Tecnologias" value={item.technologies} onChange={technologies => update({ technologies })} />
            <Field label="Enlace" value={item.link} onChange={link => update({ link })} />
          </div>
          <Bullets section={section} item={item} dispatch={dispatch} selectBlock={selectBlock} addBullet={addBullet} />
        </>
      )}

      {section === 'languages' && (
        <div className="part-form-grid">
          <Field label="Idioma" value={item.name} onChange={name => update({ name })} />
          <Select label="Nivel" value={String(item.level || '')} onChange={level => update({ level })}>
            <option value="">Selecciona</option>
            {languageLevels.map(level => <option key={level}>{level}</option>)}
          </Select>
          <Field label="Certificado" value={item.certificate} onChange={certificate => update({ certificate })} />
          <Field label="Nota" value={item.note} onChange={note => update({ note })} />
        </div>
      )}

      {section === 'certifications' && (
        <>
          <Field label="Certificacion" value={item.name} onChange={name => { selectBlock(`certifications:${item.id}:name`, section); update({ name }); }} />
          <div className="part-form-grid">
            <Field label="Entidad" value={item.issuer} onChange={issuer => update({ issuer })} />
            <Field label="Nivel" value={item.level} onChange={level => update({ level })} />
            <Field label="Fecha" value={item.date} onChange={date => update({ date })} />
          </div>
        </>
      )}

      {section === 'volunteering' && (
        <>
          <Field label="Organizacion" value={item.organization} onChange={organization => update({ organization })} />
          <div className="part-form-grid">
            <Field label="Fecha" value={item.date} onChange={date => update({ date })} />
          </div>
          <TextArea
            label="Descripcion"
            rows={3}
            value={item.description}
            onChange={description => { selectBlock(`volunteering:${item.id}:description`, section); update({ description }); }}
          />
        </>
      )}
    </article>
  );
}

function Bullets({ section, item, dispatch, selectBlock, addBullet }) {
  return (
    <div className="part-bullets">
      <div className="part-list-head compact">
        <span>Vinetas</span>
        <button type="button" onClick={() => addBullet(section, item.id)}>Anadir vineta</button>
      </div>
      {(item.bullets || []).map(bullet => (
        <div className="bullet-row" key={bullet.id}>
          <input
            value={bullet.text || ''}
            placeholder="Logro, responsabilidad o herramienta utilizada"
            onFocus={() => selectBlock(`${section}:${item.id}:bullet:${bullet.id}`, section)}
            onChange={event => {
              selectBlock(`${section}:${item.id}:bullet:${bullet.id}`, section);
              dispatch({
                type: 'UPDATE_BULLET',
                payload: { section, itemId: item.id, bulletId: bullet.id, text: event.target.value },
              });
            }}
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'DELETE_BULLET', payload: { section, itemId: item.id, bulletId: bullet.id } })}
          >
            Quitar
          </button>
        </div>
      ))}
    </div>
  );
}

function getEditableBlocks(cv) {
  const sections = cv.sections || {};
  const blocks = [];
  const personal = cv.personal || {};

  blocks.push({
    id: 'personal:fullName',
    label: `Datos personales - ${personal.fullName || 'nombre'}`,
    section: 'personal',
    text: personal.fullName || '',
  });

  if (sections.summary?.visible !== false) {
    blocks.push({
      id: 'summary',
      label: 'Sobre mi - parrafo',
      section: 'summary',
      text: sections.summary?.text || '',
    });
  }

  for (const section of ['education', 'experience', 'projects']) {
    for (const item of sections[section]?.items || []) {
      const titleField = titleFieldFor(section);
      const title = item[titleField] || sectionLabels[section];
      blocks.push({
        id: `${section}:${item.id}:${titleField}`,
        label: `${sectionLabels[section]} - ${title}`,
        section,
        text: item[titleField] || '',
      });

      for (const bullet of item.bullets || []) {
        blocks.push({
          id: `${section}:${item.id}:bullet:${bullet.id}`,
          label: `${sectionLabels[section]} - Vineta de ${title}`,
          section,
          text: bullet.text || '',
        });
      }
    }
  }

  for (const item of sections.certifications?.items || []) {
    blocks.push({
      id: `certifications:${item.id}:name`,
      label: `${sectionLabels.certifications} - ${item.name || 'certificado'}`,
      section: 'certifications',
      text: item.name || '',
    });
  }

  for (const item of sections.volunteering?.items || []) {
    blocks.push({
      id: `volunteering:${item.id}:description`,
      label: `${sectionLabels.volunteering} - ${item.organization || 'detalle'}`,
      section: 'volunteering',
      text: item.description || '',
    });
  }

  return blocks.filter(block => block.text || block.id === 'summary');
}

function emptyItem(section) {
  const id = newId(section);
  if (section === 'education') {
    return { id, institution: '', location: '', degree: '', duration: '', startDate: '', endDate: '', current: false, bullets: [] };
  }
  if (section === 'experience') {
    return { id, role: '', company: '', location: '', duration: '', startDate: '', endDate: '', current: false, bullets: [] };
  }
  if (section === 'projects') {
    return { id, name: '', description: '', technologies: '', link: '', bullets: [] };
  }
  if (section === 'languages') {
    return { id, name: '', level: '', certificate: '', note: '' };
  }
  if (section === 'certifications') {
    return { id, name: '', issuer: '', level: '', date: '' };
  }
  if (section === 'volunteering') {
    return { id, organization: '', date: '', description: '' };
  }
  return { id };
}

function blockIdForItem(section, item) {
  if (['education', 'experience', 'projects'].includes(section)) {
    return `${section}:${item.id}:${titleFieldFor(section)}`;
  }
  if (section === 'certifications') return `certifications:${item.id}:name`;
  if (section === 'volunteering') return `volunteering:${item.id}:description`;
  return '';
}

function titleFieldFor(section) {
  if (section === 'education') return 'degree';
  if (section === 'experience') return 'role';
  return 'name';
}

function itemTitle(section, item) {
  if (section === 'education') return item.degree || 'Nueva formacion';
  if (section === 'experience') return item.role || 'Nueva experiencia';
  if (section === 'projects') return item.name || 'Nuevo proyecto';
  if (section === 'languages') return item.name || 'Nuevo idioma';
  if (section === 'certifications') return item.name || 'Nueva certificacion';
  if (section === 'volunteering') return item.organization || 'Nuevo voluntariado';
  return 'Nuevo bloque';
}

function isItemSelected(section, item, selectedBlockId) {
  return Boolean(selectedBlockId && selectedBlockId.startsWith(`${section}:${item.id}:`));
}

function splitList(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}
