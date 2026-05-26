import { useCv } from '../context/CvContext.jsx';
import TextField from '../components/TextField.jsx';
import DateField from '../components/DateField.jsx';

const SECTION = 'education';

function newItem() {
  return {
    id: crypto.randomUUID(),
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: null,
    endDate: null,
    current: false,
    bullets: [],
  };
}

export default function EducationSection() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION].items;

  function updateItem(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  function deleteItem(id) {
    dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id } });
  }

  function addBullet(itemId) {
    dispatch({
      type: 'ADD_BULLET',
      payload: { section: SECTION, itemId, bullet: { id: crypto.randomUUID(), text: '' } },
    });
  }

  function updateBullet(itemId, bulletId, text) {
    dispatch({ type: 'UPDATE_BULLET', payload: { section: SECTION, itemId, bulletId, text } });
  }

  function deleteBullet(itemId, bulletId) {
    dispatch({ type: 'DELETE_BULLET', payload: { section: SECTION, itemId, bulletId } });
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map(item => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-700">{item.institution || 'Nueva formación'}</span>
            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              className="text-gray-400 hover:text-red-500 text-sm"
            >
              ×
            </button>
          </div>
          <TextField label="Institución" value={item.institution} onChange={v => updateItem(item.id, { institution: v })} />
          <TextField label="Título" value={item.degree} onChange={v => updateItem(item.id, { degree: v })} />
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Especialidad" value={item.field} onChange={v => updateItem(item.id, { field: v })} />
            <TextField label="Ubicación" value={item.location} onChange={v => updateItem(item.id, { location: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DateField label="Inicio" value={item.startDate} onChange={v => updateItem(item.id, { startDate: v })} />
            <DateField label="Fin" value={item.current ? '' : item.endDate} onChange={v => updateItem(item.id, { endDate: v })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={item.current}
              onChange={e => updateItem(item.id, { current: e.target.checked, endDate: e.target.checked ? null : item.endDate })}
              className="rounded"
            />
            En curso
          </label>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notas</span>
            {item.bullets.map(b => (
              <div key={b.id} className="flex gap-2 items-center">
                <span className="text-gray-400 text-sm">•</span>
                <input
                  value={b.text}
                  onChange={e => updateBullet(item.id, b.id, e.target.value)}
                  placeholder="Nota media, premio, actividad…"
                  className="border border-gray-200 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => deleteBullet(item.id, b.id)} className="text-gray-400 hover:text-red-500 text-sm">×</button>
              </div>
            ))}
            <button type="button" onClick={() => addBullet(item.id)} className="text-xs text-blue-600 hover:text-blue-800 self-start mt-1">
              + Añadir nota
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: newItem() } })}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
      >
        + Añadir formación
      </button>
    </div>
  );
}
