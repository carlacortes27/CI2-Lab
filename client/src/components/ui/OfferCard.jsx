/**
 * OfferCard.jsx — Tarjeta de oferta de prácticas/empleo
 *
 * Reemplaza a OfferListItem. Implementa el diseño spec § 2.9:
 *  CompanyLogo | badge DESTACADA | título | empresa | metadatos | tags | MATCH | bookmark
 */
import { T } from '../../styles/theme.js';
import CompanyLogo    from './CompanyLogo.jsx';
import Badge          from './Badge.jsx';
import { PinIcon, MonitorIcon, ClockIcon, BookmarkIcon } from './Icons.jsx';

const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };

/** Score sintético hasta que WS6 implemente el motor real */
function mockScore(offerId, rank) {
  const base  = Math.max(78, 97 - rank * 5);
  const tweak = (offerId.charCodeAt(offerId.length - 1) % 5) - 2;
  return Math.min(99, Math.max(72, base + tweak));
}

export default function OfferCard({ offer, rank = 0, onClick }) {
  const score       = mockScore(offer.id, rank);
  const isDestacada = score >= 90;
  const tags        = offer.requirements?.hardSkills?.slice(0, 3) ?? [];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display:         'block',
        width:           '100%',
        textAlign:       'left',
        backgroundColor: T.white,
        borderRadius:    T.radiusCard,
        boxShadow:       T.shadowCard,
        padding:         24,
        border:          '1px solid transparent',
        cursor:          'pointer',
        transition:      'box-shadow 0.15s, border-color 0.15s',
        fontFamily:      T.font,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow    = T.shadowElevated;
        e.currentTarget.style.borderColor  = '#F0D0A0';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow    = T.shadowCard;
        e.currentTarget.style.borderColor  = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>

        {/* Logo empresa */}
        <CompanyLogo company={offer.company} size={64} />

        {/* Contenido central */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge DESTACADA */}
          {isDestacada && (
            <div style={{ marginBottom: 8 }}>
              <Badge label="DESTACADA" variant="decorative" />
            </div>
          )}

          {/* Título */}
          <p style={{ fontSize: 16, fontWeight: 600, color: T.t1, lineHeight: 1.4, margin: 0, marginBottom: 4 }}>
            {offer.title}
          </p>

          {/* Empresa */}
          <p style={{ fontSize: 13, color: T.t2, marginBottom: 10 }}>
            {offer.company}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.t3 }}>
              <PinIcon size={12} />{offer.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.t3 }}>
              <MonitorIcon size={12} />{MODALITY_LABEL[offer.modality] ?? offer.modality}
            </span>
            {offer.duration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.t3 }}>
                <ClockIcon size={12} />{offer.duration}
              </span>
            )}
          </div>

          {/* Tags de habilidades */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  padding:         '4px 10px',
                  borderRadius:    T.radiusPill,
                  backgroundColor: T.hoverBg,
                  color:           T.t2,
                  fontSize:        12,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* MATCH + Bookmark (derecha) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Bloque MATCH */}
          <div style={{
            backgroundColor: T.orangeBg,
            borderRadius:    T.radiusInput,
            padding:         '12px 14px',
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            gap:             2,
            minWidth:        72,
          }}>
            <span style={{
              fontSize:      10,
              fontWeight:    700,
              color:         T.t3,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              lineHeight:    1,
            }}>
              MATCH
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, color: T.orange, lineHeight: 1.2 }}>
              {score}%
            </span>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={e => e.stopPropagation()}
            title="Guardar oferta"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.t3 }}
            onMouseEnter={e => e.currentTarget.style.color = T.orange}
            onMouseLeave={e => e.currentTarget.style.color = T.t3}
          >
            <BookmarkIcon size={18} />
          </button>
        </div>

      </div>
    </button>
  );
}