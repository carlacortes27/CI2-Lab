/**
 * Card.jsx — Contenedor card estándar
 *
 * Props:
 *  title       → título H2 en el header de la card (opcional)
 *  action      → texto del link terciario "Ver todos →" (opcional)
 *  onAction    → callback del link
 *  actionIcon  → nodo JSX opcional junto al título (icono)
 *  padding     → padding interno (default 24px)
 *  children    → contenido
 */
import { T, cardStyle } from '../../styles/theme.js';

export default function Card({
  title,
  action,
  onAction,
  actionIcon,
  padding = 24,
  style,
  children,
}) {
  const hasHeader = Boolean(title || action);

  return (
    <div style={{ ...cardStyle, ...style }}>
      {hasHeader && (
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '20px 24px 16px',
          borderBottom:   `1px solid ${T.border}`,
        }}>
          <span style={{
            display:    'flex',
            alignItems: 'center',
            gap:        8,
            fontSize:   15,
            fontWeight: 600,
            color:      T.t1,
            fontFamily: T.font,
          }}>
            {actionIcon}
            {title}
          </span>
          {action && (
            <button
              type="button"
              onClick={onAction}
              style={{
                fontSize:   13,
                fontWeight: 500,
                color:      T.orange,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                fontFamily: T.font,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              {action} →
            </button>
          )}
        </div>
      )}
      <div style={{ padding }}>
        {children}
      </div>
    </div>
  );
}