/**
 * theme.js — Tokens de diseño globales de Comillas Career
 *
 * Fuente de verdad para colores, tipografía, espaciado y sombras.
 * Consumir en componentes con: import { T } from '../../styles/theme.js'
 *
 * REGLA: Ningún componente define sus propios tokens de color ni sombra.
 * Si necesitas un valor nuevo, añádelo aquí y documéntalo.
 */

export const T = {
  // ── Tipografía ────────────────────────────────────────────────────────────
  font: "'Inter', system-ui, -apple-system, sans-serif",

  // ── Paleta ────────────────────────────────────────────────────────────────
  orange:    '#F5A623',   // Naranja primario
  orangeBg:  '#FEF3E2',  // Ámbar fondo suave
  t1:        '#1A1A1A',  // Texto principal
  t2:        '#6B7280',  // Texto secundario
  t3:        '#9CA3AF',  // Texto terciario / metadatos
  bg:        '#F6F7F9',  // Fondo de página
  white:     '#FFFFFF',  // Fondo de cards
  border:    '#E5E7EB',  // Bordes
  hoverBg:   '#F3F4F6',  // Fondo en hover (ítems inactivos)

  // ── Sombras ───────────────────────────────────────────────────────────────
  shadowCard:     '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowElevated: '0 4px 12px rgba(0,0,0,0.08)',

  // ── Radios ────────────────────────────────────────────────────────────────
  radiusCard:  16,    // Cards contenedoras
  radiusPill:  9999,  // Píldoras, badges, filtros
  radiusInput: 12,    // Inputs, selects, botones rectangulares, logos empresa

  // ── Espaciado ─────────────────────────────────────────────────────────────
  paddingCard: 24,

  // ── Estados de candidatura ────────────────────────────────────────────────
  // bg: fondo del badge | color: texto del badge | label: texto mostrado
  status: {
    revision:   { bg: '#FEF3E2', color: '#B45309', label: 'En revisión' },
    entrevista: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Entrevista'  },
    enviada:    { bg: '#F3F4F6', color: '#4B5563', label: 'Aplicada'    },
    aceptada:   { bg: '#DCFCE7', color: '#15803D', label: 'Aceptada'    },
    finalizada: { bg: '#E0F2FE', color: '#0369A1', label: 'Finalizada'  },
    rechazada:  { bg: '#FEE2E2', color: '#B91C1C', label: 'Rechazada'   },
    guardada:   { bg: '#F3F4F6', color: '#6B7280', label: 'Guardada'    },
  },
};

/**
 * Utilidad: card base reutilizable (inline style object)
 */
export const cardStyle = {
  backgroundColor: T.white,
  borderRadius:    T.radiusCard,
  boxShadow:       T.shadowCard,
};

/**
 * Utilidad: convierte un nombre de empresa a color de marca.
 * Usado en CompanyLogo y ApplicationCard.
 */
const BRAND_COLORS = {
  mckinsey:  '#1A1A2E', iberdrola: '#00A650', deloitte:  '#86BC25',
  kpmg:      '#00338D', pwc:       '#E0301E', ey:        '#2E2E2E',
  accenture: '#A100FF', santander: '#EC0000', bbva:      '#004481',
  telefonica:'#019DF4', acciona:   '#E30613', repsol:    '#B8960A',
  naturgy:   '#FF6B00', endesa:    '#00A3E0', cepsa:     '#00A86B',
  redexis:   '#0099A8', amazon:    '#FF9900', google:    '#4285F4',
  microsoft: '#00A4EF', indra:     '#003DA5', capgemini: '#0070AD',
};

export function brandColor(company = '') {
  const words = company.toLowerCase().split(/\s+/);
  for (const w of words) if (BRAND_COLORS[w]) return BRAND_COLORS[w];
  // Fallback determinista basado en el nombre
  let h = 0;
  for (let i = 0; i < company.length; i++) h = company.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},55%,35%)`;
}

export function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}
