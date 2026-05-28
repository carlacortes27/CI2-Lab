import CompanyLogo from '../../components/ui/CompanyLogo.jsx';

// Tokens de diseño (deben coincidir con OpePortalPage)
const T = {
  white:      '#FFFFFF',
  orange:     '#F5A623',
  orangeBg:   '#FEF3E2',
  t1:         '#1A1A1A',
  t2:         '#6B7280',
  t3:         '#9CA3AF',
  border:     '#E5E7EB',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardRadius: 16,
};

// Colores de texto por empresa (para el logo cuadrado: texto sobre fondo blanco)
const BRAND_TEXT = {
  mckinsey:  '#1A1A2E', iberdrola: '#00A650', deloitte: '#86BC25',
  kpmg:      '#00338D', pwc:       '#E0301E', ey:       '#2E2E2E',
  accenture: '#A100FF', santander: '#EC0000', bbva:     '#004481',
  telefonica:'#019DF4', acciona:   '#E30613', repsol:   '#B8960A',
  naturgy:   '#FF6B00', endesa:    '#00A3E0', cepsa:    '#00A86B',
  redexis:   '#0099A8', amazon:    '#FF9900', google:   '#4285F4',
  microsoft: '#00A4EF', indra:     '#003DA5', capgemini:'#0070AD',
};

function getBrandColor(company) {
  if (!company) return '#374151';
  const words = company.toLowerCase().split(/\s+/);
  for (const w of words) if (BRAND_TEXT[w]) return BRAND_TEXT[w];
  // Fallback determinista
  let h = 0;
  for (let i = 0; i < company.length; i++) h = company.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},55%,35%)`;
}

function getInitials(company) {
  return (company ?? '').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

/** Match sintético hasta que WS6 implemente el motor real */
function mockScore(offerId, rank) {
  const base  = Math.max(78, 97 - rank * 5);
  const tweak = (offerId.charCodeAt(offerId.length - 1) % 5) - 2;
  return Math.min(99, Math.max(72, base + tweak));
}

// ── Iconos ────────────────────────────────────────────────────────────────────
function PinIco() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function MonIco() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}
function ClockIco() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function BookmarkIco() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };

// ── Componente ────────────────────────────────────────────────────────────────
export default function OfferListItem({ offer, rank = 0, onClick }) {
  const score       = mockScore(offer.id, rank);
  const isDestacada = score >= 90;
  const brandColor  = getBrandColor(offer.company);
  const initials    = getInitials(offer.company);
  const tags        = offer.requirements?.hardSkills?.slice(0, 3) ?? [];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        backgroundColor: T.white,
        borderRadius: T.cardRadius,
        boxShadow: T.cardShadow,
        padding: 24,
        border: `1px solid transparent`,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#F0D0A0';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = T.cardShadow;
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>

        {/*
          Logo empresa: CUADRADO 64×64, fondo blanco, borde 1px #E5E7EB, radius 12px.
          Iniciales de la empresa en color corporativo sobre fondo blanco.
          NO círculos de color.
        */}
        <CompanyLogo company={offer.company} size={64} />

        {/* Contenido central */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge DESTACADA — encima del título */}
          {isDestacada && (
            <div style={{ marginBottom: 8 }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 9999,
                backgroundColor: T.orangeBg,
                color: T.orange,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                DESTACADA
              </span>
            </div>
          )}

          {/* Título */}
          <p style={{ fontSize: 16, fontWeight: 600, color: T.t1, lineHeight: 1.4, margin: 0, marginBottom: 4 }}>
            {offer.title}
          </p>

          {/* Empresa */}
          <p style={{ fontSize: 13, fontWeight: 400, color: T.t2, marginBottom: 10 }}>
            {offer.company}
          </p>

          {/* Meta: ubicación · modalidad · duración */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.t3 }}>
              <PinIco />{offer.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.t3 }}>
              <MonIco />{MODALITY_LABEL[offer.modality] ?? offer.modality}
            </span>
            {offer.duration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.t3 }}>
                <ClockIco />{offer.duration}
              </span>
            )}
          </div>

          {/* Tags de habilidades */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: '#F3F4F6',
                  color: T.t2,
                  fontSize: 12,
                  fontWeight: 400,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/*
          MATCH + Bookmark (derecha).
          MATCH siempre naranja #F5A623 — nunca verde ni gris.
        */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Bloque MATCH */}
          <div style={{
            backgroundColor: T.orangeBg,
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            minWidth: 72,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: T.t3,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              MATCH
            </span>
            <span style={{
              fontSize: 24, fontWeight: 700, color: T.orange, lineHeight: 1.2,
            }}>
              {score}%
            </span>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); }}
            title="Guardar oferta"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.t3 }}
            onMouseEnter={e => e.currentTarget.style.color = T.orange}
            onMouseLeave={e => e.currentTarget.style.color = T.t3}
          >
            <BookmarkIco />
          </button>
        </div>

      </div>
    </button>
  );
}
