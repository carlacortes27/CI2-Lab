/**
 * Pill.jsx — Píldora de filtro / tag
 *
 * Usos:
 *  - Filtro activo/inactivo en barras de filtros
 *  - Tag de habilidad (hardSkill) en OfferCard
 *  - Categorías en Recursos, Orientación…
 */
import { T } from '../../styles/theme.js';

export default function Pill({
  label,
  active   = false,   // si está activo (seleccionado)
  chevron  = false,   // muestra "⌄" al final (filtros con dropdown)
  onClick,
  style,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            6,
        padding:        '6px 14px',
        borderRadius:   T.radiusPill,
        border:         `1px solid ${active ? T.orange : T.border}`,
        backgroundColor: active ? T.orangeBg : T.white,
        color:          active ? '#92700A' : T.t2,
        fontSize:       13,
        fontWeight:     active ? 500 : 400,
        cursor:         'pointer',
        whiteSpace:     'nowrap',
        fontFamily:     T.font,
        transition:     'background-color 0.12s, border-color 0.12s',
        ...style,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.backgroundColor = T.hoverBg;
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.backgroundColor = T.white;
      }}
    >
      {label}
      {chevron && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      )}
    </button>
  );
}