import { useCv } from '../../../context/CvContext.jsx';
import { Field, SectionCard } from './FormControls.jsx';

const SECTION = 'certifications';

function emptyItem() {
  return { id: crypto.randomUUID(), name: '', issuer: '', level: '', date: '' };
}

export default function CertificationsForm() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION]?.items || [];

  function update(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  return (
    <SectionCard title="Certificaciones" action={<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: emptyItem() } })}>Añadir</button>}>
      {items.map(item => (
        <article className="entry-card compact" key={item.id}>
          <div className="form-grid four">
            <Field label="Nombre certificado" value={item.name} onChange={name => update(item.id, { name })} />
            <Field label="Organización emisora" value={item.issuer} onChange={issuer => update(item.id, { issuer })} />
            <Field label="Nivel" value={item.level} onChange={level => update(item.id, { level })} />
            <Field label="Fecha opcional" value={item.date} onChange={date => update(item.id, { date })} type="month" />
          </div>
          <button type="button" onClick={() => dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id: item.id } })}>Eliminar certificado</button>
        </article>
      ))}
    </SectionCard>
  );
}
