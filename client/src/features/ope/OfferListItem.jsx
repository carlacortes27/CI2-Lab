// Colores de avatar por empresa (fallback por hash si no está en el mapa)
const COMPANY_COLORS = {
  'mckинsey': '#1A1A2E',
  'mckinsey': '#1A1A2E',
  'iberdrola': '#00A650',
  'deloitte': '#86BC25',
  'kpmg': '#00338D',
  'pwc': '#E0301E',
  'ey': '#FFE600',
  'accenture': '#A100FF',
  'santander': '#EC0000',
  'bbva': '#004481',
  'telefónica': '#019DF4',
  'telefonica': '#019DF4',
  'acciona': '#E30613',
  'repsol': '#F5CC00',
  'naturgy': '#FF6B00',
  'endesa': '#00A3E0',
  'cepsa': '#00A86B',
  'redexis': '#0099A8',
  'amazon': '#FF9900',
  'google': '#4285F4',
  'microsoft': '#00A4EF',
  'indra': '#003DA5',
  'capgemini': '#0070AD',
};

function getCompanyColor(company) {
  const key = (company || '').toLowerCase().split(' ')[0];
  if (COMPANY_COLORS[key]) return COMPANY_COLORS[key];
  // Fallback determinista por hash
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 40%)`;
}

function getCompanyInitials(company) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Calcula un "match score" sintético hasta que WS6 esté implementado */
function getMockMatchScore(offerId, rank) {
  // Los primeros resultados tienen mayor match; varía para evitar todos iguales
  const base = Math.max(78, 96 - rank * 5);
  const variation = (offerId.charCodeAt(offerId.length - 1) % 5) - 2;
  return Math.min(99, Math.max(72, base + variation));
}

function MatchBadge({ score }) {
  const color = score >= 90 ? '#16A34A' : score >= 80 ? '#C89600' : '#9CA3AF';
  return (
    <div className="flex flex-col items-center shrink-0">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
        MATCH
      </span>
      <span className="text-xl font-extrabold leading-tight" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ModalityIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };

export default function OfferListItem({ offer, rank = 0, onClick }) {
  const score      = getMockMatchScore(offer.id, rank);
  const isDestacada = score >= 90;
  const bg         = getCompanyColor(offer.company);
  const initials   = getCompanyInitials(offer.company);
  const tags       = offer.requirements?.hardSkills?.slice(0, 3) ?? [];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#F0B400]/50 transition-all p-5 group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar empresa */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 select-none"
          style={{ backgroundColor: bg }}
        >
          {initials}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Empresa + badge DESTACADA */}
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {offer.company}
            </p>
            {isDestacada && (
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                DESTACADA
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#C89600] transition-colors leading-snug mb-2">
            {offer.title}
          </h3>

          {/* Meta: localización · modalidad · duración */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
            <span className="flex items-center gap-1"><LocationIcon />{offer.location}</span>
            <span className="flex items-center gap-1"><ModalityIcon />{MODALITY_LABEL[offer.modality] ?? offer.modality}</span>
            {offer.duration && <span className="flex items-center gap-1"><ClockIcon />{offer.duration}</span>}
          </div>

          {/* Tags de habilidades */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] text-gray-600 bg-gray-100 rounded-full px-2.5 py-0.5 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Match + bookmark */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <MatchBadge score={score} />
          <button
            type="button"
            onClick={e => { e.stopPropagation(); /* TODO: guardar oferta */ }}
            className="text-gray-300 hover:text-[#F0B400] transition-colors"
          >
            <BookmarkIcon />
          </button>
        </div>
      </div>
    </button>
  );
}
