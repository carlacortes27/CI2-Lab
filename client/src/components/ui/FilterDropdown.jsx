/**
 * FilterDropdown.jsx — Filtro desplegable tipo píldora
 *
 * Aparece en la FilterBar del Portal OPE y en otros contextos.
 * Muestra el label seleccionado + chevron; al pulsar abre un dropdown.
 */
import { useState } from 'react';
import { T } from '../../styles/theme.js';
import { ChevronDownIcon } from './Icons.jsx';

export default function FilterDropdown({ label, options = [], value = '', onChange }) {
  const [open, setOpen] = useState(false);

  // options puede ser array de strings o array de {value, label}
  const normalize = (o) => typeof o === 'string'
    ? { value: o, label: o }
    : { value: o.value ?? o, label: o.label ?? o };

  const opts = options.map(normalize);
  const selected = opts.find(o => o.value === value);
  const displayLabel = selected ? selected.label : label;
  const active = Boolean(value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          gap:             6,
          padding:         '8px 16px',
          borderRadius:    T.radiusPill,
          border:          `1px solid ${active ? T.orange : T.border}`,
          backgroundColor: active ? T.orangeBg : T.white,
          color:           active ? '#92700A' : T.t2,
          fontSize:        13,
          fontWeight:      active ? 500 : 400,
          cursor:          'pointer',
          whiteSpace:      'nowrap',
          fontFamily:      T.font,
          transition:      'background-color 0.12s',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = T.hoverBg; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = T.white; }}
      >
        {displayLabel}
        <ChevronDownIcon size={13} />
      </button>

      {open && (
        <>
          {/* overlay para cerrar */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 20 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position:        'absolute',
            top:             'calc(100% + 8px)',
            left:            0,
            zIndex:          30,
            backgroundColor: T.white,
            border:          `1px solid ${T.border}`,
            borderRadius:    T.radiusInput,
            boxShadow:       T.shadowElevated,
            minWidth:        180,
            overflow:        'hidden',
          }}>
            {/* Opción "Todos" */}
            {[{ value: '', label: 'Todos' }, ...opts].map(({ value: v, label: l }) => (
              <button
                key={v}
                type="button"
                onClick={() => { onChange(v); setOpen(false); }}
                style={{
                  display:         'block',
                  width:           '100%',
                  textAlign:       'left',
                  padding:         '10px 16px',
                  fontSize:        13,
                  fontWeight:      value === v ? 600 : 400,
                  color:           value === v ? T.orange : T.t1,
                  backgroundColor: 'transparent',
                  border:          'none',
                  borderBottom:    `1px solid ${T.border}`,
                  cursor:          'pointer',
                  fontFamily:      T.font,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}