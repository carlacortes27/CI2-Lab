import { useState, useEffect } from 'react';
import { getOffers } from '../../lib/api.js';
import OfferListItem from './OfferListItem.jsx';
import OfferDetail from './OfferDetail.jsx';

// ═══════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════

const MOCK_CANDIDATURAS = [
  {
    id: 1,
    title: 'Prácticas en Operación de Activos',
    company: 'Iberdrola',
    location: 'Madrid',
    modality: 'Híbrido',
    status: 'revision',
    date: '12/06/2025',
    initials: 'IB',
    avatarBg: '#00A650',
  },
  {
    id: 2,
    title: 'Prácticas en Gestión de Proyectos',
    company: 'Naturgy',
    location: 'Madrid',
    modality: 'Presencial',
    status: 'entrevista',
    date: '08/06/2025',
    initials: 'N',
    avatarBg: '#FF6B00',
  },
  {
    id: 3,
    title: 'Prácticas en Advisory – Energía',
    company: 'EY',
    location: 'Madrid',
    modality: 'Híbrido',
    status: 'enviada',
    date: '02/06/2025',
    initials: 'EY',
    avatarBg: '#2E2E2E',
  },
  {
    id: 4,
    title: 'Prácticas en Análisis de Datos',
    company: 'ACCIONA Energía',
    location: 'Madrid',
    modality: 'Híbrido',
    status: 'aceptada',
    date: '20/05/2025',
    initials: 'AC',
    avatarBg: '#E30613',
  },
];

const MOCK_EVENTOS = [
  {
    id: 1,
    day: '17',
    month: 'JUN',
    title: 'Jornada de Empleo Comillas',
    time: '10:00 - 14:00',
    place: 'Campus Cantoblanco',
  },
  {
    id: 2,
    day: '24',
    month: 'JUN',
    title: 'Workshop: Prepara tu CV con IA',
    time: '16:00 - 18:00',
    place: 'Sala Magna, ICAI',
  },
];

const MOCK_RECURSOS = [
  {
    id: 1,
    title: 'Guía para entrevistas de prácticas',
    desc: 'Consejos y mejores prácticas',
    bg: '#DBEAFE',
    iconColor: '#1D4ED8',
  },
  {
    id: 2,
    title: 'Cómo redactar tu carta de presentación',
    desc: 'Plantillas y ejemplos reales',
    bg: '#EDE9FE',
    iconColor: '#6D28D9',
  },
];

const STATUS_CONFIG = {
  enviada:    { label: 'Aplicada',      cls: 'text-gray-500  bg-gray-100' },
  revision:   { label: 'En revisión',   cls: 'text-orange-600 bg-orange-50' },
  entrevista: { label: 'Entrevista',    cls: 'text-blue-600  bg-blue-50' },
  aceptada:   { label: 'Aceptada',      cls: 'text-green-600 bg-green-50' },
};

const SECTORES  = ['Consultoría', 'Energía', 'Finanzas', 'Tecnología', 'Legal', 'Industrial'];
const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrido',    label: 'Híbrido' },
  { value: 'remoto',     label: 'Remoto' },
];
const UBICACIONES = ['Madrid', 'Barcelona', 'Bilbao', 'Sevilla', 'Remoto'];
const DURACIONES  = ['3 meses', '6 meses', '12 meses'];

// ═══════════════════════════════════════════════════════
//  ICONS  (SVG inline, sin dependencias externas)
// ═══════════════════════════════════════════════════════

function Ico({ children, size = 18, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} style={style}>
      {children}
    </svg>
  );
}

/* Navegación */
const HomeIco      = () => <Ico><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>;
const BriefcaseIco = () => <Ico><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></Ico>;
const ClipboardIco = () => <Ico><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></Ico>;
const BuildingIco  = () => <Ico><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></Ico>;
const CalendarIco  = ({ size = 18 }) => <Ico size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>;
const BookIco      = ({ size = 18, style }) => <Ico size={size} style={style}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Ico>;
const CompassIco   = () => <Ico><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Ico>;
const UserIco      = () => <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;
const SettingsIco  = () => <Ico><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ico>;

/* UI general */
const SearchIco    = () => <Ico><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Ico>;
const BellIco      = () => <Ico><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ico>;
const MailIco      = () => <Ico><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ico>;
const ChevDownIco  = ({ size = 14 }) => <Ico size={size}><polyline points="6 9 12 15 18 9"/></Ico>;
const ChevRightIco = ({ size = 14 }) => <Ico size={size}><polyline points="9 18 15 12 9 6"/></Ico>;
const FilterIco    = () => <Ico size={15}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></Ico>;
const TrophyIco    = () => <Ico size={18}><polyline points="14.5 17 12 22 9.5 17"/><path d="M6.17 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2.17"/><path d="M4 5h16v6a8 8 0 0 1-16 0V5z"/></Ico>;
const InfoIco      = () => <Ico size={15}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ico>;
const PinIco       = ({ size = 11 }) => <Ico size={size}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>;
const MonitorIco   = ({ size = 11 }) => <Ico size={size}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Ico>;
const ClockIco     = ({ size = 11 }) => <Ico size={size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>;

// ═══════════════════════════════════════════════════════
//  UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════

function CompanyAvatar({ initials, bg, size = 38 }) {
  return (
    <div
      style={{ backgroundColor: bg, width: size, height: size, minWidth: size }}
      className="rounded-full flex items-center justify-center text-white font-extrabold text-xs select-none shadow-sm"
    >
      {initials}
    </div>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => (o.value ?? o) === value);
  const displayLabel = selected ? (selected.label ?? selected) : label;
  const isActive = Boolean(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-sm border rounded-full px-3.5 py-1.5 transition-all select-none ${
          isActive
            ? 'border-[#F0B400] bg-[#FFF8E0] text-[#8B6800] font-semibold'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
        }`}
      >
        {displayLabel}
        <ChevDownIco />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 min-w-[180px]">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50"
            >
              Todos
            </button>
            {options.map(opt => {
              const val = opt.value ?? opt;
              const lbl = opt.label ?? opt;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    value === val ? 'font-semibold text-[#C89600]' : 'text-gray-700'
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════

const NAV_ITEMS = [
  { key: 'inicio',       label: 'Inicio',          Icon: HomeIco },
  { key: 'ofertas',      label: 'Ofertas',          Icon: BriefcaseIco },
  { key: 'candidaturas', label: 'Mis candidaturas', Icon: ClipboardIco },
  { key: 'empresas',     label: 'Empresas',         Icon: BuildingIco },
  { key: 'eventos',      label: 'Eventos',          Icon: CalendarIco },
  { key: 'recursos',     label: 'Recursos',         Icon: BookIco },
  { key: 'orientacion',  label: 'Orientación',      Icon: CompassIco },
  { key: 'perfil',       label: 'Mi perfil',        Icon: UserIco },
  { key: 'ajustes',      label: 'Ajustes',          Icon: SettingsIco },
];

function Sidebar({ active, onSection, onNavigate }) {
  return (
    <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#F1B816 0%,#C89600 100%)' }}>
          {/* Escudo estilizado */}
          <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
            <path d="M14 3 L25 7 L25 16 C25 21 14 25 14 25 C14 25 3 21 3 16 L3 7 Z" fill="white" fillOpacity="0.9"/>
            <path d="M10 13 L13 16 L18 10" stroke="#C89600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="leading-tight">
          <p className="font-extrabold text-sm text-[#1F2937] tracking-wide uppercase">Comillas</p>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">Universidad Pontificia</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => key === 'inicio' ? onNavigate?.('home') : onSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#F1B816] text-[#1F2937] font-semibold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1F2937]'
              }`}
            >
              <span className={isActive ? 'text-[#1F2937]' : 'text-gray-400'}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Widget perfil */}
      <div className="mx-3 mb-4 mt-2 rounded-2xl bg-[#F1B816] p-4">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-8 h-8 bg-white/30 rounded-xl flex items-center justify-center shrink-0">
            <TrophyIco />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#1F2937] leading-tight">Completa tu perfil</p>
            <p className="text-[11px] text-[#1F2937]/70 leading-tight mt-0.5">y mejora tus recomendaciones</p>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 bg-white/40 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '80%' }} />
          </div>
          <span className="text-[11px] font-bold text-[#1F2937]">80%</span>
        </div>
        <button type="button"
          className="text-xs font-bold text-[#1F2937] hover:text-[#1F2937]/70 transition-colors underline underline-offset-2">
          Ver perfil →
        </button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════
//  TOP BAR
// ═══════════════════════════════════════════════════════

function TopBar({ userName, userDegree }) {
  const initials = (userName ?? '')
    .split(' ').slice(0, 2).map(n => n[0] ?? '').join('');
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
      {/* Buscador */}
      <div className="flex-1 relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <SearchIco />
        </span>
        <input
          type="text"
          placeholder="Buscar empresas, posiciones o palabras clave"
          className="w-full pl-11 pr-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#F1B816]/50 focus:bg-white transition-colors"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Campana */}
        <div className="relative">
          <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <BellIco />
          </button>
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-extrabold flex items-center justify-center leading-none pointer-events-none">2</span>
        </div>

        {/* Correo */}
        <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <MailIco />
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Perfil */}
        <button type="button" className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-extrabold select-none shadow-sm">
            {initials}
          </div>
          <div className="leading-tight text-left">
            <p className="text-xs font-bold text-[#1F2937]">{userName}</p>
            <p className="text-[10px] text-gray-400">{userDegree}</p>
          </div>
          <span className="text-gray-400"><ChevDownIco /></span>
        </button>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════
//  MIS CANDIDATURAS (panel derecho)
// ═══════════════════════════════════════════════════════

function CandidaturasPanel() {
  const counts = {
    enviadas:   8,
    revision:   MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length,
    entrevista: MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length,
    aceptada:   MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-[#1F2937]">Mis candidaturas</h2>
        <button type="button" className="text-xs text-[#C89600] font-semibold hover:underline">
          Ver todas →
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 border-y border-gray-100">
        <StatCell n={counts.enviadas}   label="Enviadas"     color="text-gray-600" />
        <StatCell n={counts.revision}   label="En revisión"  color="text-orange-500" />
        <StatCell n={counts.entrevista} label="Entrevista"   color="text-blue-500" />
        <StatCell n={counts.aceptada}   label="Aceptadas"    color="text-green-500" />
      </div>

      {/* Lista */}
      <div className="divide-y divide-gray-50">
        {MOCK_CANDIDATURAS.map(c => {
          const st = STATUS_CONFIG[c.status];
          return (
            <button
              key={c.id}
              type="button"
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <CompanyAvatar initials={c.initials} bg={c.avatarBg} size={36} />
              <div className="flex-1 min-w-0">
                {/* Fila 1: título + badge */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-[#1F2937] leading-snug truncate pr-1">{c.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                {/* Fila 2: empresa */}
                <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{c.company}</p>
                {/* Fila 3: meta */}
                <p className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5"><PinIco />{c.location}</span>
                  <span className="flex items-center gap-0.5"><MonitorIco />{c.modality}</span>
                </p>
                {/* Fila 4: fecha + chevron */}
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-gray-400">Aplicada el {c.date}</p>
                  <span className="text-gray-300"><ChevRightIco /></span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Consejo */}
      <div className="mx-4 mb-4 mt-1 rounded-xl bg-[#FFFBEB] border border-[#F1B816]/30 p-3 flex gap-3 items-start">
        <div className="w-9 h-9 rounded-xl bg-[#F1B816] flex items-center justify-center shrink-0">
          <TrophyIco />
        </div>
        <div>
          <p className="text-xs font-extrabold text-[#1F2937]">Consejo para destacar</p>
          <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
            Completa tu perfil al 100% y añade tus proyectos para mejorar tus opciones.
          </p>
          <button type="button" className="text-[11px] font-bold text-[#C89600] hover:underline mt-1 block">
            Ir a mi perfil →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({ n, label, color }) {
  return (
    <div className="flex flex-col items-center py-3">
      <span className={`text-xl font-extrabold leading-none ${color}`}>{n}</span>
      <span className="text-[10px] text-gray-400 text-center mt-0.5 leading-tight">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SECCIONES INFERIORES
// ═══════════════════════════════════════════════════════

function ProximosEventos() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
        <h3 className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
          <span className="text-[#C89600]"><CalendarIco size={15} /></span>
          Próximos eventos
        </h3>
        <button type="button" className="text-xs text-[#C89600] font-semibold hover:underline">
          Ver todos →
        </button>
      </div>
      <div className="p-4 space-y-4">
        {MOCK_EVENTOS.map(ev => (
          <div key={ev.id} className="flex items-start gap-3 cursor-pointer group">
            {/* Fecha */}
            <div className="flex flex-col items-center justify-center w-11 h-12 bg-gray-50 rounded-xl border border-gray-200 shrink-0 group-hover:border-[#F1B816] transition-colors">
              <span className="text-base font-extrabold text-[#1F2937] leading-none">{ev.day}</span>
              <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-widest leading-none mt-0.5">
                {ev.month}
              </span>
            </div>
            {/* Info */}
            <div>
              <p className="text-sm font-semibold text-[#1F2937] leading-snug group-hover:text-[#C89600] transition-colors">
                {ev.title}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1">
                <ClockIco />
                {ev.time}
                <span className="mx-0.5 text-gray-300">·</span>
                <PinIco />
                {ev.place}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecursosParaTi() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
        <h3 className="text-sm font-extrabold text-[#1F2937] flex items-center gap-2">
          <span className="text-[#C89600]"><BookIco size={15} /></span>
          Recursos para ti
        </h3>
        <button type="button" className="text-xs text-[#C89600] font-semibold hover:underline">
          Ver todos →
        </button>
      </div>
      <div className="p-4 space-y-4">
        {MOCK_RECURSOS.map(r => (
          <div key={r.id} className="flex items-start gap-3 cursor-pointer group">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-80"
              style={{ backgroundColor: r.bg }}
            >
              <BookIco size={18} style={{ color: r.iconColor, stroke: r.iconColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F2937] leading-snug group-hover:text-[#C89600] transition-colors">
                {r.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SKELETON DE CARGA
// ═══════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-4 animate-pulse">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded-full w-20" />
                <div className="h-5 bg-gray-200 rounded-full w-24" />
              </div>
            </div>
            <div className="w-12 space-y-1 shrink-0">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════

export default function OpePortalPage({
  onNavigate,
  onNavigateToEditor,
  userName   = 'Jaime Puente Sánchez',
  userDegree = '4º ICAI',
}) {
  const firstName = userName.split(' ')[0];

  const [activeSection, setActiveSection] = useState('inicio');
  const [offers,        setOffers]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAll,       setShowAll]       = useState(false);

  /* Filtros */
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
      .catch(() =>
        setError('No se pudo conectar con el servidor. Asegúrate de que está activo en el puerto 3001.')
      )
      .finally(() => setLoading(false));
  }, [filterSector, filterLocation, filterModality]);

  const visibleOffers = showAll ? offers : offers.slice(0, 3);
  const hasMore       = !showAll && offers.length > 3;

  /* ── Vista de detalle ──────────────────────────────── */
  if (selectedOffer) {
    return (
      <div className="fixed inset-0 z-50 flex bg-[#F4F5F7]">
        <Sidebar active="ofertas" onSection={setActiveSection} onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar userName={userName} userDegree={userDegree} />
          <div className="flex-1 overflow-y-auto">
            <OfferDetail offer={selectedOffer} onBack={() => setSelectedOffer(null)} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Vista principal ───────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex bg-[#F4F5F7]">
      <Sidebar active={activeSection} onSection={setActiveSection} onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar userName={userName} userDegree={userDegree} />

        <main className="flex-1 overflow-y-auto">
          {/* Saludo */}
          <div className="px-8 pt-7 pb-5">
            <h1 className="text-2xl font-extrabold text-[#1F2937]">¡Hola, {firstName}! 👋</h1>
            <p className="text-sm text-gray-500 mt-1">
              Descubre prácticas recomendadas para ti y sigue el estado de tus candidaturas.
            </p>
          </div>

          {/* Grid: columna izquierda + columna derecha */}
          <div className="px-8 pb-8 flex gap-6 items-start">

            {/* ── COLUMNA IZQUIERDA ─────────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Tarjeta de ofertas */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {/* Cabecera sección */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-extrabold text-[#1F2937]">
                      Ofertas recomendadas para ti
                    </h2>
                    <span className="text-gray-400"><InfoIco /></span>
                  </div>
                  <button type="button" className="text-sm text-[#C89600] font-semibold hover:underline">
                    Ver todas las ofertas →
                  </button>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  <FilterDropdown
                    label="Área profesional"
                    options={SECTORES}
                    value={filterSector}
                    onChange={setFilterSector}
                  />
                  <FilterDropdown
                    label="Ubicación"
                    options={UBICACIONES}
                    value={filterLocation}
                    onChange={setFilterLocation}
                  />
                  <FilterDropdown
                    label="Modalidad"
                    options={MODALIDADES}
                    value={filterModality}
                    onChange={setFilterModality}
                  />
                  <FilterDropdown
                    label="Duración"
                    options={DURACIONES}
                    value=""
                    onChange={() => {}}
                  />
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-full px-3.5 py-1.5 hover:border-gray-400 transition-colors"
                  >
                    <FilterIco />
                    Más filtros
                  </button>
                </div>

                {/* Contenido según estado */}
                {loading && <LoadingSkeleton />}

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {!loading && !error && offers.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-10">
                    No hay ofertas disponibles con los filtros seleccionados.
                  </p>
                )}

                {!loading && !error && offers.length > 0 && (
                  <>
                    <div className="space-y-3">
                      {visibleOffers.map((offer, idx) => (
                        <OfferListItem
                          key={offer.id}
                          offer={offer}
                          rank={idx}
                          onClick={() => setSelectedOffer(offer)}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <div className="mt-5 text-center">
                        <button
                          type="button"
                          onClick={() => setShowAll(true)}
                          className="text-sm font-semibold text-[#C89600] hover:underline"
                        >
                          Ver más ofertas →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Próximos eventos + Recursos */}
              <div className="grid grid-cols-2 gap-5">
                <ProximosEventos />
                <RecursosParaTi />
              </div>
            </div>

            {/* ── COLUMNA DERECHA ───────────────────────── */}
            <div className="w-[320px] shrink-0 sticky top-4">
              <CandidaturasPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
