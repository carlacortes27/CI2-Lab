/**
 * OpePortalPage.jsx — Portal OPE (Shell A)
 *
 * Usa PortalLayout para la estructura de shells (header + sidebar + grid).
 * Gestiona las pestañas y el estado de datos.
 */
import { useState, useEffect } from 'react';
import { getOffers }      from '../../lib/api.js';
import OfferDetail        from './OfferDetail.jsx';
import PortalLayout       from '../../layouts/PortalLayout.jsx';
import { T }              from '../../styles/theme.js';
import {
  OfferCard,
  ApplicationCard,
  StatBox,
  FilterDropdown,
  Badge,
  Card,
  TrophyIcon,
  CalendarIcon,
  BookIcon,
  FilterIcon,
  InfoIcon,
  PinIcon,
  ClockIcon,
  UserIcon,
} from '../../components/ui/index.js';

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_CANDIDATURAS = [
  { id: 1, title: 'Prácticas en Operación de Activos',  company: 'Iberdrola',      location: 'Madrid', modality: 'Híbrido',    status: 'revision',   date: '12/06/2025' },
  { id: 2, title: 'Prácticas en Gestión de Proyectos',  company: 'Naturgy',        location: 'Madrid', modality: 'Presencial', status: 'entrevista', date: '08/06/2025' },
  { id: 3, title: 'Prácticas en Advisory – Energía',    company: 'EY',             location: 'Madrid', modality: 'Híbrido',    status: 'enviada',    date: '02/06/2025' },
  { id: 4, title: 'Prácticas en Análisis de Datos',     company: 'ACCIONA Energía',location: 'Madrid', modality: 'Híbrido',    status: 'aceptada',   date: '20/05/2025' },
];

const MOCK_EVENTOS = [
  { id: 1, day: '17', month: 'JUN', title: 'Jornada de Empleo Comillas',     time: '10:00 - 14:00', place: 'Campus Cantoblanco' },
  { id: 2, day: '24', month: 'JUN', title: 'Workshop: Prepara tu CV con IA', time: '16:00 - 18:00', place: 'Sala Magna, ICAI'  },
];

const MOCK_RECURSOS = [
  { id: 1, title: 'Guía para entrevistas de prácticas',      desc: 'Consejos y mejores prácticas', bg: '#DBEAFE', ic: '#1D4ED8' },
  { id: 2, title: 'Cómo redactar tu carta de presentación',  desc: 'Plantillas y ejemplos reales',  bg: '#EDE9FE', ic: '#6D28D9' },
];

const SECTORES    = ['Consultoría', 'Energía', 'Finanzas', 'Tecnología', 'Legal', 'Industrial'];
const MODALIDADES = [{ value: 'presencial', label: 'Presencial' }, { value: 'hibrido', label: 'Híbrido' }, { value: 'remoto', label: 'Remoto' }];
const UBICACIONES = ['Madrid', 'Barcelona', 'Bilbao', 'Sevilla', 'Remoto'];
const DURACIONES  = ['3 meses', '6 meses', '12 meses'];

// ── Panel Mis Candidaturas ────────────────────────────────────────────────────
function CandidaturasPanel() {
  const counts = {
    enviadas:   8,
    revision:   MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length,
    entrevista: MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length,
    aceptada:   MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length,
  };

  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.t1, fontFamily: T.font }}>Mis candidaturas</span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
          Ver todas →
        </button>
      </div>

      {/* Stats 4 cajas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${T.border}` }}>
        <StatBox value={counts.enviadas}   label="Enviadas"    color={T.t2}      bordered />
        <StatBox value={counts.revision}   label="En revisión" color="#F5A623"   bordered />
        <StatBox value={counts.entrevista} label="Entrevista"  color="#2563EB"   bordered />
        <StatBox value={counts.aceptada}   label="Aceptadas"   color="#16A34A" />
      </div>

      {/* Lista de candidaturas */}
      {MOCK_CANDIDATURAS.map((c, i) => (
        <ApplicationCard
          key={c.id}
          candidatura={c}
          isLast={i === MOCK_CANDIDATURAS.length - 1}
        />
      ))}

      {/* Consejo para destacar */}
      <div style={{ margin: '0 16px 16px', borderRadius: 12, padding: 16, backgroundColor: '#FEF9EF', border: `1px solid ${T.orangeBg}`, display: 'flex', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrophyIcon size={18} color={T.white} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.t1, fontFamily: T.font }}>Consejo para destacar</p>
          <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.5, marginTop: 4, fontFamily: T.font }}>
            Completa tu perfil al 100% y añade tus proyectos para mejorar tus opciones.
          </p>
          <button type="button" style={{ fontSize: 12, fontWeight: 600, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, fontFamily: T.font }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
            Ir a mi perfil →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Próximos Eventos ──────────────────────────────────────────────────────────
function ProximosEventos() {
  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: T.t1, fontFamily: T.font }}>
          <CalendarIcon size={15} color={T.orange} />
          Próximos eventos
        </span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}>
          Ver todos →
        </button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_EVENTOS.map(ev => (
          <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Bloque de fecha */}
            <div style={{ width: 48, height: 52, border: `1px solid ${T.border}`, borderRadius: 12, backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.t1, lineHeight: 1, fontFamily: T.font }}>{ev.day}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#F97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3, fontFamily: T.font }}>{ev.month}</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.t1, lineHeight: 1.4, fontFamily: T.font }}>{ev.title}</p>
              <p style={{ fontSize: 12, color: T.t3, marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.font }}>
                <ClockIcon size={11} color={T.t3} />{ev.time}
                <span style={{ color: T.border }}>·</span>
                <PinIcon size={11} color={T.t3} />{ev.place}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recursos para ti ──────────────────────────────────────────────────────────
function RecursosParaTi() {
  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: T.t1, fontFamily: T.font }}>
          <BookIcon size={15} color={T.orange} />
          Recursos para ti
        </span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}>
          Ver todos →
        </button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_RECURSOS.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookIcon size={18} color={r.ic} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.t1, lineHeight: 1.4, fontFamily: T.font }}>{r.title}</p>
              <p style={{ fontSize: 12, color: T.t3, marginTop: 3, fontFamily: T.font }}>{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, padding: 24 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#E5E7EB', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, width: '30%', marginBottom: 10 }} />
              <div style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 6, width: '70%', marginBottom: 8 }} />
              <div style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, width: '50%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pestaña: Inicio ───────────────────────────────────────────────────────────
function TabInicio({ firstName, offers, loading, error, showAll, setShowAll, filters, setFilters, onOfferClick }) {
  const visibleOffers = showAll ? offers : offers.slice(0, 3);
  const hasMore       = !showAll && offers.length > 3;

  return (
    <>
      {/* Saludo */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, lineHeight: 1.2, margin: 0, fontFamily: T.font }}>
          ¡Hola, {firstName}! 👋
        </h1>
        <p style={{ fontSize: 14, color: T.t2, marginTop: 8, lineHeight: 1.5, fontFamily: T.font }}>
          Descubre prácticas recomendadas para ti y sigue el estado de tus candidaturas.
        </p>
      </div>

      {/* Card de ofertas recomendadas + filtros */}
      <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: T.t1, fontFamily: T.font }}>
            Ofertas recomendadas para ti
            <InfoIcon size={15} color={T.t3} />
          </span>
          <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: T.font }}>
            Ver todas las ofertas →
          </button>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <FilterDropdown
            label="Área profesional"
            options={SECTORES}
            value={filters.sector}
            onChange={v => setFilters(f => ({ ...f, sector: v }))}
          />
          <FilterDropdown
            label="Ubicación"
            options={UBICACIONES}
            value={filters.location}
            onChange={v => setFilters(f => ({ ...f, location: v }))}
          />
          <FilterDropdown
            label="Modalidad"
            options={MODALIDADES}
            value={filters.modality}
            onChange={v => setFilters(f => ({ ...f, modality: v }))}
          />
          <FilterDropdown
            label="Duración"
            options={DURACIONES}
            value=""
            onChange={() => {}}
          />
          <button type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: T.radiusPill, border: `1px solid ${T.border}`, backgroundColor: T.white, color: T.t2, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>
            <FilterIcon size={14} />
            Más filtros
          </button>
        </div>
      </div>

      {/* Tarjetas de oferta */}
      {loading && <LoadingSkeleton />}

      {error && (
        <div style={{ borderRadius: T.radiusCard, padding: 16, backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p style={{ fontSize: 13, color: '#B91C1C', lineHeight: 1.5, fontFamily: T.font }}>{error}</p>
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <p style={{ fontSize: 14, color: T.t3, textAlign: 'center', padding: '40px 0', fontFamily: T.font }}>
          No hay ofertas disponibles con los filtros seleccionados.
        </p>
      )}

      {!loading && !error && visibleOffers.map((offer, idx) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          rank={idx}
          onClick={() => onOfferClick(offer)}
        />
      ))}

      {hasMore && (
        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={() => setShowAll(true)}
            style={{ fontSize: 14, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}>
            Ver más ofertas →
          </button>
        </div>
      )}

      {/* Secciones inferiores */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <ProximosEventos />
          <RecursosParaTi />
        </div>
      )}
    </>
  );
}

// ── Pestaña: Ofertas ──────────────────────────────────────────────────────────
function TabOfertas({ offers, loading, error, showAll, setShowAll, filters, setFilters, onOfferClick }) {
  const visibleOffers = showAll ? offers : offers.slice(0, 10);
  const hasMore       = !showAll && offers.length > 10;

  return (
    <>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font }}>Ofertas</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <FilterDropdown label="Área profesional" options={SECTORES}    value={filters.sector}   onChange={v => setFilters(f => ({ ...f, sector: v }))} />
        <FilterDropdown label="Ubicación"         options={UBICACIONES} value={filters.location} onChange={v => setFilters(f => ({ ...f, location: v }))} />
        <FilterDropdown label="Modalidad"         options={MODALIDADES} value={filters.modality} onChange={v => setFilters(f => ({ ...f, modality: v }))} />
        <FilterDropdown label="Duración"          options={DURACIONES}  value=""                 onChange={() => {}} />
      </div>
      {loading && <LoadingSkeleton />}
      {error && <p style={{ color: '#B91C1C', fontFamily: T.font }}>{error}</p>}
      {!loading && !error && visibleOffers.map((offer, idx) => (
        <OfferCard key={offer.id} offer={offer} rank={idx} onClick={() => onOfferClick(offer)} />
      ))}
      {hasMore && (
        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={() => setShowAll(true)}
            style={{ fontSize: 14, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}>
            Ver más ofertas →
          </button>
        </div>
      )}
    </>
  );
}

// ── Pestaña: Mis Candidaturas (vista ampliada) ────────────────────────────────
function TabCandidaturas() {
  const counts = {
    enviadas:   8,
    revision:   MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length,
    entrevista: MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length,
    aceptada:   MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length,
  };

  return (
    <>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font }}>Mis candidaturas</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, textAlign: 'center', padding: '20px 8px' }}>
          <StatBox value={counts.enviadas}   label="Enviadas"    color={T.t2} />
        </div>
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
          <StatBox value={counts.revision}   label="En revisión" color="#F5A623" />
        </div>
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
          <StatBox value={counts.entrevista} label="Entrevista"  color="#2563EB" />
        </div>
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
          <StatBox value={counts.aceptada}   label="Aceptadas"   color="#16A34A" />
        </div>
      </div>
      <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
        {MOCK_CANDIDATURAS.map((c, i) => (
          <ApplicationCard key={c.id} candidatura={c} isLast={i === MOCK_CANDIDATURAS.length - 1} />
        ))}
      </div>
    </>
  );
}

// ── Placeholder para pestañas en construcción ─────────────────────────────────
function TabPlaceholder({ title }) {
  return (
    <>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font }}>{title}</h1>
      <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: T.t3, fontFamily: T.font }}>
          Esta sección se implementará en próximos pasos (spec § 3.3).
        </p>
      </div>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function OpePortalPage({
  onNavigate,
  userName   = 'Jaime Puente Sánchez',
  userDegree = '4º ICAI',
}) {
  const firstName = userName.split(' ')[0];

  const [activeSection, setActiveSection] = useState('inicio');
  const [offers,        setOffers]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAll,       setShowAll]       = useState(false);
  const [filters, setFilters] = useState({ sector: '', location: '', modality: '' });

  // Carga de ofertas según filtros
  useEffect(() => {
    setLoading(true);
    setError(null);
    setShowAll(false);
    getOffers({
      type: 'practicas',
      ...(filters.sector   && { sector:   filters.sector }),
      ...(filters.location && { location: filters.location }),
      ...(filters.modality && { modality: filters.modality }),
    })
      .then(data => setOffers(data))
      .catch(() => setError('No se pudo conectar con el servidor. Asegúrate de que está activo en el puerto 3001.'))
      .finally(() => setLoading(false));
  }, [filters]);

  // Vista de detalle de una oferta
  if (selectedOffer) {
    return (
      <PortalLayout
        activeSection="ofertas"
        onSection={setActiveSection}
        onNavigate={onNavigate}
        userName={userName}
        userDegree={userDegree}
      >
        <OfferDetail offer={selectedOffer} onBack={() => setSelectedOffer(null)} />
      </PortalLayout>
    );
  }

  // Determinar si la pestaña activa tiene panel derecho
  const hasRightPanel = activeSection === 'inicio';

  // Contenido central según pestaña
  function renderContent() {
    switch (activeSection) {
      case 'inicio':
        return (
          <TabInicio
            firstName={firstName}
            offers={offers}
            loading={loading}
            error={error}
            showAll={showAll}
            setShowAll={setShowAll}
            filters={filters}
            setFilters={setFilters}
            onOfferClick={setSelectedOffer}
          />
        );
      case 'ofertas':
        return (
          <TabOfertas
            offers={offers}
            loading={loading}
            error={error}
            showAll={showAll}
            setShowAll={setShowAll}
            filters={filters}
            setFilters={setFilters}
            onOfferClick={setSelectedOffer}
          />
        );
      case 'candidaturas':
        return <TabCandidaturas />;
      case 'empresas':
        return <TabPlaceholder title="Empresas" />;
      case 'eventos':
        return <TabPlaceholder title="Eventos" />;
      case 'recursos':
        return <TabPlaceholder title="Recursos" />;
      case 'orientacion':
        return <TabPlaceholder title="Orientación" />;
      case 'perfil':
        return <TabPlaceholder title="Mi perfil" />;
      case 'ajustes':
        return <TabPlaceholder title="Ajustes" />;
      default:
        return null;
    }
  }

  return (
    <PortalLayout
      activeSection={activeSection}
      onSection={setActiveSection}
      onNavigate={onNavigate}
      userName={userName}
      userDegree={userDegree}
      rightPanel={hasRightPanel ? <CandidaturasPanel /> : undefined}
    >
      {renderContent()}
    </PortalLayout>
  );
}