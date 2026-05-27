import { useCv } from '../../../context/CvContext.jsx';
import { Field, SectionCard, TextArea } from './FormControls.jsx';

const SECTION = 'volunteering';

function emptyItem() {
  return { id: crypto.randomUUID(), organization: '', date: '', description: '' };
}

export default function VolunteerForm() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION]?.items || [];

  function update(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  return (
    <SectionCard title="Voluntariados" action={<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: emptyItem() } })}>Añadir</button>}>
      {items.map(item => (
        <article className="entry-card compact" key={item.id}>
          <div className="form-grid two">
            <Field label="Organización" value={item.organization} onChange={organization => update(item.id, { organization })} />
            <Field label="Fecha" value={item.date} onChange={date => update(item.id, { date })} />
          </div>
          <TextArea label="Descripción breve" value={item.description} onChange={description => update(item.id, { description })} rows={2} />
          <button type="button" onClick={() => dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id: item.id } })}>Eliminar voluntariado</button>
        </article>
      ))}
    </SectionCard>
  );
}
