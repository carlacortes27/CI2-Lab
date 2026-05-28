import { T } from '../../styles/theme.js';

// ── Helpers de fecha (duplicados locales de OpePortalPage) ────────────────────
function eventDateTime(event) {
  return new Date(`${event.date}T${event.startTime || '00:00'}`);
}

function formatEventDate(event) {
  const date = eventDateTime(event);
  return {
    day:     new Intl.DateTimeFormat('es-ES', { day: '2-digit' }).format(date),
    month:   new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '').toUpperCase(),
    weekday: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date),
    full:    new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date),
  };
}

function formatEventTime(event) {
  if (!event.endTime) return event.startTime;
  return `${event.startTime} – ${event.endTime}`;
}

function getEventCategory(event) {
  const text = [event.title, event.organizer, ...(event.tags || [])].join(' ').toLowerCase();
  if (text.includes('networking') || text.includes('alumni') || text.includes('feria')) return 'Networking';
  if (text.includes('orientación') || text.includes('cv') || text.includes('entrevista') || text.includes('linkedin')) return 'Orientación';
  if (event.company || text.includes('empresa') || text.includes('graduate')) return 'Empresa';
  return 'Fecha importante';
}

function eventCategoryStyle(category) {
  const styles = {
    Networking:        { bg: '#DBEAFE', color: '#1D4ED8' },
    Orientación:       { bg: '#DCFCE7', color: '#15803D' },
    Empresa:           { bg: '#F3E8FF', color: '#7E22CE' },
    'Fecha importante':{ bg: T.orangeBg, color: '#B45309' },
  };
  return styles[category] || styles['Fecha importante'];
}

// ── Icono SVG mínimo ──────────────────────────────────────────────────────────
function Ico({ children, size = 16, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const ArrowLeft  = () => <Ico size={14} color={T.t3}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Ico>;
const ClockIco   = ({ size = 14 }) => <Ico size={size} color={T.t3}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>;
const PinIco     = ({ size = 14 }) => <Ico size={size} color={T.t3}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>;
const MonIco     = ({ size = 14 }) => <Ico size={size} color={T.t3}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Ico>;
const CalIco     = ({ size = 14 }) => <Ico size={size} color={T.t3}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>;
const UserIco    = ({ size = 14 }) => <Ico size={size} color={T.t3}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;
const TagIco     = ({ size = 14 }) => <Ico size={size} color={T.orange}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Ico>;
const InfoIco    = ({ size = 14 }) => <Ico size={size} color={T.orange}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ico>;

const card = {
  backgroundColor: T.white,
  borderRadius:    T.radiusCard,
  boxShadow:       T.shadowCard,
};

// ── Subcomponentes ────────────────────────────────────────────────────────────
function MetaPill({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: T.t2, fontSize: 13, fontFamily: T.font }}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

function MetaSep() {
  return <span style={{ color: T.border, fontSize: 16, userSelect: 'none' }}>|</span>;
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingBottom: 16, borderBottom: `1px solid ${T.border}`, marginBottom: 16,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        backgroundColor: T.orangeBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0, fontFamily: T.font }}>
        {title}
      </h2>
    </div>
  );
}

// ── Mapa de estados de inscripción ────────────────────────────────────────────
const STATUS_CONFIG = {
  'Abierta':       { label: 'Inscribirme',    disabled: false, bg: T.orange,    color: T.white   },
  'Próximamente':  { label: 'Próximamente',   disabled: true,  bg: T.hoverBg,   color: T.t3      },
  'Completo':      { label: 'Completo',        disabled: true,  bg: '#FEE2E2',   color: '#B91C1C' },
  'Cerrada':       { label: 'Inscripción cerrada', disabled: true, bg: T.hoverBg, color: T.t3    },
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function EventDetail({ event, onBack }) {
  const date     = formatEventDate(event);
  const category = getEventCategory(event);
  const catStyle = eventCategoryStyle(category);
  const status   = STATUS_CONFIG[event.registrationStatus] ?? STATUS_CONFIG['Cerrada'];

  return (
    <div style={{ padding: '28px 40px', backgroundColor: T.bg, minHeight: '100%' }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: T.t3, margin: 0, fontFamily: T.font }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={onBack}
            onMouseEnter={e => { e.target.style.color = T.orange; }}
            onMouseLeave={e => { e.target.style.color = T.t3; }}>
            Inicio
          </span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={onBack}
            onMouseEnter={e => { e.target.style.color = T.orange; }}
            onMouseLeave={e => { e.target.style.color = T.t3; }}>
            Eventos
          </span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: T.t1, fontWeight: 500 }}>{event.title}</span>
        </p>
      </nav>

      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 500, color: T.t2,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px 0', marginBottom: 20, fontFamily: T.font,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = T.t1; }}
        onMouseLeave={e => { e.currentTarget.style.color = T.t2; }}
      >
        <ArrowLeft />
        Volver a eventos
      </button>

      {/* ── Cabecera del evento ─────────────────────────────────────────── */}
      <div style={{ ...card, padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>

          {/* Bloque de fecha */}
          <div style={{
            width: 86, minHeight: 96,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusInput,
            backgroundColor: T.orangeBg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 34, fontWeight: 700, color: T.t1, lineHeight: 1, fontFamily: T.font }}>{date.day}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.orange, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6, fontFamily: T.font }}>{date.month}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: T.t3, marginTop: 4, textTransform: 'capitalize', fontFamily: T.font }}>{date.weekday}</span>
          </div>

          {/* Título y metadatos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                padding: '4px 12px', borderRadius: T.radiusPill,
                backgroundColor: catStyle.bg, color: catStyle.color,
                fontSize: 12, fontWeight: 700, fontFamily: T.font,
              }}>
                {category}
              </span>
              {event.registrationStatus && (
                <span style={{
                  padding: '4px 12px', borderRadius: T.radiusPill,
                  backgroundColor: status.bg, color: status.color,
                  fontSize: 12, fontWeight: 600, fontFamily: T.font,
                }}>
                  {event.registrationStatus}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.t1, margin: '0 0 16px 0', lineHeight: 1.25, fontFamily: T.font }}>
              {event.title}
            </h1>

            {/* Meta-pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <MetaPill icon={<UserIco />}  text={event.organizer} />
              <MetaSep />
              <MetaPill icon={<CalIco />}   text={date.full} />
              <MetaSep />
              <MetaPill icon={<ClockIco />} text={formatEventTime(event)} />
              <MetaSep />
              <MetaPill icon={<PinIco />}   text={event.location} />
              <MetaSep />
              <MetaPill icon={<MonIco />}   text={event.modality} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Descripción + Etiquetas ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* Descripción */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <SectionHeader icon={<InfoIco />} title="Descripción del evento" />
          <p style={{ fontSize: 14, color: T.t2, lineHeight: 1.75, margin: 0, fontFamily: T.font }}>
            {event.description}
          </p>
        </div>

        {/* Etiquetas */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <SectionHeader icon={<TagIco />} title="Áreas y temáticas" />
          {event.tags?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {event.tags.map(tag => (
                <span key={tag} style={{
                  padding: '7px 16px', borderRadius: T.radiusPill,
                  backgroundColor: T.hoverBg, color: T.t2,
                  fontSize: 13, fontWeight: 500, fontFamily: T.font,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: T.t3, fontFamily: T.font }}>Sin etiquetas.</p>
          )}

          {event.company && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.t1, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: T.font }}>
                Organiza
              </p>
              <p style={{ fontSize: 14, color: T.t2, margin: 0, fontFamily: T.font }}>
                {event.company}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Botón de inscripción ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          disabled={status.disabled}
          style={{
            padding: '14px 36px',
            borderRadius: T.radiusPill,
            backgroundColor: status.bg,
            color: status.color,
            fontSize: 15, fontWeight: 700,
            border: 'none',
            cursor: status.disabled ? 'not-allowed' : 'pointer',
            opacity: status.disabled ? 0.75 : 1,
            transition: 'background-color 0.15s, transform 0.1s',
            boxShadow: status.disabled ? 'none' : `0 2px 8px rgba(245,166,35,0.35)`,
            fontFamily: T.font,
          }}
          onMouseEnter={e => { if (!status.disabled) e.currentTarget.style.backgroundColor = '#D4880A'; }}
          onMouseLeave={e => { if (!status.disabled) e.currentTarget.style.backgroundColor = T.orange; }}
          onMouseDown={e =>  { if (!status.disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e =>    { if (!status.disabled) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {status.label}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{
            padding: '14px 28px',
            borderRadius: T.radiusPill,
            backgroundColor: 'transparent',
            color: T.t2, fontSize: 15, fontWeight: 500,
            border: `1px solid ${T.border}`,
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
            fontFamily: T.font,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.t2; e.currentTarget.style.color = T.t1; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.t2; }}
        >
          Volver a eventos
        </button>
      </div>

    </div>
  );
}
