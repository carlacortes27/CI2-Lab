import { useCv } from '../../../context/CvContext.jsx';
import { Field, Select, SectionCard } from './FormControls.jsx';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
const SECTION = 'languages';

function emptyItem() {
  return { id: crypto.randomUUID(), name: '', level: '', certificate: '', note: '' };
}

export default function LanguagesForm() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION]?.items || [];

  function update(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  return (
    <SectionCard title="Idiomas" action={<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: emptyItem() } })}>Añadir</button>}>
      {items.map(item => (
        <article className="entry-card compact" key={item.id}>
          <div className="form-grid four">
            <Field label="Idioma" value={item.name} onChange={name => update(item.id, { name })} />
            <Select label="Nivel" value={String(item.level)} onChange={level => update(item.id, { level })}>
              <option value="">Selecciona</option>
              {levels.map(level => <option key={level}>{level}</option>)}
            </Select>
            <Field label="Certificado opcional" value={item.certificate} onChange={certificate => update(item.id, { certificate })} placeholder="Cambridge, IELTS, TOEFL..." />
            <Field label="Nota o año" value={item.note} onChange={note => update(item.id, { note })} />
          </div>
          <button type="button" onClick={() => dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id: item.id } })}>Eliminar idioma</button>
        </article>
      ))}
    </SectionCard>
  );
}
