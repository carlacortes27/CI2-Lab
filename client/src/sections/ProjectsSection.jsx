import { useCv } from '../context/CvContext.jsx';
import TextField from '../components/TextField.jsx';
import TextAreaField from '../components/TextAreaField.jsx';
import DateField from '../components/DateField.jsx';

const SECTION = 'projects';

function newItem() {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    link: null,
    startDate: null,
    endDate: null,
    bullets: [],
  };
}

export default function ProjectsSection() {
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
            <span className="text-sm font-medium text-gray-700">{item.name || 'Nuevo proyecto'}</span>
            <button type="button" onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm">×</button>
          </div>
          <TextField label="Nombre" value={item.name} onChange={v => updateItem(item.id, { name: v })} />
          <TextAreaField label="Descripción" value={item.description} onChange={v => updateItem(item.id, { description: v })} rows={2} />
          <TextField label="Enlace" value={item.link} onChange={v => updateItem(item.id, { link: v || null })} placeholder="https://…" />
          <div className="grid grid-cols-2 gap-2">
            <DateField label="Inicio" value={item.startDate} onChange={v => updateItem(item.id, { startDate: v })} />
            <DateField label="Fin" value={item.endDate} onChange={v => updateItem(item.id, { endDate: v })} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bullets</span>
            {item.bullets.map(b => (
              <div key={b.id} className="flex gap-2 items-center">
                <span className="text-gray-400 text-sm">•</span>
                <input
                  value={b.text}
                  onChange={e => updateBullet(item.id, b.id, e.target.value)}
                  placeholder="Detalle del proyecto…"
                  className="border border-gray-200 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => deleteBullet(item.id, b.id)} className="text-gray-400 hover:text-red-500 text-sm">×</button>
              </div>
            ))}
            <button type="button" onClick={() => addBullet(item.id)} className="text-xs text-blue-600 hover:text-blue-800 self-start mt-1">
              + Añadir bullet
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: newItem() } })}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
      >
        + Añadir proyecto
      </button>
    </div>
  );
}
