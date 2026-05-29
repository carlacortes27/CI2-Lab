/**
 * StatBox.jsx — Caja de estadística: número grande + label pequeño
 *
 * Props:
 *  value    → número o string a mostrar
 *  label    → etiqueta descriptiva debajo del número
 *  color    → color del número (default T.t2)
 *  bordered → añade borde derecho (para uso en fila de 4 stats)
 */
import { T } from '../../styles/theme.js';

export default function StatBox({ value, label, color = T.t2, bordered = false, style }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      padding:        '16px 8px',
      borderRight:    bordered ? `1px solid ${T.border}` : 'none',
      fontFamily:     T.font,
      ...style,
    }}>
      <span style={{
        fontSize:   40,
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize:   14,
        fontWeight: 400,
        color:      T.t3,
        marginTop:  5,
        textAlign:  'center',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
}