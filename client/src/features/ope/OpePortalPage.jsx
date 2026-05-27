import { useState, useEffect } from 'react';
import { getOffers } from '../../lib/api.js';
import OfferListItem from './OfferListItem.jsx';
import OfferDetail from './OfferDetail.jsx';

// ── Tokens de diseño ──────────────────────────────────────────────────────────
const T = {
  bg:          '#F6F7F9',
  white:       '#FFFFFF',
  orange:      '#F5A623',
  orangeBg:    '#FEF3E2',
  t1:          '#1A1A1A',
  t2:          '#6B7280',
  t3:          '#9CA3AF',
  border:      '#E5E7EB',
  cardShadow:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardRadius:  16,
  pillRadius:  9999,
};

const card = {
  backgroundColor: T.white,
  borderRadius: T.cardRadius,
  boxShadow: T.cardShadow,
};

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_CANDIDATURAS = [
  { id: 1, title: 'Prácticas en Operación de Activos',  company: 'Iberdrola',      location: 'Madrid', modality: 'Híbrido',    status: 'revision',   date: '12/06/2025', initials: 'IB', color: '#00A650' },
  { id: 2, title: 'Prácticas en Gestión de Proyectos',  company: 'Naturgy',         location: 'Madrid', modality: 'Presencial', status: 'entrevista', date: '08/06/2025', initials: 'N',  color: '#FF6B00' },
  { id: 3, title: 'Prácticas en Advisory – Energía',    company: 'EY',              location: 'Madrid', modality: 'Híbrido',    status: 'enviada',    date: '02/06/2025', initials: 'EY', color: '#2E2E2E' },
  { id: 4, title: 'Prácticas en Análisis de Datos',     company: 'ACCIONA Energía', location: 'Madrid', modality: 'Híbrido',    status: 'aceptada',   date: '20/05/2025', initials: 'AC', color: '#E30613' },
];

const MOCK_EVENTOS = [
  { id: 1, day: '17', month: 'JUN', title: 'Jornada de Empleo Comillas',    time: '10:00 - 14:00', place: 'Campus Cantoblanco' },
  { id: 2, day: '24', month: 'JUN', title: 'Workshop: Prepara tu CV con IA', time: '16:00 - 18:00', place: 'Sala Magna, ICAI'  },
];

const MOCK_RECURSOS = [
  { id: 1, title: 'Guía para entrevistas de prácticas',     desc: 'Consejos y mejores prácticas', bg: '#DBEAFE', ic: '#1D4ED8' },
  { id: 2, title: 'Cómo redactar tu carta de presentación', desc: 'Plantillas y ejemplos reales',  bg: '#EDE9FE', ic: '#6D28D9' },
];

const STATUS_CFG = {
  enviada:    { label: 'Aplicada',    bg: '#F3F4F6', color: '#6B7280' },
  revision:   { label: 'En revisión', bg: '#FEF3E2', color: '#F5A623' },
  entrevista: { label: 'Entrevista',  bg: '#EFF6FF', color: '#2563EB' },
  aceptada:   { label: 'Aceptada',    bg: '#F0FDF4', color: '#16A34A' },
};

const SECTORES   = ['Consultoría', 'Energía', 'Finanzas', 'Tecnología', 'Legal', 'Industrial'];
const MODALIDADES = [{ value: 'presencial', label: 'Presencial' }, { value: 'hibrido', label: 'Híbrido' }, { value: 'remoto', label: 'Remoto' }];
const UBICACIONES = ['Madrid', 'Barcelona', 'Bilbao', 'Sevilla', 'Remoto'];
const DURACIONES  = ['3 meses', '6 meses', '12 meses'];

// ── Iconos SVG ────────────────────────────────────────────────────────────────
function Ico({ children, size = 18, color, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

const HomeIco      = ({ color }) => <Ico color={color}><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>;
const BriefIco     = ({ color }) => <Ico color={color}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></Ico>;
const ClipIco      = ({ color }) => <Ico color={color}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></Ico>;
const BldgIco      = ({ color }) => <Ico color={color}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></Ico>;
const CalIco       = ({ color, size = 18 }) => <Ico color={color} size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>;
const BookIco      = ({ color, size = 18 }) => <Ico color={color} size={size}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Ico>;
const CmpIco       = ({ color }) => <Ico color={color}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Ico>;
const UserIco      = ({ color }) => <Ico color={color}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;
const SetIco       = ({ color }) => <Ico color={color}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ico>;
const SearchIco    = () => <Ico size={17} color={T.t3}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Ico>;
const BellIco      = () => <Ico size={20}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ico>;
const MailIco      = () => <Ico size={20}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ico>;
const ChevDn       = ({ size = 14 }) => <Ico size={size}><polyline points="6 9 12 15 18 9"/></Ico>;
const ChevRt       = ({ size = 13 }) => <Ico size={size}><polyline points="9 18 15 12 9 6"/></Ico>;
const FilterIco    = () => <Ico size={15}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></Ico>;
const TrophyIco    = ({ color = T.white }) => <Ico size={18} color={color}><polyline points="14.5 17 12 22 9.5 17"/><path d="M6.17 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2.17"/><path d="M4 5h16v6a8 8 0 0 1-16 0V5z"/></Ico>;
const InfoIco      = () => <Ico size={15} color={T.t3}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ico>;
const PinIco       = ({ size = 11 }) => <Ico size={size} color={T.t3}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>;
const MonIco       = ({ size = 11 }) => <Ico size={size} color={T.t3}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Ico>;
const ClockIco     = ({ size = 11 }) => <Ico size={size} color={T.t3}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>;

// ── FilterDropdown ────────────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const sel   = options.find(o => (o.value ?? o) === value);
  const lbl   = sel ? (sel.label ?? sel) : label;
  const active = Boolean(value);

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px',
          borderRadius: T.pillRadius,
          border: `1px solid ${active ? T.orange : T.border}`,
          backgroundColor: active ? T.orangeBg : T.white,
          color: active ? '#92700A' : T.t2,
          fontSize: 13, fontWeight: active ? 500 : 400,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
        {lbl} <ChevDn />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 30,
            backgroundColor: T.white, border: `1px solid ${T.border}`,
            borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            minWidth: 180, overflow: 'hidden',
          }}>
            {[{ v: '', l: 'Todos' }, ...options.map(o => ({ v: o.value ?? o, l: o.label ?? o }))].map(({ v, l }) => (
              <button key={v} type="button"
                onClick={() => { onChange(v); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', fontSize: 13,
                  fontWeight: value === v ? 600 : 400,
                  color: value === v ? T.orange : T.t1,
                  backgroundColor: 'transparent', cursor: 'pointer',
                  borderBottom: `1px solid ${T.border}`,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
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

// ── NAV ITEMS ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'inicio',       label: 'Inicio',          Icon: HomeIco },
  { key: 'ofertas',      label: 'Ofertas',          Icon: BriefIco },
  { key: 'candidaturas', label: 'Mis candidaturas', Icon: ClipIco },
  { key: 'empresas',     label: 'Empresas',         Icon: BldgIco },
  { key: 'eventos',      label: 'Eventos',          Icon: CalIco },
  { key: 'recursos',     label: 'Recursos',         Icon: BookIco },
  { key: 'orientacion',  label: 'Orientación',      Icon: CmpIco },
  { key: 'perfil',       label: 'Mi perfil',        Icon: UserIco },
  { key: 'ajustes',      label: 'Ajustes',          Icon: SetIco },
];

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onSection, onNavigate }) {
  return (
    <aside style={{
      backgroundColor: T.white,
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', overflowX: 'hidden',
      width: 260, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.orange} 0%, #D4880A 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
              <path d="M14 3L25 7L25 16C25 21 14 25 14 25C14 25 3 21 3 16L3 7Z" fill="white" fillOpacity="0.95"/>
              <path d="M10 13L13 16L18 10" stroke="#D4880A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: T.t1, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1 }}>
              Comillas
            </p>
            <p style={{ fontSize: 10, fontWeight: 400, color: T.t3, marginTop: 3, lineHeight: 1 }}>
              Universidad Pontificia
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button key={key} type="button"
              onClick={() => key === 'inicio' ? onNavigate?.('home') : onSection(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '11px 14px',
                borderRadius: 12, marginBottom: 2,
                backgroundColor: isActive ? T.orange : 'transparent',
                color: isActive ? T.white : '#4B5563',
                fontSize: 14, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
                border: 'none', transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Icon color={isActive ? T.white : T.t3} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* CTA "Completa tu perfil" — al fondo, dentro del sidebar */}
      <div style={{ padding: '16px', flexShrink: 0 }}>
        <div style={{ backgroundColor: T.orange, borderRadius: 16, padding: '20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrophyIco color={T.white} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.white, lineHeight: 1.3 }}>Completa tu perfil</p>
              <p style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 1.4 }}>
                y mejora tus recomendaciones
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: T.pillRadius, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: '80%', backgroundColor: T.white, borderRadius: T.pillRadius }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>80%</span>
            <button type="button"
              style={{ fontSize: 12, fontWeight: 700, color: T.white, textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver perfil →
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── HEADER (88px, ancho completo) ─────────────────────────────────────────────
function Header({ userName, userDegree }) {
  const initials = (userName ?? '').split(' ').slice(0, 2).map(n => n[0] ?? '').join('');
  return (
    <header style={{
      height: 88, backgroundColor: T.white,
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 40px', gap: 24, flexShrink: 0,
    }}>
      {/* Buscador centrado con max-width 720px */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
            <SearchIco />
          </span>
          <input type="text"
            placeholder="Buscar empresas, posiciones o palabras clave"
            style={{
              width: '100%', paddingLeft: 46, paddingRight: 20, paddingTop: 12, paddingBottom: 12,
              borderRadius: T.pillRadius, border: `1px solid ${T.border}`,
              fontSize: 14, fontWeight: 400, color: T.t1,
              backgroundColor: T.white, outline: 'none',
              fontFamily: FONT,
            }}
            onFocus={e => { e.target.style.borderColor = T.orange; e.target.style.boxShadow = `0 0 0 3px ${T.orangeBg}`; }}
            onBlur={e =>  { e.target.style.borderColor = T.border;  e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Iconos + perfil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Campana */}
        <div style={{ position: 'relative' }}>
          <button type="button" style={{ width: 40, height: 40, borderRadius: T.pillRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.t2, background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <BellIco />
          </button>
          <span style={{
            position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: T.pillRadius,
            backgroundColor: '#F97316', color: T.white, fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>2</span>
        </div>

        {/* Correo */}
        <button type="button" style={{ width: 40, height: 40, borderRadius: T.pillRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.t2, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <MailIco />
        </button>

        {/* Divisor */}
        <div style={{ width: 1, height: 28, backgroundColor: T.border, margin: '0 8px' }} />

        {/* Avatar + nombre */}
        <button type="button"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: T.cardRadius, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <div style={{
            width: 36, height: 36, borderRadius: T.pillRadius,
            background: 'linear-gradient(135deg,#FBBF24,#F97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.white, fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.t1, lineHeight: 1.3 }}>{userName}</p>
            <p style={{ fontSize: 11, fontWeight: 400, color: T.t3, lineHeight: 1.3 }}>{userDegree}</p>
          </div>
          <span style={{ color: T.t3 }}><ChevDn /></span>
        </button>
      </div>
    </header>
  );
}

// ── PANEL MIS CANDIDATURAS ────────────────────────────────────────────────────
function CandidaturasPanel() {
  const counts = {
    enviadas:   8,
    revision:   MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length,
    entrevista: MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length,
    aceptada:   MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length,
  };

  return (
    <div style={{ ...card }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.t1 }}>Mis candidaturas</span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
          Ver todas →
        </button>
      </div>

      {/* Stats 4 cajas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${T.border}` }}>
        {[
          { n: counts.enviadas,   lbl: 'Enviadas',     c: T.t2       },
          { n: counts.revision,   lbl: 'En revisión',  c: '#F5A623'  },
          { n: counts.entrevista, lbl: 'Entrevista',   c: '#2563EB'  },
          { n: counts.aceptada,   lbl: 'Aceptadas',    c: '#16A34A'  },
        ].map(({ n, lbl, c }) => (
          <div key={lbl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px', borderRight: `1px solid ${T.border}` }}
            className="last:border-r-0">
            <span style={{ fontSize: 22, fontWeight: 700, color: c, lineHeight: 1 }}>{n}</span>
            <span style={{ fontSize: 11, fontWeight: 400, color: T.t3, marginTop: 5, textAlign: 'center', lineHeight: 1.3 }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Lista candidaturas */}
      {MOCK_CANDIDATURAS.map((c, i) => {
        const st = STATUS_CFG[c.status];
        const isLast = i === MOCK_CANDIDATURAS.length - 1;
        return (
          <button key={c.id} type="button"
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: isLast ? 'none' : `1px solid ${T.border}` }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            {/* Avatar empresa */}
            <div style={{ width: 38, height: 38, minWidth: 38, borderRadius: T.pillRadius, backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontSize: 11, fontWeight: 700 }}>
              {c.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Fila: título + badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                {/* Título: NO truncado, permite 2 líneas */}
                <span style={{ fontSize: 13, fontWeight: 600, color: T.t1, lineHeight: 1.4, whiteSpace: 'normal' }}>
                  {c.title}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: T.pillRadius, flexShrink: 0,
                  backgroundColor: st.bg, color: st.color,
                  fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {st.label}
                </span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 400, color: T.t2, marginTop: 3 }}>{c.company}</p>
              <p style={{ fontSize: 11, fontWeight: 400, color: T.t3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><PinIco />{c.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MonIco />{c.modality}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 400, color: T.t3 }}>Aplicada el {c.date}</span>
                <span style={{ color: T.t3 }}><ChevRt /></span>
              </div>
            </div>
          </button>
        );
      })}

      {/* Consejo */}
      <div style={{ margin: '0 16px 16px', borderRadius: 12, padding: 16, backgroundColor: '#FEF9EF', border: '1px solid #FEF3E2', display: 'flex', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrophyIco />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.t1 }}>Consejo para destacar</p>
          <p style={{ fontSize: 12, fontWeight: 400, color: T.t2, lineHeight: 1.5, marginTop: 4 }}>
            Completa tu perfil al 100% y añade tus proyectos para mejorar tus opciones.
          </p>
          <button type="button" style={{ fontSize: 12, fontWeight: 600, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, display: 'block' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
            Ir a mi perfil →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PRÓXIMOS EVENTOS ──────────────────────────────────────────────────────────
function ProximosEventos() {
  return (
    <div style={card}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: T.t1 }}>
          <CalIco size={15} color={T.orange} />
          Próximos eventos
        </span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
          Ver todos →
        </button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_EVENTOS.map(ev => (
          <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 48, height: 52, border: `1px solid ${T.border}`, borderRadius: 12, backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.t1, lineHeight: 1 }}>{ev.day}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#F97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>{ev.month}</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.t1, lineHeight: 1.4 }}>{ev.title}</p>
              <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockIco />{ev.time}
                <span style={{ color: T.border }}>·</span>
                <PinIco />{ev.place}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RECURSOS PARA TI ──────────────────────────────────────────────────────────
function RecursosParaTi() {
  return (
    <div style={card}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: T.t1 }}>
          <BookIco size={15} color={T.orange} />
          Recursos para ti
        </span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
          Ver todos →
        </button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_RECURSOS.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookIco size={18} color={r.ic} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.t1, lineHeight: 1.4 }}>{r.title}</p>
              <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, marginTop: 3 }}>{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...card, padding: 24, animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#E5E7EB', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, width: '30%', marginBottom: 10 }} />
              <div style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 6, width: '70%', marginBottom: 8 }} />
              <div style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, width: '50%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function OpePortalPage({
  onNavigate,
  onNavigateToEditor,
  userName   = 'Jaime Puente Sánchez',
  userDegree = '4º ICAI',
}) {
  const firstName = userName.split(' ')[0];

  // Cargar Inter desde Google Fonts
  useEffect(() => {
    if (!document.getElementById('ope-inter')) {
      const link = document.createElement('link');
      link.id   = 'ope-inter';
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const [activeSection, setActiveSection] = useState('inicio');
  const [offers,        setOffers]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAll,       setShowAll]       = useState(false);

  const [filterSector,   setFilterSector]   = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterModality, setFilterModality] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setShowAll(false);
    getOffers({
      type: 'practicas',
      ...(filterSector   && { sector:   filterSector }),
      ...(filterLocation && { location: filterLocation }),
      ...(filterModality && { modality: filterModality }),
    })
      .then(data => setOffers(data))
      .catch(() => setError('No se pudo conectar con el servidor. Asegúrate de que está activo en el puerto 3001.'))
      .finally(() => setLoading(false));
  }, [filterSector, filterLocation, filterModality]);

  const visibleOffers = showAll ? offers : offers.slice(0, 3);
  const hasMore       = !showAll && offers.length > 3;

  /* ── Vista de detalle ─────────────────────────────────────────────── */
  if (selectedOffer) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', fontFamily: FONT, backgroundColor: T.bg }}>
        <Header userName={userName} userDegree={userDegree} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '260px 1fr' }}>
          <Sidebar active="ofertas" onSection={setActiveSection} onNavigate={onNavigate} />
          <main style={{ overflowY: 'auto', backgroundColor: T.bg }}>
            <OfferDetail offer={selectedOffer} onBack={() => setSelectedOffer(null)} />
          </main>
        </div>
      </div>
    );
  }

  /* ── Vista principal ──────────────────────────────────────────────── */
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', fontFamily: FONT, backgroundColor: T.bg }}>
      {/* HEADER — ocupa todo el ancho, 88px */}
      <Header userName={userName} userDegree={userDegree} />

      {/* CONTENIDO — grid de 3 columnas: 260px | 1fr | 380px */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '260px 1fr 380px' }}>

        {/* Columna 1: Sidebar */}
        <Sidebar active={activeSection} onSection={setActiveSection} onNavigate={onNavigate} />

        {/* Columna 2: Contenido central */}
        <main style={{ overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Saludo */}
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, lineHeight: 1.2, margin: 0 }}>
              ¡Hola, {firstName}! 👋
            </h1>
            <p style={{ fontSize: 14, fontWeight: 400, color: T.t2, marginTop: 8, lineHeight: 1.5 }}>
              Descubre prácticas recomendadas para ti y sigue el estado de tus candidaturas.
            </p>
          </div>

          {/* Cabecera + Filtros (card propia) */}
          <div style={card}>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: T.t1 }}>
                Ofertas recomendadas para ti
                <InfoIco />
              </span>
              <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Ver todas las ofertas →
              </button>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <FilterDropdown label="Área profesional" options={SECTORES}    value={filterSector}   onChange={setFilterSector} />
              <FilterDropdown label="Ubicación"        options={UBICACIONES}  value={filterLocation} onChange={setFilterLocation} />
              <FilterDropdown label="Modalidad"        options={MODALIDADES}  value={filterModality} onChange={setFilterModality} />
              <FilterDropdown label="Duración"         options={DURACIONES}   value=""               onChange={() => {}} />
              <button type="button"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: T.pillRadius, border: `1px solid ${T.border}`, backgroundColor: T.white, color: T.t2, fontSize: 13, fontWeight: 400, cursor: 'pointer' }}>
                <FilterIco />
                Más filtros
              </button>
            </div>
          </div>

          {/* Tarjetas de oferta */}
          {loading && <LoadingSkeleton />}

          {error && (
            <div style={{ borderRadius: T.cardRadius, padding: 16, backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p style={{ fontSize: 13, color: '#B91C1C', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          {!loading && !error && offers.length === 0 && (
            <p style={{ fontSize: 14, color: T.t3, textAlign: 'center', padding: '40px 0' }}>
              No hay ofertas disponibles con los filtros seleccionados.
            </p>
          )}

          {!loading && !error && visibleOffers.map((offer, idx) => (
            <OfferListItem key={offer.id} offer={offer} rank={idx} onClick={() => setSelectedOffer(offer)} />
          ))}

          {hasMore && (
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => setShowAll(true)}
                style={{ fontSize: 14, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver más ofertas →
              </button>
            </div>
          )}

          {/* Secciones inferiores: eventos + recursos */}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <ProximosEventos />
              <RecursosParaTi />
            </div>
          )}
        </main>

        {/* Columna 3: Panel Mis Candidaturas */}
        <aside style={{ overflowY: 'auto', padding: '24px', backgroundColor: T.bg, borderLeft: `1px solid ${T.border}` }}>
          <CandidaturasPanel />
        </aside>
      </div>
    </div>
  );
}
