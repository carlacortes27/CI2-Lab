import { useState, useEffect } from 'react';
import { getOffers } from '../../lib/api.js';
import OfferListItem from './OfferListItem.jsx';
import OfferDetail from './OfferDetail.jsx';

// ── Datos sintéticos de candidaturas ─────────────────────────────────────────
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

const STATUS_CONFIG = {
  enviada:    { label: 'Aplicada',     cls: 'text-gray-500 bg-gray-100' },
  revision:   { label: 'En revisión',  cls: 'text-orange-600 bg-orange-50' },
  entrevista: { label: 'Entrevista',   cls: 'text-blue-600 bg-blue-50' },
  aceptada:   { label: 'Aceptada',     cls: 'text-green-600 bg-green-50' },
};

// Sectores disponibles para el filtro de Área profesional
const SECTORES = ['Consultoría', 'Energía', 'Finanzas', 'Tecnología', 'Legal', 'Industrial'];
const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrido',    label: 'Híbrido' },
  { value: 'remoto',     label: 'Remoto' },
];
const DURACIONES = ['3 meses', '6 meses', '12 meses'];

// ── Iconos SVG ────────────────────────────────────────────────────────────────
function SvgIcon({ children, size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

function HomeIcon()          { return <SvgIcon><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></SvgIcon>; }
function BriefcaseIcon()     { return <SvgIcon><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></SvgIcon>; }
function ClipboardIcon()     { return <SvgIcon><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></SvgIcon>; }
function BuildingIcon()      { return <SvgIcon><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></SvgIcon>; }
function CalendarIcon()      { return <SvgIcon><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></SvgIcon>; }
function BookIcon()          { return <SvgIcon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></SvgIcon>; }
function CompassIcon()       { return <SvgIcon><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></SvgIcon>; }
function UserIcon()          { return <SvgIcon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></SvgIcon>; }
function SettingsIcon()      { return <SvgIcon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></SvgIcon>; }
function SearchIcon()        { return <SvgIcon><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></SvgIcon>; }
function BellIcon()          { return <SvgIcon><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></SvgIcon>; }
function MailIcon()          { return <SvgIcon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></SvgIcon>; }
function ChevronDownIcon()   { return <SvgIcon size={14}><polyline points="6 9 12 15 18 9"/></SvgIcon>; }
function ChevronRightIcon()  { return <SvgIcon size={14}><polyline points="9 18 15 12 9 6"/></SvgIcon>; }
function FilterIcon()        { return <SvgIcon size={16}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></SvgIcon>; }
function TrophyIcon()        { return <SvgIcon size={20}><path d="M6 9H2V5h4M18 9h4V5h-4M6 9a6 6 0 0 0 12 0M9 17l3 4 3-4M12 15v2"/><path d="M6 9V5h12v4"/></SvgIcon>; }
function InfoIcon()          { return <SvgIcon size={15}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></SvgIcon>; }
function BookmarkIcon()      { return <SvgIcon size={16}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></SvgIcon>; }

// ── Componentes de apoyo ──────────────────────────────────────────────────────

/** Avatar circular con iniciales de empresa */
function CompanyAvatar({ initials, bg, size = 40 }) {
  return (
    <div
      style={{ backgroundColor: bg, width: size, height: size, minWidth: size }}
      className="rounded-full flex items-center justify-center text-white font-bold text-xs select-none"
    >
      {initials}
    </div>
  );
}

/** Dropdown de filtro (solo apariencia + estado) */
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-full px-4 py-1.5 hover:border-gray-400 transition-colors bg-white"
      >
        {value ? (options.find(o => (o.value ?? o) === value)?.label ?? value) : label}
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 min-w-[160px]">
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${value === val ? 'font-semibold text-[#C89600]' : 'text-gray-700'}`}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'inicio',        label: 'Inicio',           Icon: HomeIcon },
  { key: 'ofertas',       label: 'Ofertas',           Icon: BriefcaseIcon },
  { key: 'candidaturas',  label: 'Mis candidaturas',  Icon: ClipboardIcon },
  { key: 'empresas',      label: 'Empresas',          Icon: BuildingIcon },
  { key: 'eventos',       label: 'Eventos',           Icon: CalendarIcon },
  { key: 'recursos',      label: 'Recursos',          Icon: BookIcon },
  { key: 'orientacion',   label: 'Orientación',       Icon: CompassIcon },
  { key: 'perfil',        label: 'Mi perfil',         Icon: UserIcon },
  { key: 'ajustes',       label: 'Ajustes',           Icon: SettingsIcon },
];

function Sidebar({ activeSection, onSectionChange, onNavigate }) {
  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-gray-100">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #F0B400 0%, #C89600 100%)' }}
        >
          <svg viewBox="0 0 32 32" width="22" height="22" fill="white">
            <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm0 2c5.5 0 10 4.5 10 10S21.5 26 16 26 6 21.5 6 16 10.5 6 16 6zm-1 3v8H9l6 6 6-6h-6V9h-1z"/>
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-black font-extrabold text-sm tracking-wide uppercase">Comillas</p>
          <p className="text-gray-400 text-[10px] leading-tight">Universidad Pontificia</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = activeSection === key;
          const isHome = key === 'inicio';
          return (
            <button
              key={key}
              type="button"
              onClick={() => isHome ? onNavigate?.('home') : onSectionChange(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#F0B400] text-black font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Card "Completa tu perfil" */}
      <div className="mx-3 mb-4 rounded-xl bg-[#FFF8E0] border border-[#F0B400]/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#F0B400] flex items-center justify-center">
            <TrophyIcon />
          </div>
          <p className="text-xs font-bold text-gray-800 leading-tight">Completa tu perfil</p>
        </div>
        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">y mejora tus recomendaciones</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-[#F0B400] rounded-full" style={{ width: '80%' }} />
          </div>
          <span className="text-[11px] font-semibold text-gray-600">80%</span>
        </div>
        <button type="button" className="text-xs font-semibold text-[#C89600] hover:underline">
          Ver perfil →
        </button>
      </div>
    </aside>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ userName, userDegree }) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
      {/* Buscador */}
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Buscar empresas, posiciones o palabras clave"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#F0B400] focus:bg-white transition-colors"
        />
      </div>

      {/* Iconos de acción */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Campana */}
        <div className="relative">
          <button type="button" className="text-gray-500 hover:text-gray-800 transition-colors">
            <BellIcon />
          </button>
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">2</span>
        </div>

        {/* Correo */}
        <button type="button" className="text-gray-500 hover:text-gray-800 transition-colors">
          <MailIcon />
        </button>

        {/* Usuario */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold select-none">
            {userName?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'JP'}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-gray-800">{userName}</p>
            <p className="text-[10px] text-gray-400">{userDegree}</p>
          </div>
          <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
}

// ── Panel Mis Candidaturas ────────────────────────────────────────────────────
function CandidaturasPanel() {
  const enviadas    = MOCK_CANDIDATURAS.length;
  const revision    = MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length;
  const entrevista  = MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length;
  const aceptada    = MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">Mis candidaturas</h2>
        <button type="button" className="text-xs text-[#C89600] font-semibold hover:underline">
          Ver todas →
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 border-b border-gray-100">
        <StatCell count={enviadas}   label="Enviadas"   color="text-gray-600" />
        <StatCell count={revision}   label="En revisión" color="text-orange-500" />
        <StatCell count={entrevista} label="Entrevista"  color="text-blue-500" />
        <StatCell count={aceptada}   label="Aceptadas"  color="text-green-500" />
      </div>

      {/* Lista de candidaturas */}
      <div className="divide-y divide-gray-50">
        {MOCK_CANDIDATURAS.map(c => {
          const st = STATUS_CONFIG[c.status];
          return (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
              <CompanyAvatar initials={c.initials} bg={c.avatarBg} size={34} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{c.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.company} · {c.location} · {c.modality}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  <span className="text-[10px] text-gray-400">Aplicada el {c.date}</span>
                </div>
              </div>
              <ChevronRightIcon />
            </div>
          );
        })}
      </div>

      {/* Consejo para destacar */}
      <div className="mx-4 mb-4 mt-2 rounded-xl bg-[#FFF8E0] border border-[#F0B400]/30 p-3 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-[#F0B400] flex items-center justify-center shrink-0">
          <TrophyIcon />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800 mb-0.5">Consejo para destacar</p>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Completa tu perfil al 100% y añade tus proyectos para mejorar tus opciones.
          </p>
          <button type="button" className="text-[10px] font-semibold text-[#C89600] hover:underline mt-1 block">
            Ir a mi perfil →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({ count, label, color }) {
  return (
    <div className="flex flex-col items-center py-3 px-1">
      <span className={`text-xl font-extrabold ${color}`}>{count}</span>
      <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">{label}</span>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function OpePortalPage({
  onNavigate,
  onNavigateToEditor,
  userName = 'Jaime Puente Sánchez',
  userDegree = '4º ICAI',
}) {
  const firstName = userName.split(' ')[0];

  const [activeSection, setActiveSection] = useState('inicio');
  const [offers, setOffers]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Filtros
  const [filterSector,   setFilterSector]   = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterModality, setFilterModality] = useState('');

  // Carga de ofertas (prácticas por defecto, con filtros)
  useEffect(() => {
    setLoading(true);
    setError(null);
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

  function handleSelectOffer(offer) {
    setSelectedOffer(offer);
  }

  function handleBack() {
    setSelectedOffer(null);
  }

  // Vista de detalle de oferta (panel central)
  if (selectedOffer) {
    return (
      <div className="fixed inset-0 z-50 flex bg-gray-50">
        <Sidebar activeSection="ofertas" onSectionChange={setActiveSection} onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar userName={userName} userDegree={userDegree} />
          <div className="flex-1 overflow-y-auto">
            <OfferDetail offer={selectedOffer} onBack={handleBack} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} onNavigate={onNavigate} />

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <TopBar userName={userName} userDegree={userDegree} />

        {/* Contenido desplazable */}
        <main className="flex-1 overflow-y-auto">
          {/* Saludo */}
          <div className="px-8 pt-7 pb-4">
            <h1 className="text-2xl font-extrabold text-gray-900">
              ¡Hola, {firstName}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Descubre prácticas recomendadas para ti y sigue el estado de tus candidaturas.
            </p>
          </div>

          {/* Grid principal */}
          <div className="px-8 pb-8 flex gap-6 items-start">
            {/* ── Columna izquierda: Ofertas recomendadas ── */}
            <div className="flex-1 min-w-0">
              {/* Cabecera de sección */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-gray-900">Ofertas recomendadas para ti</h2>
                  <span className="text-gray-400"><InfoIcon /></span>
                </div>
                <button type="button" className="text-sm text-[#C89600] font-semibold hover:underline">
                  Ver todas las ofertas →
                </button>
              </div>

              {/* Barra de filtros */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <FilterDropdown
                  label="Área profesional"
                  options={SECTORES}
                  value={filterSector}
                  onChange={setFilterSector}
                />
                <FilterDropdown
                  label="Ubicación"
                  options={['Madrid', 'Barcelona', 'Remoto', 'Bilbao']}
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
                  className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:border-gray-400 transition-colors bg-white"
                >
                  <FilterIcon />
                  Más filtros
                </button>
              </div>

              {/* Estado de carga */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-24" />
                          <div className="h-5 bg-gray-200 rounded w-2/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && offers.length === 0 && (
                <p className="text-gray-400 text-sm py-8 text-center">
                  No hay ofertas disponibles con los filtros seleccionados.
                </p>
              )}

              {/* Tarjetas de oferta */}
              {!loading && !error && (
                <div className="space-y-4">
                  {offers.map((offer, idx) => (
                    <OfferListItem
                      key={offer.id}
                      offer={offer}
                      rank={idx}
                      onClick={() => handleSelectOffer(offer)}
                    />
                  ))}
                </div>
              )}

              {/* Ver más */}
              {!loading && !error && offers.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#C89600] hover:underline"
                  >
                    Ver más ofertas →
                  </button>
                </div>
              )}
            </div>

            {/* ── Columna derecha: Mis candidaturas ── */}
            <div className="w-80 shrink-0 sticky top-4">
              <CandidaturasPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
