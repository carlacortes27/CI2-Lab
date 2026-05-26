import { useCv } from '../../context/CvContext.jsx';
import { isEndDateValid } from '../../utils/validators.js';
import { Field, SectionCard } from './FormControls.jsx';
import { BulletEditor } from './EducationForm.jsx';

const SECTION = 'experience';

function emptyItem() {
  return {
    id: crypto.randomUUID(),
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    duration: '',
    current: false,
    bullets: [{ id: crypto.randomUUID(), text: '' }],
  };
}

export default function ExperienceForm() {
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
      title="Experiencia profesional"
      action={<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: emptyItem() } })}>Añadir</button>}
    >
      {items.map(item => {
        const dateError = !isEndDateValid(item.startDate, item.endDate, item.current);
        return (
          <article className="entry-card" key={item.id}>
            <div className="entry-header">
              <strong>{item.role || 'Nueva experiencia'}</strong>
              <button type="button" onClick={() => dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id: item.id } })}>Eliminar</button>
            </div>
            <div className="form-grid two">
              <Field label="Puesto" value={item.role} onChange={role => update(item.id, { role })} />
              <Field label="Empresa" value={item.company} onChange={company => update(item.id, { company })} />
              <Field label="Fecha inicio" value={item.startDate} onChange={startDate => update(item.id, { startDate })} type="month" />
              <Field label="Fecha fin" value={item.endDate} onChange={endDate => update(item.id, { endDate })} type="month" error={dateError ? 'La fecha fin debe ser posterior' : ''} />
              <Field label="Duracion" value={item.duration} onChange={duration => update(item.id, { duration })} placeholder="Jun 2025 - Jul 2025" />
            </div>
            <label className="check-row">
              <input type="checkbox" checked={item.current} onChange={event => update(item.id, { current: event.target.checked })} />
              En curso
            </label>
            <BulletEditor item={item} onChange={updateBullet} section={SECTION} />
          </article>
        );
      })}
    </SectionCard>
  );
}
