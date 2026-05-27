/**
 * Button.jsx — Botones del sistema de diseño Comillas Career
 *
 * Variantes:
 *  primary   → fondo #1A1A1A, texto blanco, radius 12px
 *  secondary → fondo blanco, borde #E5E7EB, texto oscuro
 *  tertiary  → texto naranja, sin fondo ni borde, con flecha opcional
 *  toolbar   → fondo blanco, borde #E5E7EB, texto oscuro (header CV shell)
 */
import { T } from '../../styles/theme.js';

const BASE = {
  display:       'inline-flex',
  alignItems:    'center',
  justifyContent:'center',
  gap:           8,
  border:        'none',
  cursor:        'pointer',
  fontFamily:    T.font,
  fontWeight:    600,
  fontSize:      14,
  lineHeight:    1,
  transition:    'background-color 0.15s, box-shadow 0.15s, opacity 0.15s',
  whiteSpace:    'nowrap',
};

const VARIANTS = {
  primary: {
    backgroundColor: T.t1,
    color:           T.white,
    borderRadius:    T.radiusInput,
    padding:         '12px 24px',
  },
  secondary: {
    backgroundColor: T.white,
    border:          `1px solid ${T.border}`,
    color:           T.t1,
    borderRadius:    T.radiusInput,
    padding:         '10px 20px',
  },
  tertiary: {
    backgroundColor: 'transparent',
    color:           T.orange,
    borderRadius:    T.radiusInput,
    padding:         '8px 0',
    fontWeight:      500,
  },
  toolbar: {
    backgroundColor: T.white,
    border:          `1px solid ${T.border}`,
    color:           T.t1,
    borderRadius:    T.radiusInput,
    padding:         '10px 16px',
    fontSize:        13,
  },
};

const HOVER = {
  primary:   { backgroundColor: '#2D2D2D' },
  secondary: { backgroundColor: T.hoverBg },
  tertiary:  { textDecoration: 'underline' },
  toolbar:   { backgroundColor: T.hoverBg },
};

export default function Button({
  variant = 'primary',
  children,
  arrow = false,       // añade " →" al final (para tertiary)
  disabled = false,
  onClick,
  style,
  type = 'button',
}) {
  const variantStyle = VARIANTS[variant] ?? VARIANTS.primary;

  function handleMouseEnter(e) {
    if (disabled) return;
    const h = HOVER[variant];
    if (h) Object.assign(e.currentTarget.style, h);
  }

  function handleMouseLeave(e) {
    const h = HOVER[variant];
    if (h) {
      // restaura los valores base
      Object.keys(h).forEach(k => {
        e.currentTarget.style[k] = variantStyle[k] ?? '';
      });
    }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...BASE,
        ...variantStyle,
        opacity:  disabled ? 0.45 : 1,
        cursor:   disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
      {arrow && <span style={{ marginLeft: 2 }}>→</span>}
    </button>
  );
}