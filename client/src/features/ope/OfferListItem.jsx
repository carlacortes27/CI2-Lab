// ── Colores de marca por empresa ─────────────────────────────────────────────
const BRAND_COLORS = {
  mckinsey:  { bg: '#1A1A2E', text: '#fff' },
  iberdrola: { bg: '#00A650', text: '#fff' },
  deloitte:  { bg: '#86BC25', text: '#fff' },
  kpmg:      { bg: '#00338D', text: '#fff' },
  pwc:       { bg: '#E0301E', text: '#fff' },
  ey:        { bg: '#2E2E2E', text: '#FFE600' },
  accenture: { bg: '#A100FF', text: '#fff' },
  santander: { bg: '#EC0000', text: '#fff' },
  bbva:      { bg: '#004481', text: '#fff' },
  telefonica:{ bg: '#019DF4', text: '#fff' },
  acciona:   { bg: '#E30613', text: '#fff' },
  repsol:    { bg: '#F5CC00', text: '#1F2937' },
  naturgy:   { bg: '#FF6B00', text: '#fff' },
  endesa:    { bg: '#00A3E0', text: '#fff' },
  cepsa:     { bg: '#00A86B', text: '#fff' },
  redexis:   { bg: '#0099A8', text: '#fff' },
  amazon:    { bg: '#FF9900', text: '#1F2937' },
  google:    { bg: '#4285F4', text: '#fff' },
  microsoft: { bg: '#00A4EF', text: '#fff' },
  indra:     { bg: '#003DA5', text: '#fff' },
  capgemini: { bg: '#0070AD', text: '#fff' },
};

function getBrand(company) {
  if (!company) return { bg: '#6B7280', text: '#fff' };
  const words = company.toLowerCase().split(/\s+/);
  for (const w of words) if (BRAND_COLORS[w]) return BRAND_COLORS[w];
  // Fallback determinista por hash
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  return { bg: `hsl(${Math.abs(hash) % 360},50%,38%)`, text: '#fff' };
}

function getInitials(company) {
  return (company ?? '').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

/** Match score sintético (WS6 lo reemplazará con el valor real) */
function mockScore(offerId, rank) {
  const base  = Math.max(78, 97 - rank * 5);
  const tweak = (offerId.charCodeAt(offerId.length - 1) % 5) - 2;
  return Math.min(99, Math.max(72, base + tweak));
}

// ── Íconos mínimos ────────────────────────────────────────────────────────────
function PinIco() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function MonitorIco() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function ClockIco() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function BookmarkIco() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };

// ── Componente principal ──────────────────────────────────────────────────────
export default function OfferListItem({ offer, rank = 0, onClick }) {
  const score       = mockScore(offer.id, rank);
  const isDestacada = score >= 90;
  const brand       = getBrand(offer.company);
  const initials    = getInitials(offer.company);
  const tags        = offer.requirements?.hardSkills?.slice(0, 3) ?? [];

  // Color del match según rango (per guía: naranja/ámbar corporativo)
  const matchColor = score >= 90 ? '#16A34A' : score >= 80 ? '#C89600' : '#9CA3AF';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-gray-100 bg-white hover:border-[#F1B816]/60 hover:shadow-md shadow-sm transition-all group"
      style={{ padding: '16px 20px' }}
    >
      <div className="flex items-start gap-4">

        {/* Logo empresa */}
        <div
          className="rounded-xl flex items-center justify-center select-none shrink-0 shadow-sm"
          style={{
            backgroundColor: brand.bg,
            color: brand.text,
            width: 44,
            height: 44,
            minWidth: 44,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {initials}
        </div>

        {/* Contenido central */}
        <div className="flex-1 min-w-0">

          {/* Empresa + badge DESTACADA */}
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {offer.company}
            </span>
            {isDestacada && (
              <span
                className="border border-orange-200 rounded-full px-2 py-px"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#EA580C',
                  backgroundColor: '#FFF7ED',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                DESTACADA
              </span>
            )}
          </div>

          {/* Título de la oferta */}
          <p
            className="group-hover:text-[#C89600] transition-colors"
            style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginBottom: 8 }}
          >
            {offer.title}
          </p>

          {/* Meta: ubicación · modalidad · duración */}
          <div className="flex items-center gap-4 mb-3" style={{ fontSize: 13, fontWeight: 400, color: '#6B7280' }}>
            <span className="flex items-center gap-1"><PinIco />{offer.location}</span>
            <span className="flex items-center gap-1"><MonitorIco />{MODALITY_LABEL[offer.modality] ?? offer.modality}</span>
            {offer.duration && <span className="flex items-center gap-1"><ClockIco />{offer.duration}</span>}
          </div>

          {/* Tags de habilidades */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1"
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: '#374151',
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Match score + bookmark */}
        <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
          {/* MATCH */}
          <div className="flex flex-col items-center">
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: matchColor,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              MATCH
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: matchColor,
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              {score}%
            </span>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); }}
            className="text-gray-300 hover:text-[#F1B816] transition-colors"
            title="Guardar oferta"
          >
            <BookmarkIco />
          </button>
        </div>

      </div>
    </button>
  );
}
