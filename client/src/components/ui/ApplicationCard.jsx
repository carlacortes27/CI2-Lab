import { T } from '../../styles/theme.js';
import Badge       from './Badge.jsx';
import CompanyLogo from './CompanyLogo.jsx';
import { PinIcon, MonitorIcon } from './Icons.jsx';

// ── Timeline ──────────────────────────────────────────────────────────────────
const STEP_LABELS  = ['Inscrito', 'CV revisado', 'Entrevista', 'Oferta final', 'Finalizado'];
const STEP_INDEX   = { guardada: 0, enviada: 0, revision: 1, entrevista: 2, aceptada: 3, finalizada: 4, rechazada: 4 };
const ACTIVE_COLOR = {
  guardada: '#6B7280', enviada: '#6B7280',
  revision: '#F5A623', entrevista: '#2563EB',
  aceptada: '#16A34A', finalizada: '#0369A1', rechazada: '#DC2626',
};
const DONE_COLOR = '#374151';

function StatusTimeline({ status }) {
  const activeIdx   = STEP_INDEX[status] ?? 0;
  const activeColor = ACTIVE_COLOR[status] ?? '#6B7280';

  return (
    <div style={{ display: 'flex', marginTop: 14 }}>
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < activeIdx;
        const isActive    = i === activeIdx;
        const isLast      = i === STEP_LABELS.length - 1;
        const nodeColor   = isCompleted ? DONE_COLOR : isActive ? activeColor : 'transparent';
        const nodeBorder  = (isCompleted || isActive) ? 'none' : `2px solid ${T.border}`;
        const lineColor   = isCompleted ? DONE_COLOR : T.border;

        return (
          <div
            key={label}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
          >
            {/* Connector line to next step */}
            {!isLast && (
              <div style={{
                position: 'absolute', top: 6,
                left: '50%', right: '-50%',
                height: 2, backgroundColor: lineColor, zIndex: 0,
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: nodeColor, border: nodeBorder,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 1, flexShrink: 0,
            }}>
              {isCompleted && (
                <span style={{ color: T.white, fontSize: 8, fontWeight: 700, lineHeight: 1 }}>✓</span>
              )}
              {isActive && status === 'rechazada' && (
                <span style={{ color: T.white, fontSize: 10, fontWeight: 700, lineHeight: 1 }}>×</span>
              )}
            </div>
            {/* Label */}
            <span style={{
              fontSize: 9, marginTop: 3, textAlign: 'center',
              fontFamily: T.font, lineHeight: 1.2,
              color:      isActive ? activeColor : T.t3,
              fontWeight: isActive ? 600 : 400,
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Action button helper ───────────────────────────────────────────────────────
function ActionBtn({ label, variant, onClick }) {
  const base = {
    padding: '6px 12px', borderRadius: T.radiusPill,
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: T.font, whiteSpace: 'nowrap',
  };
  const styles = {
    primary: { ...base, backgroundColor: T.orange,  color: T.white,    border: 'none' },
    outline:  { ...base, backgroundColor: T.white,   color: T.t2,       border: `1px solid ${T.border}` },
    danger:   { ...base, backgroundColor: T.white,   color: '#DC2626',  border: '1px solid #FECACA' },
  };

  return (
    <button
      type="button"
      style={styles[variant] ?? styles.outline}
      onClick={e => { e.stopPropagation(); onClick?.(); }}
    >
      {label}
    </button>
  );
}

function formatApplicationDate(value) {
  if (!value) return '';
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateValue);
}

// ── ApplicationCard ────────────────────────────────────────────────────────────
export default function ApplicationCard({ candidatura, onClick, onAction, isLast = false }) {
  const { title, company, location, modality, status, date, logoSrc } = candidatura;
  const statusCfg = T.status[status] ?? { label: status, bg: T.hoverBg, color: T.t2 };
  const appliedDate = formatApplicationDate(date);

  // Contextual action buttons per status
  let primary;
  let secondary;
  if (status === 'guardada') {
    primary = { label: 'Ver detalles', variant: 'outline' };
  } else if (status === 'entrevista') {
    primary   = { label: 'Preparar entrevista', variant: 'primary' };
    secondary = { label: 'Ver detalles',        variant: 'outline' };
  } else {
    primary = { label: 'Ver detalles', variant: 'outline' };
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${T.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s',
        fontFamily: T.font,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.backgroundColor = 'transparent'; }}
      onClick={onClick}
    >
      {/* Logo */}
      <CompanyLogo company={company} src={logoSrc} size={44} />

      {/* Centro: texto + timeline */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.t1, lineHeight: 1.4 }}>
          {title}
        </span>
        <p style={{ fontSize: 12, color: T.t2, marginTop: 2 }}>{company}</p>
        <p style={{ fontSize: 11, color: T.t3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
          {location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <PinIcon size={10} />{location}
            </span>
          )}
          {modality && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MonitorIcon size={10} />{modality}
            </span>
          )}
          {appliedDate && <span>Aplicada el {appliedDate}</span>}
        </p>
        <StatusTimeline status={status} />
      </div>

      {/* Derecha: badge + botones + 3 puntos */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, minWidth: 150 }}
        onClick={e => e.stopPropagation()}
      >
        <Badge label={statusCfg.label} variant="status" status={status} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {secondary && (
            <ActionBtn label={secondary.label} variant={secondary.variant} onClick={onClick} />
          )}
          {primary && (
            <ActionBtn label={primary.label} variant={primary.variant} onClick={onAction ?? onClick} />
          )}
          <button
            type="button"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.t3, fontSize: 18, lineHeight: 1, padding: '0 4px',
            }}
          >
            ⋮
          </button>
        </div>
      </div>
    </div>
  );
}
