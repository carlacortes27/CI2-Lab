import { useCv } from '../context/CvContext.jsx';
import LanguageLevel from '../components/LanguageLevel.jsx';

const SECTION = 'languages';

export default function LanguagesSection() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION].items;

  function addItem() {
    dispatch({
      type: 'ADD_ITEM',
      payload: { section: SECTION, item: { id: crypto.randomUUID(), name: '', level: 1 } },
    });
  }

  function updateItem(id, data) {
    dispatch({ type: 'UPDATE_ITEM', payload: { section: SECTION, id, data } });
  }

  function deleteItem(id) {
    dispatch({ type: 'DELETE_ITEM', payload: { section: SECTION, id } });
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(item => (
        <div key={item.id} className="flex gap-3 items-center">
          <input
            value={item.name}
            onChange={e => updateItem(item.id, { name: e.target.value })}
            placeholder="Idioma"
            className="border border-gray-200 rounded-md px-2 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <LanguageLevel value={item.level} onChange={level => updateItem(item.id, { level })} />
          <button type="button" onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm ml-auto">×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
      >
        + Añadir idioma
      </button>
    </div>
  );
}
