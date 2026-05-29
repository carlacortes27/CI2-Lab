import { useCv } from '../../../context/CvContext.jsx';
import { isEndDateValid } from '../../../utils/validators.js';
import { Field, SectionCard } from './FormControls.jsx';

const SECTION = 'education';

function emptyItem() {
  return {
    id: crypto.randomUUID(),
    institution: '',
    location: '',
    degree: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [{ id: crypto.randomUUID(), text: '' }],
  };
}

export default function EducationForm() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION]?.items || [];

  function update(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  function updateBullet(item, bulletId, text) {
    dispatch({ type: 'UPDATE_BULLET', payload: { section: SECTION, itemId: item.id, bulletId, text } });
  }

  return (
    <SectionCard
      title="Educación"
      action={<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: emptyItem() } })}>Añadir</button>}
    >
      {items.map(item => {
        const dateError = !isEndDateValid(item.startDate, item.endDate, item.current);
        return (
          <article className="entry-card" key={item.id}>
            <div className="entry-header">
              <strong>{item.degree || 'Nueva educación'}</strong>
              <button type="button" onClick={() => dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id: item.id } })}>Eliminar</button>
            </div>
            <div className="form-grid two">
              <Field label="Universidad / centro" value={item.institution} onChange={institution => update(item.id, { institution })} />
              <Field label="País" value={item.location} onChange={location => update(item.id, { location })} />
              <Field label="Titulación" value={item.degree} onChange={degree => update(item.id, { degree })} />
              <Field label="Fecha inicio" value={item.startDate} onChange={startDate => update(item.id, { startDate })} type="month" />
              <Field label="Fecha fin" value={item.endDate} onChange={endDate => update(item.id, { endDate })} type="month" disabled={item.current} error={dateError ? 'La fecha fin debe ser posterior' : ''} />
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={item.current}
                onChange={event => update(item.id, {
                  current: event.target.checked,
                  endDate: event.target.checked ? '' : item.endDate,
                  duration: event.target.checked ? '' : item.duration,
                })}
              />
              En curso
            </label>
            <BulletEditor item={item} onChange={updateBullet} section={SECTION} />
          </article>
        );
      })}
    </SectionCard>
  );
}

export function BulletEditor({ item, onChange, section }) {
  const { dispatch } = useCv();
  const bullets = item.bullets || [];

  return (
    <div className="bullet-editor">
      <span>Bullet points editables</span>
      {bullets.map(bullet => (
        <div className="bullet-row" key={bullet.id}>
          <input value={bullet.text} onChange={event => onChange(item, bullet.id, event.target.value)} placeholder="Especialización, logro, herramienta o responsabilidad" />
          <button type="button" onClick={() => dispatch({ type: 'DELETE_BULLET', payload: { section, itemId: item.id, bulletId: bullet.id } })}>Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => dispatch({ type: 'ADD_BULLET', payload: { section, itemId: item.id, bullet: { id: crypto.randomUUID(), text: '' } } })}>
        Añadir bullet
      </button>
    </div>
  );
}
