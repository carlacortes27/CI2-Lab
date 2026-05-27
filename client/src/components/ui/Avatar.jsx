/**
 * Avatar.jsx — Avatar de usuario
 *
 * Regla: si hay foto → mostrar foto real en círculo.
 *        si no hay foto → fondo gris neutro (#D1D5DB) con iniciales en #374151.
 *        NUNCA: fondo naranja ni iniciales en círculo naranja.
 */
import { T } from '../../styles/theme.js';

export default function Avatar({
  src,       // URL de la foto del usuario (opcional)
  name = '', // Nombre completo (para derivar iniciales)
  size = 36,
  style,
}) {
  // Derivar iniciales del nombre
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const base = {
    width:          size,
    height:         size,
    minWidth:       size,
    borderRadius:   T.radiusPill,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    overflow:       'hidden',
    fontFamily:     T.font,
    ...style,
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ ...base, objectFit: 'cover' }}
      />
    );
  }

  return (
    <div style={{
      ...base,
      backgroundColor: '#D1D5DB',   // gris neutro
      color:           '#374151',   // texto gris oscuro
      fontSize:        size * 0.33,
      fontWeight:      600,
    }}>
      {initials || '?'}
    </div>
  );
}