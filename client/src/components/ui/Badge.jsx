/**
 * Badge.jsx — Etiquetas de estado y énfasis decorativo
 *
 * Dos usos:
 *  status  → para estados de candidatura (En revisión, Entrevista, Aceptada…)
 *  decorative → para DESTACADA, CV COMILLAS, OPE, etc. (fondo ámbar naranja)
 */
import { T } from '../../styles/theme.js';

export default function Badge({
  label,
  variant = 'status',  // 'status' | 'decorative'
  status,              // clave de T.status (solo cuando variant='status')
  style,
}) {
  let bg, color;

  if (variant === 'status' && status) {
    const cfg = T.status[status] ?? { bg: T.hoverBg, color: T.t2 };
    bg    = cfg.bg;
    color = cfg.color;
  } else {
    // decorativo: ámbar suave
    bg    = T.orangeBg;
    color = T.orange;
  }

  return (
    <span
      style={{
        display:       'inline-block',
        padding:       '3px 10px',
        borderRadius:  T.radiusPill,
        backgroundColor: bg,
        color,
        fontSize:      11,
        fontWeight:    700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace:    'nowrap',
        fontFamily:    T.font,
        lineHeight:    1.6,
        ...style,
      }}
    >
      {label}
    </span>
  );
}