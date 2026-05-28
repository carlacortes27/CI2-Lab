import { T } from '../../styles/theme.js';
import Button from './Button.jsx';
import CompanyLogo from './CompanyLogo.jsx';
import { PinIcon, MonitorIcon, ClockIcon } from './Icons.jsx';

const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };

const SECTOR_STYLES = {
  'Consultoría': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Finanzas':    { bg: '#DBEAFE', color: '#1D4ED8' },
  'Energía':     { bg: '#DCFCE7', color: '#15803D' },
  'Industrial':  { bg: '#DCFCE7', color: '#15803D' },
  'Tecnología':  { bg: '#F3E8FF', color: '#7E22CE' },
  'Legal':       { bg: '#F3E8FF', color: '#7E22CE' },
};

function sectorStyle(sector) {
  return SECTOR_STYLES[sector] ?? { bg: T.orangeBg, color: '#B45309' };
}

function mockScore(offerId, rank) {
  const base  = Math.max(78, 97 - rank * 5);
  const tweak = (offerId.charCodeAt(offerId.length - 1) % 5) - 2;
  return Math.min(99, Math.max(72, base + tweak));
}

export default function OfferCard({ offer, rank = 0, onClick }) {
  const score       = mockScore(offer.id, rank);
  const isDestacada = score >= 90;
  const tags        = offer.requirements?.hardSkills?.slice(0, 3) ?? [];
  const sector      = offer.sector || 'Prácticas';
  const badgeStyle  = sectorStyle(sector);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor:     T.white,
        borderRadius:        T.radiusCard,
        boxShadow:           T.shadowCard,
        border:              `1px solid ${T.border}`,
        padding:             14,
        display:             'grid',
        gridTemplateColumns: '58px 1fr auto',
        gap:                 14,
        alignItems:          'start',
        cursor:              'pointer',
        transition:          'box-shadow 0.15s, transform 0.15s',
        fontFamily:          T.font,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = T.shadowElevated;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = T.shadowCard;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Bloque empresa */}
      <CompanyLogo
        company={offer.company}
        size={58}
        style={{ height: 64 }}
      />

      {/* Contenido central */}
      <div style={{ minWidth: 0 }}>
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            padding:         '3px 10px',
            borderRadius:    T.radiusPill,
            backgroundColor: badgeStyle.bg,
            color:           badgeStyle.color,
            fontSize:        11,
            fontWeight:      700,
            fontFamily:      T.font,
          }}>
            {sector}
          </span>
          {isDestacada && (
            <span style={{
              padding:         '3px 10px',
              borderRadius:    T.radiusPill,
              backgroundColor: T.orangeBg,
              color:           '#B45309',
              fontSize:        11,
              fontWeight:      700,
              fontFamily:      T.font,
            }}>
              Destacada
            </span>
          )}
        </div>

        {/* Título */}
        <p style={{ fontSize: 15, fontWeight: 600, color: T.t1, lineHeight: 1.35, margin: 0, fontFamily: T.font }}>
          {offer.title}
        </p>

        {/* Empresa */}
        <p style={{ fontSize: 12, color: T.t2, marginTop: 4, marginBottom: 0, fontFamily: T.font }}>
          {offer.company}
        </p>

        {/* Metadatos */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, color: T.t2, fontSize: 12, fontFamily: T.font }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <PinIcon size={12} color={T.t3} />{offer.location}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <MonitorIcon size={12} color={T.t3} />{MODALITY_LABEL[offer.modality] ?? offer.modality}
          </span>
          {offer.duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ClockIcon size={12} color={T.t3} />{offer.duration}
            </span>
          )}
        </div>

        {/* Match % + tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <span style={{
            padding:         '4px 8px',
            borderRadius:    T.radiusPill,
            backgroundColor: T.orangeBg,
            color:           T.orange,
            fontSize:        11,
            fontWeight:      700,
            fontFamily:      T.font,
          }}>
            {score}% match
          </span>
          {tags.map(tag => (
            <span key={tag} style={{
              padding:         '4px 8px',
              borderRadius:    T.radiusPill,
              backgroundColor: T.hoverBg,
              color:           T.t2,
              fontSize:        11,
              fontFamily:      T.font,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Acción derecha */}
      <Button
        variant="secondary"
        onClick={e => { e.stopPropagation(); onClick?.(); }}
        style={{ alignSelf: 'center', padding: '8px 16px', fontSize: 12 }}
      >
        Ver oferta
      </Button>
    </div>
  );
}
