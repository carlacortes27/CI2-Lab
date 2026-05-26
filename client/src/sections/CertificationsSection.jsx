import { useCv } from '../context/CvContext.jsx';
import TextField from '../components/TextField.jsx';
import DateField from '../components/DateField.jsx';

const SECTION = 'certifications';

function newItem() {
  return { id: crypto.randomUUID(), name: '', issuer: '', date: null, url: null };
}

export default function CertificationsSection() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION].items;

  function updateItem(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  function deleteItem(id) {
    dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id } });
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(item => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-700">{item.name || 'Nueva certificación'}</span>
            <button type="button" onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm">×</button>
          </div>
          <TextField label="Nombre" value={item.name} onChange={v => updateItem(item.id, { name: v })} />
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Emisor" value={item.issuer} onChange={v => updateItem(item.id, { issuer: v })} />
            <DateField label="Fecha" value={item.date} onChange={v => updateItem(item.id, { date: v })} />
          </div>
          <TextField label="URL (opcional)" value={item.url} onChange={v => updateItem(item.id, { url: v || null })} placeholder="https://…" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => dispatch({ type: 'ADD_ITEM', payload: { section: SECTION, item: newItem() } })}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
      >
        + Añadir certificación
      </button>
    </div>
  );
}
