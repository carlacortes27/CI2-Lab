import { useCv } from '../../../context/CvContext.jsx';
import { Field, SectionCard, TextArea } from './FormControls.jsx';
import { BulletEditor } from './EducationForm.jsx';

const SECTION = 'projects';

function emptyItem() {
  return { id: crypto.randomUUID(), name: '', description: '', technologies: '', link: '', bullets: [] };
}

export default function ProjectsForm() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION]?.items || [];

  function update(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  function updateBullet(item, bulletId, text) {
    dispatch({ type: 'UPDATE_BULLET', payload: { section: SECTION, itemId: item.id, bulletId, text } });
  }

  return (
    <SectionCard title="Proyectos" action={<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: emptyItem() } })}>Añadir</button>}>
      {items.map(item => (
        <article className="entry-card" key={item.id}>
          <div className="entry-header">
            <strong>{item.name || 'Nuevo proyecto'}</strong>
            <button type="button" onClick={() => dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id: item.id } })}>Eliminar</button>
          </div>
          <Field label="Nombre" value={item.name} onChange={name => update(item.id, { name })} />
          <TextArea label="Descripción" value={item.description} onChange={description => update(item.id, { description })} rows={2} />
          <div className="form-grid two">
            <Field label="Tecnologías usadas" value={item.technologies} onChange={technologies => update(item.id, { technologies })} />
            <Field label="Enlace opcional" value={item.link} onChange={link => update(item.id, { link })} />
          </div>
          <BulletEditor item={{ ...item, bullets: item.bullets || [] }} onChange={updateBullet} section={SECTION} />
        </article>
      ))}
    </SectionCard>
  );
}
