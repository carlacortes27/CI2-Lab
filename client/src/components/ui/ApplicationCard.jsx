/**
 * ApplicationCard.jsx — Tarjeta de candidatura (Mis candidaturas)
 *
 * Spec § 2.10:
 *  Logo empresa (recuadro blanco) · título (2 líneas, NO truncar) ·
 *  empresa · metadatos · fecha · StatusBadge · chevron
 */
import { T, brandColor, initials } from '../../styles/theme.js';
import Badge          from './Badge.jsx';
import CompanyLogo    from './CompanyLogo.jsx';
import { PinIcon, MonitorIcon, ChevronRightIcon } from './Icons.jsx';

export default function ApplicationCard({ candidatura, onClick, isLast = false }) {
  const {
    title, company, location, modality, status, date,
    logoSrc,
  } = candidatura;

  const statusCfg = T.status[status] ?? { label: status, bg: T.hoverBg, color: T.t2 };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display:         'flex',
        alignItems:      'flex-start',
        gap:             12,
        padding:         '14px 20px',
        width:           '100%',
        textAlign:       'left',
        background:      'none',
        border:          'none',
        borderBottom:    isLast ? 'none' : `1px solid ${T.border}`,
        cursor:          'pointer',
        fontFamily:      T.font,
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Logo empresa — recuadro blanco 38×38 */}
      <CompanyLogo company={company} src={logoSrc} size={38} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Fila: título + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          {/* Título: permite 2 líneas, NO truncar */}
          <span style={{
            fontSize:   13,
            fontWeight: 600,
            color:      T.t1,
            lineHeight: 1.4,
            whiteSpace: 'normal',
          }}>
            {title}
          </span>
          <Badge label={statusCfg.label} variant="status" status={status} />
        </div>

        {/* Empresa */}
        <p style={{ fontSize: 12, color: T.t2, marginTop: 3 }}>{company}</p>

        {/* Metadatos */}
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
        </p>

        {/* Fecha + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: T.t3 }}>Aplicada el {date}</span>
          <ChevronRightIcon size={13} color={T.t3} />
        </div>
      </div>
    </button>
  );
}