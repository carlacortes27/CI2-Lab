import { useState, useEffect } from 'react';
import { getOffers } from '../lib/api.js';
import OfferListItem from '../features/offers/OfferListItem.jsx';
import OfferDetail from '../features/offers/OfferDetail.jsx';

const MOCK_COMUNICACIONES = [
  {
    id: 1,
    date: '26/05/2026',
    text: 'Si eres un universitario cursando tu penúltimo año de Grado o de Máster habilitante de cualquier titulación y tienes un alto nivel de inglés y buen expediente académico, el programa ACADEMY de Acciona es para ti.',
    link: 'VER MÁS →',
  },
  {
    id: 2,
    date: '20/05/2026',
    text: 'Abierto el plazo de inscripción para el Programa de Becas de Investigación del ICAI para el curso 2026-2027. Consulta los requisitos y plazos en la web.',
    link: 'VER MÁS →',
  },
  {
    id: 3,
    date: '15/05/2026',
    text: 'McKinsey & Company organiza una sesión informativa para estudiantes de ICAI el próximo 5 de junio. Plazas limitadas.',
    link: 'VER MÁS →',
  },
];

function ComillasLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-black/20 rounded flex items-center justify-center">
        <span className="text-black font-bold text-xs leading-none text-center">C</span>
      </div>
      <div className="leading-tight">
        <p className="text-black font-bold text-sm tracking-wide uppercase">Comillas</p>
        <p className="text-black/70 text-xs">Universidad Pontificia</p>
        <p className="text-black/60 text-[10px] tracking-widest">ICAI · ICADE · CIHS</p>
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

export default function OpePortalPage({ onNavigateToEditor, userName = 'Jaime Puente Sánchez' }) {
  const [tab, setTab] = useState('practicas');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    getOffers({ type: tab })
      .then(data => setOffers(data))
      .catch(() => setError('No se pudo conectar con el servidor. Asegúrate de que el servidor está activo en el puerto 3001.'))
      .finally(() => setLoading(false));
  }, [tab]);

  function handleTabChange(nextTab) {
    setTab(nextTab);
    setSelectedOffer(null);
    setLoading(true);
    setError(null);
  }

  function handleSelectOffer(offer) {
    setSelectedOffer(offer);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setSelectedOffer(null);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header amarillo */}
      <header className="bg-[#F0B400] px-8 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <ComillasLogo />
          <div className="flex items-center gap-5">
            {onNavigateToEditor && (
              <button
                type="button"
                onClick={onNavigateToEditor}
                className="text-sm font-medium text-black/70 hover:text-black transition-colors"
              >
                Mi CV
              </button>
            )}
            <span className="text-sm font-medium text-black">Hola, {userName}</span>
            <button type="button" className="text-black/70 hover:text-black transition-colors">
              <BellIcon />
            </button>
            <button type="button" className="text-black/70 hover:text-black transition-colors">
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Hero amarillo */}
      {!selectedOffer && (
        <div className="bg-[#F0B400]">
          <div
            className="max-w-6xl mx-auto px-8 py-14 text-center"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <h1 className="text-4xl font-bold text-black">Bienvenid@</h1>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {selectedOffer ? (
        <OfferDetail offer={selectedOffer} onBack={handleBack} />
      ) : (
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex gap-8">
            {/* Columna izquierda: listado */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <TabButton
                  active={tab === 'practicas'}
                  onClick={() => handleTabChange('practicas')}
                >
                  ÚLTIMAS OFERTAS DE PRÁCTICAS
                </TabButton>
                <TabButton
                  active={tab === 'empleo'}
                  onClick={() => handleTabChange('empleo')}
                >
                  ÚLTIMAS OFERTAS DE EMPLEO
                </TabButton>
              </div>

              {/* Lista */}
              {loading && (
                <div className="space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="animate-pulse border-b border-gray-200 py-4">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"/>
                      <div className="h-5 bg-gray-200 rounded w-2/3"/>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && offers.length === 0 && (
                <p className="text-gray-500 text-sm py-4">No hay ofertas disponibles en esta categoría.</p>
              )}

              {!loading && !error && offers.map(offer => (
                <OfferListItem
                  key={offer.id}
                  offer={offer}
                  onClick={() => handleSelectOffer(offer)}
                />
              ))}
            </div>

            {/* Columna derecha: comunicaciones */}
            <aside className="w-72 shrink-0">
              <div className="sticky top-24">
                <div className="bg-[#F0B400] px-4 py-3 rounded-t">
                  <h2 className="text-sm font-bold text-black uppercase tracking-widest">Comunicaciones</h2>
                </div>
                <div className="bg-gray-50 rounded-b border border-t-0 border-gray-200 divide-y divide-gray-200">
                  {MOCK_COMUNICACIONES.map(c => (
                    <div key={c.id} className="p-4">
                      <p className="text-xs text-gray-400 mb-1">{c.date}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                      <button type="button" className="text-xs font-semibold text-[#C89600] hover:underline mt-2 block">
                        {c.link}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 text-xs font-bold tracking-wider transition-colors ${
        active
          ? 'text-[#C89600] border-b-2 border-[#F0B400]'
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
