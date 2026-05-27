function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return d ? `${d}/${m}/${y}` : `${m}/${y}`;
}

const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };
const TYPE_LABEL = { practicas: 'Prácticas', empleo: 'Empleo' };

export default function OfferDetail({ offer, onBack }) {
  const typeLabel = TYPE_LABEL[offer.type] || offer.type;

  return (
    <div>
      {/* Breadcrumb + volver */}
      <div className="bg-[#F0B400] px-8 py-3">
        <p className="text-sm text-black/70">
          Inicio &gt; Listado de ofertas de {typeLabel.toLowerCase()} &gt;{' '}
          <span className="font-medium text-black">{offer.title}</span>
        </p>
      </div>

      <div className="bg-white px-8 py-6 max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
        >
          &lt; Volver
        </button>

        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
          {offer.company}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{offer.title}</h1>
        <div className="flex items-center gap-5 text-gray-500 text-sm mb-8">
          <span className="flex items-center gap-1.5"><CalendarIcon />{formatDate(offer.publishedAt)}</span>
          <span className="flex items-center gap-1.5"><PinIcon />{offer.location}</span>
        </div>
      </div>

      {/* Grid de metadatos */}
      <div className="bg-gray-100 px-8 py-8">
        <div className="max-w-5xl grid grid-cols-3 gap-x-8 gap-y-6">
          <InfoCell label="SECTOR" value={offer.sector} />
          <InfoCell label="MODALIDAD" value={MODALITY_LABEL[offer.modality] || offer.modality} />
          <InfoCell label="TIPO" value={typeLabel} />
          <InfoCell label="DURACIÓN" value={offer.duration || '—'} />
          <InfoCell label="UBICACIÓN" value={offer.location} />
          <InfoCell label="TITULACIONES" value={offer.targetDegrees?.join(', ') || '—'} />
        </div>
      </div>

      {/* Descripción y requisitos */}
      <div className="bg-white px-8 py-8 max-w-5xl space-y-8">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Descripción del puesto</h2>
          <p className="text-gray-700 leading-relaxed">{offer.description}</p>
        </section>

        {offer.requirements && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-4">Requisitos</h2>
            <div className="grid grid-cols-2 gap-6">
              {offer.requirements.hardSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Habilidades técnicas</p>
                  <div className="flex flex-wrap gap-2">
                    {offer.requirements.hardSkills.map(s => (
                      <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {offer.requirements.softSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Habilidades personales</p>
                  <div className="flex flex-wrap gap-2">
                    {offer.requirements.softSkills.map(s => (
                      <span key={s} className="bg-[#F0B400]/15 text-yellow-900 text-xs px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {offer.requirements.languages?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Idiomas</p>
                  <div className="flex flex-wrap gap-2">
                    {offer.requirements.languages.map(l => (
                      <span key={l.name} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                        {l.name} — nivel {l.level}/5
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {offer.requirements.minExperience && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Experiencia mínima</p>
                  <p className="text-gray-700 text-sm">{offer.requirements.minExperience}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="pt-2">
          <button
            type="button"
            className="bg-[#F0B400] hover:bg-[#D9A200] text-black font-semibold px-8 py-3 rounded transition-colors"
          >
            Inscribirse en la oferta
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-600">{value || '—'}</p>
    </div>
  );
}
