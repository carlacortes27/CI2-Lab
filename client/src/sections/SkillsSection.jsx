import { useCv } from '../context/CvContext.jsx';

const SECTION = 'skills';

export default function SkillsSection() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION].items;

  function addItem() {
    dispatch({
      type: 'ADD_ITEM',
      payload: { section: SECTION, item: { id: crypto.randomUUID(), name: '', category: null } },
    });
  }

  function updateItem(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  function deleteItem(id) {
    dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id } });
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <div key={item.id} className="flex gap-2 items-center">
          <input
            value={item.name}
            onChange={e => updateItem(item.id, { name: e.target.value })}
            placeholder="Habilidad (p. ej. Python)"
            className="border border-gray-200 rounded-md px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={item.category ?? ''}
            onChange={e => updateItem(item.id, { category: e.target.value || null })}
            placeholder="Categoría (opcional)"
            className="border border-gray-200 rounded-md px-2 py-1 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm">×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start mt-1"
      >
        + Añadir habilidad
      </button>
    </div>
  );
}
