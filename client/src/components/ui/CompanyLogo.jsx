/**
 * CompanyLogo.jsx — Logo de empresa
 *
 * Recuadro 64×64px (o tamaño configurable), fondo blanco, borde #E5E7EB, radius 12px.
 * Si hay logo real (src): mostrar imagen centrada.
 * Si no: iniciales en color corporativo sobre fondo blanco.
 *
 * PROHIBIDO: círculos de color con iniciales.
 */
import { T, brandColor, initials } from '../../styles/theme.js';

export default function CompanyLogo({
  src,         // URL del logo real (opcional)
  company = '', // Nombre de la empresa (para derivar color e iniciales)
  size = 64,
  style,
}) {
  const color  = brandColor(company);
  const inits  = initials(company);

  const base = {
    width:           size,
    height:          size,
    minWidth:        size,
    backgroundColor: T.white,
    border:          `1px solid ${T.border}`,
    borderRadius:    T.radiusInput,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    overflow:        'hidden',
    ...style,
  };

  if (src) {
    return (
      <div style={base}>
        <img
          src={src}
          alt={company}
          style={{ width: '72%', height: '72%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div style={base}>
      <span style={{
        fontSize:   size * 0.25,
        fontWeight: 700,
        color,
        fontFamily: T.font,
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {inits}
      </span>
    </div>
  );
}