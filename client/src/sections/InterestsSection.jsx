import { useState } from 'react';
import { useCv } from '../context/CvContext.jsx';

const SECTION = 'interests';

export default function InterestsSection() {
  const { cv, dispatch } = useCv();
  const items = cv.sections[SECTION].items;
  const [input, setInput] = useState('');

  function addItem() {
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: { section: SECTION, item: trimmed },
    });
    setInput('');
  }

  function deleteItem(index) {
    // interests usa strings, no objetos con id — filtramos por índice
    const updated = items.filter((_, i) => i !== index);
    // Reemplazamos la lista completa a través de un update directo en el reducer
    dispatch({
      type: 'SET_INTERESTS',
      payload: updated,
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addItem(); }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-sm px-2 py-1 rounded-full"
          >
            {item}
            <button
              type="button"
              onClick={() => deleteItem(i)}
              className="text-blue-400 hover:text-red-500 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Añadir interés y pulsar Enter…"
          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addItem}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          Añadir
        </button>
      </div>
    </div>
  );
}
