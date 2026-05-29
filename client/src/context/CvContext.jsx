/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { exampleCv } from '../data/example-cv.js';
import { createBlankCv } from '../data/blank-cv.js';
import {
  saveCv, setActiveCvId, setSchemaVersion,
} from '../lib/storage.js';

const CvContext = createContext(null);

function now() {
  return new Date().toISOString();
}

function withUpdated(cv) {
  return { ...cv, meta: { ...cv.meta, updatedAt: now() } };
}

function normalizeCv(cv) {
  const mergedSections = { ...exampleCv.sections, ...(cv.sections || {}) };
  const order = exampleCv.layout.order.filter(key => mergedSections[key]);
  return {
    ...exampleCv,
    ...cv,
    personal: { ...exampleCv.personal, ...(cv.personal || {}) },
    preferences: { ...exampleCv.preferences, ...(cv.preferences || {}) },
    style: { ...exampleCv.style, ...(cv.style || {}) },
    sections: mergedSections,
    layout: { ...exampleCv.layout, ...(cv.layout || {}), order },
  };
}

function cvReducer(cv, action) {
  switch (action.type) {
    case 'LOAD_CV':
    case 'SET_CV':
      return action.payload;

    case 'RESET_CV':
      return createBlankCv();

    case 'UPDATE_PERSONAL':
      return withUpdated({ ...cv, personal: { ...cv.personal, ...action.payload } });

    case 'UPDATE_SUMMARY':
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          summary: { ...cv.sections.summary, text: action.payload },
        },
      });

    case 'TOGGLE_SECTION_VISIBILITY': {
      const { section } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: { ...cv.sections[section], visible: !cv.sections[section].visible },
        },
      });
    }

    case 'ADD_ITEM': {
      const { section, item } = action.payload;
      // interests usa array de strings, no objetos
      if (section === 'interests') {
        return withUpdated({
          ...cv,
          sections: {
            ...cv.sections,
            interests: { ...cv.sections.interests, items: [...cv.sections.interests.items, item] },
          },
        });
      }
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: [...(cv.sections[section].items || []), item],
          },
        },
      });
    }

    case 'UPDATE_ITEM': {
      const { section, id, data } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: cv.sections[section].items.map(i =>
              i.id === id ? { ...i, ...data } : i
            ),
          },
        },
      });
    }

    case 'DELETE_ITEM': {
      const { section, id } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: cv.sections[section].items.filter(i => i.id !== id),
          },
        },
      });
    }

    case 'ADD_BULLET': {
      const { section, itemId, bullet } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: cv.sections[section].items.map(i =>
              i.id === itemId ? { ...i, bullets: [...i.bullets, bullet] } : i
            ),
          },
        },
      });
    }

    case 'UPDATE_BULLET': {
      const { section, itemId, bulletId, text } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: cv.sections[section].items.map(i =>
              i.id === itemId
                ? { ...i, bullets: i.bullets.map(b => b.id === bulletId ? { ...b, text } : b) }
                : i
            ),
          },
        },
      });
    }

    case 'DELETE_BULLET': {
      const { section, itemId, bulletId } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: cv.sections[section].items.map(i =>
              i.id === itemId
                ? { ...i, bullets: i.bullets.filter(b => b.id !== bulletId) }
                : i
            ),
          },
        },
      });
    }

    case 'REORDER_BULLETS': {
      const { section, itemId, bullets } = action.payload;
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [section]: {
            ...cv.sections[section],
            items: cv.sections[section].items.map(i =>
              i.id === itemId ? { ...i, bullets } : i
            ),
          },
        },
      });
    }

    case 'REORDER_SECTIONS':
      return withUpdated({
        ...cv,
        layout: { ...cv.layout, order: action.payload },
      });

    case 'UPDATE_STYLE':
      return withUpdated({ ...cv, style: { ...cv.style, ...action.payload } });

    case 'UPDATE_BLOCK_STYLE': {
      const { blockId, style } = action.payload;
      return withUpdated({
        ...cv,
        style: {
          ...cv.style,
          blockStyles: {
            ...(cv.style.blockStyles || {}),
            [blockId]: {
              ...(cv.style.blockStyles?.[blockId] || {}),
              ...style,
            },
          },
        },
      });
    }

    case 'RESET_BLOCK_STYLE': {
      const { blockId } = action.payload;
      const nextStyles = { ...(cv.style.blockStyles || {}) };
      delete nextStyles[blockId];
      return withUpdated({
        ...cv,
        style: {
          ...cv.style,
          blockStyles: nextStyles,
        },
      });
    }

    case 'UPDATE_PREFERENCES':
      return withUpdated({
        ...cv,
        preferences: { ...(cv.preferences || {}), ...action.payload },
      });

    case 'UPDATE_SECTION':
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          [action.payload.section]: {
            ...(cv.sections[action.payload.section] || { visible: true }),
            ...action.payload.data,
          },
        },
      });

    // interests usa strings; SET_INTERESTS reemplaza el array completo
    case 'SET_INTERESTS':
      return withUpdated({
        ...cv,
        sections: {
          ...cv.sections,
          interests: { ...cv.sections.interests, items: action.payload },
        },
      });

    default:
      return cv;
  }
}

export function CvProvider({ children }) {
  const initialCv = (() => {
    return normalizeCv(createBlankCv());
  })();

  const [cv, dispatch] = useReducer(cvReducer, initialCv);
  const saveTimerRef = useRef(null);

  // Autoguardado: debounce 2 s + intervalo 30 s como red de seguridad
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCv(cv);
      setActiveCvId(cv.meta.id);
      setSchemaVersion(cv.meta.schemaVersion);
    }, 2000);
    return () => clearTimeout(saveTimerRef.current);
  }, [cv]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveCv(cv);
      setActiveCvId(cv.meta.id);
    }, 30000);
    return () => clearInterval(interval);
  }, [cv]);

  return (
    <CvContext.Provider value={{ cv, dispatch }}>
      {children}
    </CvContext.Provider>
  );
}

export function useCv() {
  const ctx = useContext(CvContext);
  if (!ctx) throw new Error('useCv debe usarse dentro de CvProvider');
  return ctx;
}
