/**
 * FilterDropdown.jsx — Filtro desplegable tipo píldora
 *
 * Aparece en la FilterBar del Portal OPE y en otros contextos.
 * Muestra el label seleccionado + chevron; al pulsar abre un dropdown.
 */
import { useState } from 'react';
import { T } from '../../styles/theme.js';
import { CheckIcon, ChevronDownIcon } from './Icons.jsx';

export default function FilterDropdown({ label, options = [], value = '', onChange, multiple = false }) {
  const [open, setOpen] = useState(false);

  // options puede ser array de strings o array de {value, label}
  const normalize = (o) => typeof o === 'string'
    ? { value: o, label: o }
    : { value: o.value ?? o, label: o.label ?? o };

  const opts = options.map(normalize);
  const values = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : [];
  const selected = opts.find(o => o.value === value);
  const selectedLabels = opts.filter(o => values.includes(o.value)).map(o => o.label);
  const displayLabel = multiple
    ? selectedLabels.length === 0
      ? label
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${label} (${selectedLabels.length})`
    : selected ? selected.label : label;
  const active = multiple ? values.length > 0 : Boolean(value);

  function isSelected(optionValue) {
    return multiple ? values.includes(optionValue) : value === optionValue;
  }

  function handleSelect(optionValue) {
    if (!multiple) {
      onChange(optionValue);
      setOpen(false);
      return;
    }

    if (!optionValue) {
      onChange([]);
      return;
    }

    onChange(
      values.includes(optionValue)
        ? values.filter(item => item !== optionValue)
        : [...values, optionValue]
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: open ? 1000 : 1 }}>
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
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position:        'absolute',
            top:             'calc(100% + 8px)',
            left:            0,
            zIndex:          1001,
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
                onClick={() => handleSelect(v)}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'space-between',
                  gap:             12,
                  width:           '100%',
                  textAlign:       'left',
                  padding:         '10px 16px',
                  fontSize:        13,
                  fontWeight:      isSelected(v) ? 600 : 400,
                  color:           isSelected(v) ? T.orange : T.t1,
                  backgroundColor: 'transparent',
                  border:          'none',
                  borderBottom:    `1px solid ${T.border}`,
                  cursor:          'pointer',
                  fontFamily:      T.font,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span>{l}</span>
                {isSelected(v) && <CheckIcon size={14} color={T.orange} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
