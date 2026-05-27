// ── Colores de marca por empresa ─────────────────────────────────────────────
const BRAND_COLORS = {
  'mckinsey':   { bg: '#1A1A2E', text: '#fff' },
  'iberdrola':  { bg: '#00A650', text: '#fff' },
  'deloitte':   { bg: '#86BC25', text: '#fff' },
  'kpmg':       { bg: '#00338D', text: '#fff' },
  'pwc':        { bg: '#E0301E', text: '#fff' },
  'ey':         { bg: '#2E2E2E', text: '#FFE600' },
  'accenture':  { bg: '#A100FF', text: '#fff' },
  'santander':  { bg: '#EC0000', text: '#fff' },
  'bbva':       { bg: '#004481', text: '#fff' },
  'telefonica': { bg: '#019DF4', text: '#fff' },
  'acciona':    { bg: '#E30613', text: '#fff' },
  'repsol':     { bg: '#F5CC00', text: '#1F2937' },
  'naturgy':    { bg: '#FF6B00', text: '#fff' },
  'endesa':     { bg: '#00A3E0', text: '#fff' },
  'cepsa':      { bg: '#00A86B', text: '#fff' },
  'redexis':    { bg: '#0099A8', text: '#fff' },
  'amazon':     { bg: '#FF9900', text: '#1F2937' },
  'google':     { bg: '#4285F4', text: '#fff' },
  'microsoft':  { bg: '#00A4EF', text: '#fff' },
  'indra':      { bg: '#003DA5', text: '#fff' },
  'capgemini':  { bg: '#0070AD', text: '#fff' },
};

function getBrand(company) {
  if (!company) return { bg: '#6B7280', text: '#fff' };
  const words = company.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (BRAND_COLORS[w]) return BRAND_COLORS[w];
  }
  // Fallback determinista
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return { bg: `hsl(${hue},50%,40%)`, text: '#fff' };
}

function getInitials(company) {
  return (company ?? '')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Match score sintético hasta que WS6 implemente el motor real */
function mockScore(offerId, rank) {
  const base = Math.max(78, 97 - rank * 5);
  const tweak = (offerId.charCodeAt(offerId.length - 1) % 5) - 2;
  return Math.min(99, Math.max(72, base + tweak));
}

// ── Iconos ────────────────────────────────────────────────────────────────────
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

function BookmarkIco({ filled = false }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  /* Color del match según rango */
  const matchColor = score >= 90
    ? { label: '#16A34A', value: '#16A34A' }
    : score >= 80
    ? { label: '#C89600', value: '#C89600' }
    : { label: '#9CA3AF', value: '#9CA3AF' };

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-gray-100 bg-white hover:border-[#F1B816]/60 hover:shadow-md shadow-sm transition-all p-4 group"
    >
      <div className="flex items-start gap-4">

        {/* Logo empresa */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xs select-none shrink-0 shadow-sm"
          style={{ backgroundColor: brand.bg, color: brand.text }}
        >
          {initials}
        </div>

        {/* Cuerpo */}
        <div className="flex-1 min-w-0">
          {/* Empresa + DESTACADA */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {offer.company}
            </span>
            {isDestacada && (
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full leading-none">
                DESTACADA
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="text-sm font-bold text-[#1F2937] group-hover:text-[#C89600] transition-colors leading-snug mb-2">
            {offer.title}
          </h3>

          {/* Meta: ubicación · modalidad · duración */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2.5">
            <span className="flex items-center gap-1">
              <PinIco />
              {offer.location}
            </span>
            <span className="flex items-center gap-1">
              <MonitorIco />
              {MODALITY_LABEL[offer.modality] ?? offer.modality}
            </span>
            {offer.duration && (
              <span className="flex items-center gap-1">
                <ClockIco />
                {offer.duration}
              </span>
            )}
          </div>

          {/* Tags de habilidades */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Match + bookmark */}
        <div className="flex flex-col items-end justify-between gap-3 shrink-0 self-stretch">
          {/* Match score */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: matchColor.label }}>
              MATCH
            </span>
            <span className="text-2xl font-extrabold leading-none" style={{ color: matchColor.value }}>
              {score}%
            </span>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); /* TODO: guardar oferta */ }}
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
