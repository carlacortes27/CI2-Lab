function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return d ? `${d}/${m}/${y}` : `${m}/${y}`;
}

export default function OfferListItem({ offer, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border-b border-gray-200 py-4 px-2 hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {offer.company && (
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">
              {offer.company}
            </p>
          )}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#F0B400] transition-colors leading-snug">
            {offer.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 text-gray-500 text-sm">
          <span className="flex items-center gap-1.5">
            <CalendarIcon />
            {formatDate(offer.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <PinIcon />
            {offer.location}
          </span>
        </div>
      </div>
    </button>
  );
}
