/**
 * OpePortalPage.jsx — Portal OPE (Shell A)
 *
 * Usa PortalLayout para la estructura de shells (header + sidebar + grid).
 * Gestiona las pestañas y el estado de datos.
 */
import { useState, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { advanceApplication, applyToOffer, getApplications, getOffers, getEvents, saveOffer } from '../../lib/api.js';
import { useAuth } from '../../context/useAuth.js';
import { useCv } from '../../context/CvContext.jsx';
import OfferDetail        from './OfferDetail.jsx';
import EventDetail        from './EventDetail.jsx';
import OrientacionPanel  from './OrientacionPanel.jsx';
import PortalLayout       from '../../layouts/PortalLayout.jsx';
import { T }              from '../../styles/theme.js';
import {
  OfferCard,
  ApplicationCard,
  StatBox,
  FilterDropdown,
  Button,
  Pill,
  TrophyIcon,
  CalendarIcon,
  BookIcon,
  FilterIcon,
  PinIcon,
  ClockIcon,
  ChevronRightIcon,
} from '../../components/ui/index.js';

// ── Mock data ─────────────────────────────────────────────────────────────────
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
const JORNADAS    = [{ value: 'completa', label: 'Completa' }, { value: 'parcial', label: 'Parcial' }, { value: 'flexible', label: 'Flexible' }];
const HORARIOS    = [{ value: 'manana', label: 'Mañana' }, { value: 'tarde', label: 'Tarde' }, { value: 'flexible', label: 'Flexible' }];
const IDIOMAS     = ['Inglés', 'Francés', 'Alemán', 'Español'];
const NIVELES_IDIOMA = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
const TECNOLOGIAS = ['Excel', 'PowerPoint', 'Python', 'SQL', 'Power BI', 'AutoCAD', 'MATLAB', 'AWS', 'Java', 'Git', 'C/C++', 'R Studio'];
const AREAS_INTERES = ['datos', 'consultoría', 'energía', 'renovables', 'finanzas', 'sostenibilidad', 'cloud', 'operaciones', 'estrategia', 'ingeniería'];

function applicationToCard(application) {
  const offer = application.offer || {};
  return {
    id: application.id,
    title: offer.title,
    company: offer.company,
    location: offer.location,
    modality: offer.modality,
    status: application.status,
    date: application.createdAt,
    offer,
    application,
  };
}

function eventDateTime(event) {
  return new Date(`${event.date}T${event.startTime || '00:00'}`);
}

function formatEventDate(event) {
  const date = eventDateTime(event);
  return {
    day: new Intl.DateTimeFormat('es-ES', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '').toUpperCase(),
    weekday: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date),
  };
}

function formatEventTime(event) {
  if (!event.endTime) return event.startTime;
  return `${event.startTime} - ${event.endTime}`;
}

function formatLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getEventCategory(event) {
  const text = [event.title, event.organizer, ...(event.tags || [])].join(' ').toLowerCase();
  if (text.includes('networking') || text.includes('alumni') || text.includes('feria')) return 'Networking';
  if (text.includes('orientación') || text.includes('cv') || text.includes('entrevista') || text.includes('linkedin')) return 'Orientación';
  if (event.company || text.includes('empresa') || text.includes('graduate')) return 'Empresa';
  return 'Fecha importante';
}

function eventCategoryStyle(category) {
  const styles = {
    Networking: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
    Orientación: { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
    Empresa: { bg: '#F3E8FF', color: '#7E22CE', dot: '#8B5CF6' },
    'Fecha importante': { bg: T.orangeBg, color: '#B45309', dot: T.orange },
  };
  return styles[category] || styles['Fecha importante'];
}

function buildCalendarWeeks(monthDate, events) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = formatLocalISO(date);
    const dayEvents = events.filter(event => event.date === iso);
    return {
      iso,
      date,
      day: date.getDate(),
      currentMonth: date.getMonth() === month,
      events: dayEvents,
    };
  });
}

// ── Panel Mis Candidaturas ────────────────────────────────────────────────────
function CandidaturasPanel({ applications = [], onSection, onApplicationClick, vtActive = false }) {
  const cards = applications.map(applicationToCard).slice(0, 4);
  const counts = {
    enviadas:   applications.filter(c => c.status === 'enviada').length,
    revision:   applications.filter(c => c.status === 'revision').length,
    entrevista: applications.filter(c => c.status === 'entrevista').length,
    aceptada:   applications.filter(c => c.status === 'aceptada' || c.status === 'finalizada').length,
  };

  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, ...(vtActive && { viewTransitionName: 'cand-card' }) }}>
      {/* Cabecera */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.t1, fontFamily: T.font }}>Mis candidaturas</span>
        <button type="button" style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}
          onClick={() => onSection('candidaturas')}
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
      {cards.length === 0 ? (
        <p style={{ padding: '20px', fontSize: 13, color: T.t3, textAlign: 'center', fontFamily: T.font }}>
          Aún no te has inscrito en ninguna oferta.
        </p>
      ) : (
        cards.map((c, i) => (
          <ApplicationCard
            key={c.id}
            candidatura={c}
            onClick={() => onApplicationClick?.(c.application)}
            isLast={i === cards.length - 1}
          />
        ))
      )}

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
function ProximosEventos({ onSection }) {
  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, viewTransitionName: 'eventos-card' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: T.t1, fontFamily: T.font }}>
          <CalendarIcon size={15} color={T.orange} />
          Próximos eventos
        </span>
        <button
          type="button"
          onClick={() => onSection?.('eventos')}
          style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
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
function TabInicio({ firstName, offers, loading, error, filters, setFilters, onOfferClick, onSection }) {
  const visibleOffers = offers.slice(0, 3);

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

      {/* Ofertas */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.t1, fontFamily: T.font, margin: 0, viewTransitionName: 'ofertas-heading' }}>Ofertas</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, viewTransitionName: 'ofertas-filters' }}>
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

      {!loading && !error && offers.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <Button variant="secondary" onClick={() => onSection('ofertas')}>
            Ver todas las ofertas →
          </Button>
        </div>
      )}

      {/* Secciones inferiores */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <ProximosEventos onSection={onSection} />
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
      <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font, viewTransitionName: 'ofertas-heading' }}>Ofertas</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, viewTransitionName: 'ofertas-filters' }}>
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
const CAND_FILTERS = [
  { key: 'todas',      label: 'Todas'       },
  { key: 'guardada',   label: 'Guardadas'   },
  { key: 'enviada',    label: 'Solicitadas' },
  { key: 'revision',   label: 'En revisión' },
  { key: 'entrevista', label: 'Entrevistas' },
  { key: 'aceptada',   label: 'Aceptadas'   },
  { key: 'finalizada', label: 'Finalizadas'  },
];

function TabCandidaturas({ applications, loading, error, onApplicationClick }) {
  const [activeFilter, setActiveFilter] = useState('todas');
  const cards = applications.map(applicationToCard);

  const counts = {
    enviadas:   cards.filter(c => c.status === 'enviada').length,
    guardadas:  cards.filter(c => c.status === 'guardada').length,
    revision:   cards.filter(c => c.status === 'revision').length,
    entrevista: cards.filter(c => c.status === 'entrevista').length,
    aceptada:   cards.filter(c => c.status === 'aceptada').length,
    finalizada: cards.filter(c => c.status === 'finalizada').length,
  };

  const STAT_BOXES = [
    { value: counts.enviadas,   label: 'Enviadas',    color: T.t2       },
    { value: counts.guardadas,  label: 'Guardadas',   color: T.t2       },
    { value: counts.revision,   label: 'En revisión', color: '#F5A623'  },
    { value: counts.entrevista, label: 'Entrevista',  color: '#2563EB'  },
    { value: counts.aceptada,   label: 'Aceptadas',   color: '#16A34A'  },
    { value: counts.finalizada, label: 'Finalizadas',  color: '#0369A1'  },
  ];

  const filtered = activeFilter === 'todas'
    ? cards
    : cards.filter(c => c.status === activeFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, viewTransitionName: 'cand-card' }}>
      {/* Cabecera */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font, margin: 0 }}>Mis candidaturas</h1>
        <p style={{ fontSize: 14, color: T.t2, marginTop: 8, fontFamily: T.font }}>
          Consulta el estado de las ofertas en las que te has inscrito.
        </p>
      </div>

      {/* 6 stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
        {STAT_BOXES.map(s => (
          <div key={s.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
            <StatBox value={s.value} label={s.label} color={s.color} />
          </div>
        ))}
      </div>

      {/* Filtros + ordenación */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CAND_FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '7px 14px',
                borderRadius: T.radiusPill,
                border: activeFilter === f.key ? 'none' : `1px solid ${T.border}`,
                backgroundColor: activeFilter === f.key ? T.orange : T.white,
                color: activeFilter === f.key ? T.white : T.t2,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: T.font,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          style={{
            padding: '7px 12px',
            borderRadius: T.radiusPill,
            border: `1px solid ${T.border}`,
            backgroundColor: T.white,
            color: T.t2,
            fontSize: 13,
            fontFamily: T.font,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option>Más recientes</option>
          <option>Más antiguos</option>
        </select>
      </div>

      {/* Lista */}
      <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard }}>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <p style={{ padding: 32, textAlign: 'center', fontSize: 14, color: '#B91C1C', fontFamily: T.font }}>
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 32, textAlign: 'center', fontSize: 14, color: T.t3, fontFamily: T.font }}>
            No hay candidaturas en esta categoría.
          </p>
        ) : (
          filtered.map((c, i) => (
            <ApplicationCard
              key={c.id}
              candidatura={c}
              onClick={() => onApplicationClick(c.application)}
              isLast={i === filtered.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Pestaña: Eventos ──────────────────────────────────────────────────────────
function EventCard({ event, compact = false, onClick }) {
  const date = formatEventDate(event);
  const isOpen = event.registrationStatus === 'Abierta';
  const actionLabel = isOpen ? 'Inscribirme' : event.registrationStatus;
  const category = getEventCategory(event);
  const categoryStyle = eventCategoryStyle(category);

  return (
    <div
      onClick={() => onClick?.(event)}
      style={{
        backgroundColor: T.white,
        borderRadius: T.radiusCard,
        boxShadow: T.shadowCard,
        border: compact ? `1px solid ${T.border}` : 'none',
        padding: compact ? 14 : 24,
        display: 'grid',
        gridTemplateColumns: compact ? '58px 1fr auto' : '76px 1fr auto',
        gap: compact ? 14 : 20,
        alignItems: 'start',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = T.shadowElevated; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = T.shadowCard; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      <div style={{
        width: compact ? 58 : 76,
        minHeight: compact ? 64 : 86,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusInput,
        backgroundColor: compact ? '#F9FAFB' : T.orangeBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: compact ? 21 : 28, fontWeight: 700, color: T.t1, lineHeight: 1, fontFamily: T.font }}>{date.day}</span>
        <span style={{ fontSize: compact ? 9 : 11, fontWeight: 700, color: T.orange, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 5, fontFamily: T.font }}>{date.month}</span>
        {compact && <span style={{ fontSize: 9, fontWeight: 600, color: T.t3, marginTop: 3, fontFamily: T.font }}>{date.weekday.slice(0, 3).toUpperCase()}</span>}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{
            padding: compact ? '3px 10px' : '4px 11px',
            borderRadius: T.radiusPill,
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.color,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: T.font,
          }}>
            {category}
          </span>
          {!compact && <span style={{ fontSize: 12, color: T.t3, textTransform: 'capitalize', fontFamily: T.font }}>{date.weekday}</span>}
        </div>
        <h2 style={{ fontSize: compact ? 15 : 18, fontWeight: 600, color: T.t1, lineHeight: 1.35, margin: 0, fontFamily: T.font }}>
          {event.title}
        </h2>
        <p style={{ fontSize: compact ? 12 : 13, color: T.t2, marginTop: 5, fontFamily: T.font }}>
          {event.organizer}
        </p>
        <div style={{ display: 'flex', gap: compact ? 12 : 16, flexWrap: 'wrap', marginTop: compact ? 8 : 14, color: T.t2, fontSize: compact ? 11 : 13, fontFamily: T.font }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ClockIcon size={compact ? 12 : 14} color={T.t3} />
            {formatEventTime(event)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PinIcon size={compact ? 12 : 14} color={T.t3} />
            {event.location}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={compact ? 12 : 14} color={T.t3} />
            {event.modality}
          </span>
        </div>
        <p style={{ fontSize: compact ? 12 : 14, color: T.t2, lineHeight: 1.6, marginTop: compact ? 8 : 14, marginBottom: 0, fontFamily: T.font }}>
          {event.description}
        </p>
        {!compact && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {event.tags?.map(tag => (
            <span key={tag} style={{
              padding: '5px 10px',
              borderRadius: T.radiusPill,
              backgroundColor: T.hoverBg,
              color: T.t2,
              fontSize: 12,
              fontFamily: T.font,
            }}>
              {tag}
            </span>
          ))}
        </div>}
      </div>

      <Button
        variant={compact ? 'secondary' : isOpen ? 'primary' : 'secondary'}
        disabled={!isOpen}
        style={{
          alignSelf: 'center',
          padding: compact ? '8px 16px' : undefined,
          fontSize: compact ? 12 : undefined,
          color: compact && isOpen ? T.orange : undefined,
          borderColor: compact && isOpen ? T.orange : undefined,
        }}
      >
        {compact && isOpen ? 'Apuntarme' : actionLabel}
      </Button>
    </div>
  );
}

function EventsCalendar({
  events,
  monthDate,
  selectedDate,
  minMonth,
  maxMonth,
  onSelectDate,
  onMonthChange,
  onToday,
}) {
  const cells = buildCalendarWeeks(monthDate, events);
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(monthDate);
  const selectedIso = selectedDate ? formatLocalISO(selectedDate) : null;
  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const canGoPrev = monthDate > minMonth;
  const canGoNext = monthDate < maxMonth;

  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, margin: 0, textTransform: 'capitalize', fontFamily: T.font }}>{monthLabel}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => onMonthChange(addMonths(monthDate, -1))}
            style={{ width: 34, height: 34, borderRadius: T.radiusInput, border: `1px solid ${T.border}`, backgroundColor: T.white, color: canGoPrev ? T.t2 : T.t3, opacity: canGoPrev ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canGoPrev ? 'pointer' : 'not-allowed' }}
          >
            <ChevronRightIcon size={15} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onMonthChange(addMonths(monthDate, 1))}
            style={{ width: 34, height: 34, borderRadius: T.radiusInput, border: `1px solid ${T.border}`, backgroundColor: T.white, color: canGoNext ? T.t2 : T.t3, opacity: canGoNext ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canGoNext ? 'pointer' : 'not-allowed' }}
          >
            <ChevronRightIcon size={15} />
          </button>
          <Button variant="secondary" onClick={onToday} style={{ padding: '8px 14px', fontSize: 12 }}>Hoy</Button>
        </div>
      </div>

      <div style={{ padding: '8px 24px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
          {weekDays.map(day => (
            <span key={day} style={{ fontSize: 11, fontWeight: 700, color: T.t2, textAlign: 'center', fontFamily: T.font }}>{day}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {cells.map(cell => {
            const isSelected = selectedIso === cell.iso;
            const hasEvents = cell.events.length > 0;
            const firstCategory = hasEvents ? getEventCategory(cell.events[0]) : null;
            const dotColor = firstCategory ? eventCategoryStyle(firstCategory).dot : 'transparent';

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => {
                  onSelectDate(new Date(cell.date));
                  if (!cell.currentMonth) onMonthChange(startOfMonth(cell.date));
                }}
                style={{
                  height: 42,
                  border: 'none',
                  borderRadius: T.radiusPill,
                  backgroundColor: isSelected ? T.orange : hasEvents ? T.orangeBg : 'transparent',
                  color: isSelected ? T.white : cell.currentMonth ? T.t1 : T.t3,
                  fontSize: 14,
                  fontWeight: isSelected || hasEvents ? 700 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                  fontFamily: T.font,
                }}
              >
                {cell.day}
                {hasEvents && (
                  <span style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 5,
                    transform: 'translateX(-50%)',
                    width: 5,
                    height: 5,
                    borderRadius: T.radiusPill,
                    backgroundColor: isSelected ? T.white : dotColor,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 24px 18px', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {['Fecha importante', 'Orientación', 'Networking', 'Empresa'].map(category => {
          const cfg = eventCategoryStyle(category);
          return (
            <span key={category} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.t2, fontFamily: T.font }}>
              <span style={{ width: 7, height: 7, borderRadius: T.radiusPill, backgroundColor: cfg.dot }} />
              {category}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TabEventos({ events, loading, error, scope, setScope, onEventClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events.filter(event => eventDateTime(event) >= today);
  const past = events.filter(event => eventDateTime(event) < today).reverse();
  const effectiveScope = scope === 'proximos' && upcoming.length === 0 ? 'pasados' : scope;
  const baseEvents = effectiveScope === 'proximos' ? upcoming : past;
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventType, setEventType] = useState('');
  const [company, setCompany] = useState('');
  const [modality, setModality] = useState('');
  const [area, setArea] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const sortedEvents = [...events].sort((a, b) => eventDateTime(a) - eventDateTime(b));
  const homeMonth = sortedEvents[0] ? startOfMonth(eventDateTime(sortedEvents[0])) : startOfMonth(today);
  const minMonth = sortedEvents[0] ? startOfMonth(eventDateTime(sortedEvents[0])) : homeMonth;
  const maxMonth = addMonths(homeMonth, 2);
  const monthDate = calendarMonth || homeMonth;
  const currentMonthKey = monthKey(monthDate);
  const categories = [...new Set(events.map(getEventCategory))];
  const companies = [...new Set(events.map(event => event.company || event.organizer).filter(Boolean))];
  const modalities = [...new Set(events.map(event => event.modality).filter(Boolean))];
  const areas = [...new Set(events.flatMap(event => event.tags || []))];
  const filteredEvents = baseEvents.filter(event => {
    const selectedIso = selectedDate ? formatLocalISO(selectedDate) : null;
    return (!selectedIso || event.date === selectedIso)
      && (showAllEvents || selectedIso || event.date.startsWith(currentMonthKey))
      && (!eventType || getEventCategory(event) === eventType)
      && (!company || event.company === company || event.organizer === company)
      && (!modality || event.modality === modality)
      && (!area || event.tags?.includes(area));
  });
  const visibleEvents = showAllEvents ? filteredEvents : filteredEvents.slice(0, 9);
  const clearEventFilters = () => {
    setSelectedDate(null);
    setEventType('');
    setCompany('');
    setModality('');
    setArea('');
  };
  const openAllEvents = () => {
    setSelectedDate(null);
    setShowAllEvents(true);
  };
  const closeAllEvents = () => {
    setShowAllEvents(false);
  };
  const eventGridStyle = {
    display: 'grid',
    gridTemplateColumns: showAllEvents ? 'minmax(0, 1fr) minmax(0, 0fr)' : 'minmax(0, 1.5fr) minmax(0, 0.9fr)',
    gap: showAllEvents ? 0 : 24,
    alignItems: 'start',
    transition: 'grid-template-columns 0.34s cubic-bezier(0.22, 1, 0.36, 1), gap 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
  };
  const calendarCollapseStyle = {
    minWidth: 0,
    overflow: 'hidden',
    opacity: showAllEvents ? 0 : 1,
    transform: showAllEvents ? 'scale(0.98)' : 'scale(1)',
    pointerEvents: showAllEvents ? 'none' : 'auto',
    transition: 'opacity 0.22s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
  };
  const featuredGrowStyle = {
    minWidth: 0,
    transition: 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const featuredPanel = (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, padding: 20, viewTransitionName: 'eventos-card', transition: 'transform 0.22s ease, opacity 0.22s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, margin: 0, fontFamily: T.font }}>
            {showAllEvents ? 'Todos los eventos' : 'Eventos destacados'}
          </h2>
          {showAllEvents && (
            <p style={{ fontSize: 12, color: T.t3, marginTop: 5, fontFamily: T.font }}>
              {filteredEvents.length} eventos encontrados
            </p>
          )}
        </div>
        {showAllEvents ? (
          <button
            type="button"
            onClick={closeAllEvents}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.orange, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.font, whiteSpace: 'nowrap' }}
          >
            Volver al calendario <ChevronRightIcon size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openAllEvents}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.orange, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.font, whiteSpace: 'nowrap' }}
          >
            Ver todos los eventos <ChevronRightIcon size={14} />
          </button>
        )}
      </div>

      {visibleEvents.length === 0 ? (
        <div style={{ borderRadius: T.radiusCard, border: `1px solid ${T.border}`, padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: T.t3, fontFamily: T.font }}>
            No hay eventos con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleEvents.map(event => (
            <EventCard key={event.id} event={event} compact onClick={onEventClick} />
          ))}
        </div>
      )}
    </div>
  );

  const calendarStack = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 360 }}>
      <EventsCalendar
        events={events}
        monthDate={monthDate}
        selectedDate={selectedDate}
        minMonth={minMonth}
        maxMonth={maxMonth}
        onSelectDate={setSelectedDate}
        onMonthChange={(date) => {
          setCalendarMonth(startOfMonth(date));
          setSelectedDate(null);
        }}
        onToday={() => {
          setCalendarMonth(homeMonth);
          setSelectedDate(null);
        }}
      />
    </div>
  );

  return (
    <>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font, margin: 0 }}>Eventos</h1>
        <p style={{ fontSize: 14, color: T.t2, marginTop: 8, lineHeight: 1.5, fontFamily: T.font }}>
          Encuentra charlas, workshops y encuentros con empresas de Comillas Career.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Pill label={`Próximos (${upcoming.length})`} active={effectiveScope === 'proximos'} onClick={() => setScope('proximos')} />
        <Pill label={`Pasados (${past.length})`} active={effectiveScope === 'pasados'} onClick={() => setScope('pasados')} />
        <FilterDropdown label="Tipo de evento" options={categories} value={eventType} onChange={setEventType} />
        <FilterDropdown label="Empresa" options={companies} value={company} onChange={setCompany} />
        <FilterDropdown label="Modalidad" options={modalities} value={modality} onChange={setModality} />
        <FilterDropdown label="Área profesional" options={areas} value={area} onChange={setArea} />
        <button type="button"
          onClick={clearEventFilters}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: T.radiusPill, border: `1px solid ${T.border}`, backgroundColor: T.white, color: T.t2, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>
          <FilterIcon size={14} />
          Limpiar filtros
        </button>
      </div>

      {loading && <LoadingSkeleton />}

      {error && (
        <div style={{ borderRadius: T.radiusCard, padding: 16, backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p style={{ fontSize: 13, color: '#B91C1C', lineHeight: 1.5, fontFamily: T.font }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={eventGridStyle}>
          <div style={featuredGrowStyle}>
            {featuredPanel}
          </div>
          <div style={calendarCollapseStyle}>
            {calendarStack}
          </div>
        </div>
      )}
    </>
  );
}

// ── Placeholder para pestañas en construcción ─────────────────────────────────
function PreferenceField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.t1, marginBottom: 8, fontFamily: T.font }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleGroup({ options, value = [], onChange, disabled = false }) {
  const normalizedOptions = options.map(option => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
  const selectedValues = Array.isArray(value) ? value : [];

  function toggle(item) {
    if (disabled) return;
    const next = selectedValues.includes(item)
      ? selectedValues.filter(current => current !== item)
      : [...selectedValues, item];
    onChange(next);
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {normalizedOptions.map(option => {
        const active = selectedValues.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              borderRadius: T.radiusPill,
              border: `1px solid ${active ? T.orange : T.border}`,
              backgroundColor: active ? T.orangeBg : T.white,
              color: active ? '#B45309' : T.t2,
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              fontFamily: T.font,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectDropdown({ label, options = [], value = [], onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value.filter(Boolean) : [];
  const normalizedOptions = options.map(option => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));

  function toggle(item) {
    const next = selected.includes(item)
      ? selected.filter(current => current !== item)
      : [...selected, item];
    onChange(next);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => disabled ? null : setOpen(current => !current)}
        disabled={disabled}
        style={{
          width: '100%',
          minHeight: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          border: `1px solid ${selected.length ? T.orange : T.border}`,
          borderRadius: T.radiusInput,
          backgroundColor: selected.length ? T.orangeBg : T.white,
          color: selected.length ? '#B45309' : T.t2,
          padding: '9px 12px',
          fontSize: 13,
          fontWeight: selected.length ? 700 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          fontFamily: T.font,
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected.length ? selected.join(', ') : label}
        </span>
        <span style={{ color: T.t3, fontSize: 12 }}>▼</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 30,
            backgroundColor: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusInput,
            boxShadow: T.shadowElevated,
            maxHeight: 240,
            overflowY: 'auto',
          }}>
            {normalizedOptions.length === 0 ? (
              <p style={{ padding: 12, margin: 0, fontSize: 13, color: T.t3, fontFamily: T.font }}>
                No hay ubicaciones publicadas.
              </p>
            ) : normalizedOptions.map(option => {
              const active = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => disabled ? null : toggle(option.value)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    borderBottom: `1px solid ${T.border}`,
                    backgroundColor: active ? T.orangeBg : T.white,
                    color: active ? '#B45309' : T.t1,
                    padding: '10px 12px',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    fontFamily: T.font,
                    textAlign: 'left',
                  }}
                >
                  {option.label}
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TextInput({ value, onChange, type = 'text', placeholder, disabled = false }) {
  return (
    <input
      type={type}
      value={value || ''}
      placeholder={placeholder}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusInput,
        padding: '10px 12px',
        fontSize: 13,
        color: disabled ? T.t3 : T.t1,
        outline: 'none',
        fontFamily: T.font,
        backgroundColor: disabled ? T.hoverBg : T.white,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  );
}

function commaText(values = []) {
  return values.join(', ');
}

function parseCommaText(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeLanguagePreferences(languages = []) {
  return languages
    .map(language => (
      typeof language === 'string'
        ? { name: language, level: '' }
        : { name: language.name || '', level: language.level || '' }
    ))
    .filter(language => language.name);
}

function LanguagePreferences({ value = [], onChange, disabled = false }) {
  const languages = normalizeLanguagePreferences(Array.isArray(value) ? value : []);

  function updateLanguage(name, level) {
    const exists = languages.some(language => language.name === name);
    const next = exists
      ? languages.map(language => language.name === name ? { ...language, level } : language)
      : [...languages, { name, level }];
    onChange(next);
  }

  function removeLanguage(name) {
    onChange(languages.filter(language => language.name !== name));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {IDIOMAS.map(languageName => {
        const selected = languages.find(language => language.name === languageName);
        return (
          <div key={languageName} style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 132px',
            gap: 8,
            alignItems: 'center',
          }}>
            <button
              type="button"
              onClick={() => disabled ? null : (selected ? removeLanguage(languageName) : updateLanguage(languageName, 'B2'))}
              disabled={disabled}
              style={{
                padding: '9px 12px',
                borderRadius: T.radiusPill,
                border: `1px solid ${selected ? T.orange : T.border}`,
                backgroundColor: selected ? T.orangeBg : T.white,
                color: selected ? '#B45309' : T.t2,
                fontSize: 13,
                fontWeight: selected ? 700 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                fontFamily: T.font,
                textAlign: 'left',
              }}
            >
              {languageName}
            </button>
            <select
              value={selected?.level || ''}
              disabled={!selected || disabled}
              onChange={event => updateLanguage(languageName, event.target.value)}
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusInput,
                padding: '9px 10px',
                fontSize: 13,
                color: selected && !disabled ? T.t1 : T.t3,
                backgroundColor: selected && !disabled ? T.white : T.hoverBg,
                fontFamily: T.font,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="" disabled>Nivel</option>
              {NIVELES_IDIOMA.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function TabPerfil({ offers = [] }) {
  const { cv, dispatch } = useCv();
  const preferences = cv.preferences || {};
  const [prefsOpen, setPrefsOpen] = useState(true);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const locationOptions = [
    ...new Set([
      ...offers.map(offer => offer.location).filter(Boolean),
      ...(preferences.locations || []),
    ]),
  ].sort((a, b) => a.localeCompare(b, 'es'));

  function updatePreference(key, value) {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: { [key]: value } });
  }

  const completionItems = [
    preferences.locations?.length,
    preferences.modalities?.length,
    preferences.workdays?.length,
    preferences.sectors?.length,
    preferences.durations?.length,
    preferences.startDate,
    preferences.schedules?.length,
    preferences.languages?.length,
    preferences.technologies?.length,
    preferences.keywords?.length,
  ];
  const completed = completionItems.filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font, margin: 0 }}>Mi perfil</h1>
        <p style={{ fontSize: 14, color: T.t2, marginTop: 8, lineHeight: 1.5, fontFamily: T.font }}>
          Gestiona tus preferencias de prácticas para recibir mejores ofertas en base a tu perfil.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, border: `1px solid ${T.border}`, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.t1, margin: 0, fontFamily: T.font }}>
                Preferencias de prácticas
              </h2>
              <p style={{ fontSize: 13, color: T.t2, marginTop: 5, fontFamily: T.font }}>
                Completa tus opciones y guarda tus preferencias para que el sistema te recomiende mejor.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPrefsOpen(open => !open)}
                style={{
                  padding: '8px 14px',
                  borderRadius: T.radiusPill,
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.white,
                  color: T.t1,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: T.font,
                }}
              >
                {prefsOpen ? 'Plegar preferencias' : 'Desplegar preferencias'}
              </button>
              <button
                type="button"
                onClick={() => setEditingPrefs(editing => !editing)}
                style={{
                  padding: '8px 14px',
                  borderRadius: T.radiusPill,
                  border: 'none',
                  backgroundColor: editingPrefs ? T.orange : '#2563EB',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: T.font,
                }}
              >
                {editingPrefs ? 'Guardar' : 'Editar'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <span style={{ color: T.t2, fontSize: 13, fontFamily: T.font }}>
              Completado: {completed}/10 campos
            </span>
            <span style={{ color: completed >= 7 ? '#15803D' : '#B45309', fontWeight: 700, fontFamily: T.font }}>
              {completed >= 7 ? 'Perfil suficientemente completo' : 'Completa más campos para mejorar tu match'}
            </span>
          </div>

          {prefsOpen && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, alignItems: 'start', marginTop: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <PreferenceField label="Ubicación deseada">
                  <MultiSelectDropdown
                    label="Selecciona ubicaciones"
                    options={locationOptions}
                    value={preferences.locations || []}
                    onChange={value => updatePreference('locations', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Modalidad">
                  <ToggleGroup
                    options={MODALIDADES}
                    value={preferences.modalities || []}
                    onChange={value => updatePreference('modalities', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>
                <PreferenceField label="Jornada">
                  <ToggleGroup
                    options={JORNADAS}
                    value={preferences.workdays || []}
                    onChange={value => updatePreference('workdays', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Sector de interés">
                  <ToggleGroup
                    options={SECTORES}
                    value={preferences.sectors || []}
                    onChange={value => updatePreference('sectors', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Duración">
                  <ToggleGroup
                    options={DURACIONES}
                    value={preferences.durations || []}
                    onChange={value => updatePreference('durations', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Disponibilidad para inicio">
                  <TextInput
                    type="date"
                    value={preferences.startDate || ''}
                    onChange={value => updatePreference('startDate', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Añadir áreas o keywords propias">
                  <TextInput
                    value={commaText(preferences.keywords || [])}
                    onChange={value => updatePreference('keywords', parseCommaText(value))}
                    placeholder="Ej. renovables, estrategia, datos"
                    disabled={!editingPrefs}
                  />
                </PreferenceField>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <PreferenceField label="Horario">
                  <ToggleGroup
                    options={HORARIOS}
                    value={preferences.schedules || []}
                    onChange={value => updatePreference('schedules', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Idiomas">
                  <LanguagePreferences
                    value={preferences.languages || []}
                    onChange={value => updatePreference('languages', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>
                <PreferenceField label="Tecnologías">
                  <ToggleGroup
                    options={TECNOLOGIAS}
                    value={preferences.technologies || []}
                    onChange={value => updatePreference('technologies', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Añadir tecnologías propias">
                  <TextInput
                    value={commaText(preferences.technologies || [])}
                    onChange={value => updatePreference('technologies', parseCommaText(value))}
                    placeholder="Ej. Python, SQL, Power BI"
                    disabled={!editingPrefs}
                  />
                </PreferenceField>

                <PreferenceField label="Áreas de interés">
                  <ToggleGroup
                    options={AREAS_INTERES}
                    value={preferences.keywords || []}
                    onChange={value => updatePreference('keywords', value)}
                    disabled={!editingPrefs}
                  />
                </PreferenceField>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  userName,
  userDegree,
}) {
  const { token, user } = useAuth();
  const displayName = user?.name?.trim() || userName?.trim() || 'Usuario';
  const displayDetail = user?.email || userDegree || '';
  const firstName = displayName.split(' ')[0];

  const [activeSection, setActiveSection] = useState('inicio');
  const [offers,        setOffers]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError,   setEventsError]   = useState(null);
  const [eventScope,    setEventScope]    = useState('proximos');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState(null);
  const [applyingOfferId, setApplyingOfferId] = useState(null);
  const [savingOfferId, setSavingOfferId] = useState(null);
  const [advancingApplicationId, setAdvancingApplicationId] = useState(null);
  const [applyError, setApplyError] = useState(null);
  const [showAll,       setShowAll]       = useState(false);
  const [filters,     setFilters]     = useState({ sector: '', location: '', modality: '' });
  const [searchQuery, setSearchQuery] = useState('');

  function changeSection(key) {
    if (!document.startViewTransition) {
      setSelectedOffer(null);
      setSelectedApplication(null);
      setSelectedEvent(null);
      setActiveSection(key);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setSelectedOffer(null);
        setSelectedApplication(null);
        setSelectedEvent(null);
        setActiveSection(key);
      });
    });
  }

  // Carga de ofertas según filtros
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
      setShowAll(false);
    getOffers({
      type: 'practicas',
      ...(filters.sector   && { sector:   filters.sector }),
      ...(filters.location && { location: filters.location }),
      ...(filters.modality && { modality: filters.modality }),
    })
      .then(data => { if (active) setOffers(data); })
      .catch(() => { if (active) setError('No se pudo conectar con el servidor. Asegúrate de que está activo en el puerto 3001.'); })
      .finally(() => { if (active) setLoading(false); });
    });
    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setEventsLoading(true);
      setEventsError(null);
    getEvents()
      .then(data => { if (active) setEvents(data); })
      .catch(() => { if (active) setEventsError('No se pudieron cargar los eventos. Asegúrate de que el servidor está activo en el puerto 3001.'); })
      .finally(() => { if (active) setEventsLoading(false); });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!token) {
      Promise.resolve().then(() => {
        if (!active) return;
        setApplications([]);
        setApplicationsLoading(false);
      });
      return () => {
        active = false;
      };
    }

    Promise.resolve().then(() => {
      if (!active) return;
      setApplicationsLoading(true);
      setApplicationsError(null);
      getApplications(token)
        .then(data => {
          if (active) setApplications(data);
        })
        .catch(() => {
          if (active) setApplicationsError('No se pudieron cargar tus candidaturas.');
        })
        .finally(() => {
          if (active) setApplicationsLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [token]);

  const filteredOffers = useMemo(() => {
    if (!searchQuery.trim()) return offers;
    const q = searchQuery.toLowerCase();
    return offers.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.company?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.sector?.toLowerCase().includes(q) ||
      o.requirements?.keywords?.some(k => k.toLowerCase().includes(q))
    );
  }, [offers, searchQuery]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.organizer?.toLowerCase().includes(q) ||
      e.company?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  function handleSearchChange(q) {
    setSearchQuery(q);
  }

  function findApplicationForOffer(offerId) {
    return applications.find(application => application.offerId === offerId);
  }

  async function handleApplyToOffer(offer) {
    if (!token || !offer?.id || applyingOfferId) return;
    setApplyingOfferId(offer.id);
    setApplyError(null);
    try {
      const application = await applyToOffer(offer.id, token);
      setApplications(current => {
        const exists = current.some(item => item.id === application.id);
        return exists
          ? current.map(item => item.id === application.id ? application : item)
          : [application, ...current];
      });
      setSelectedApplication(application);
    } catch (err) {
      setApplyError(err.message || 'No se pudo crear la candidatura.');
    } finally {
      setApplyingOfferId(null);
    }
  }

  async function handleSaveOffer(offer) {
    if (!token || !offer?.id || savingOfferId) return;
    setSavingOfferId(offer.id);
    setApplyError(null);
    try {
      const application = await saveOffer(offer.id, token);
      setApplications(current => {
        const exists = current.some(item => item.id === application.id);
        return exists
          ? current.map(item => item.id === application.id ? application : item)
          : [application, ...current];
      });
      setSelectedApplication(application);
    } catch (err) {
      setApplyError(err.message || 'No se pudo guardar la oferta.');
    } finally {
      setSavingOfferId(null);
    }
  }

  async function handleAdvanceApplication(application) {
    if (!token || !application?.id || advancingApplicationId) return;
    setAdvancingApplicationId(application.id);
    try {
      const updated = await advanceApplication(application.id, token);
      setApplications(current => current.map(item => item.id === updated.id ? updated : item));
      setSelectedApplication(updated);
    } finally {
      setAdvancingApplicationId(null);
    }
  }

  // Vista de detalle de una oferta
  if (selectedOffer) {
    const offerApplication = selectedApplication?.offerId === selectedOffer.id
      ? selectedApplication
      : findApplicationForOffer(selectedOffer.id);

    return (
      <PortalLayout
        activeSection="ofertas"
        onSection={changeSection}
        onNavigate={onNavigate}
        userName={displayName}
        userDegree={displayDetail}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      >
        <OfferDetail
          offer={selectedOffer}
          application={offerApplication}
          applying={applyingOfferId === selectedOffer.id}
          saving={savingOfferId === selectedOffer.id}
          advancing={advancingApplicationId === offerApplication?.id}
          applyError={applyError}
          onApply={() => handleApplyToOffer(selectedOffer)}
          onSave={() => handleSaveOffer(selectedOffer)}
          onAdvanceApplication={() => handleAdvanceApplication(offerApplication)}
          onBack={() => {
            setSelectedOffer(null);
            setSelectedApplication(null);
            setApplyError(null);
          }}
        />
      </PortalLayout>
    );
  }

  if (selectedApplication) {
    return (
      <PortalLayout
        activeSection="candidaturas"
        onSection={changeSection}
        onNavigate={onNavigate}
        userName={displayName}
        userDegree={displayDetail}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      >
        <OfferDetail
          offer={selectedApplication.offer}
          application={selectedApplication}
          applying={applyingOfferId === selectedApplication.offerId}
          advancing={advancingApplicationId === selectedApplication.id}
          applyError={applyError}
          onApply={() => handleApplyToOffer(selectedApplication.offer)}
          onAdvanceApplication={() => handleAdvanceApplication(selectedApplication)}
          onBack={() => {
            setSelectedApplication(null);
            setApplyError(null);
          }}
        />
      </PortalLayout>
    );
  }

  // Vista de detalle de un evento
  if (selectedEvent) {
    return (
      <PortalLayout
        activeSection="eventos"
        onSection={changeSection}
        onNavigate={onNavigate}
        userName={displayName}
        userDegree={displayDetail}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      >
        <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      </PortalLayout>
    );
  }

  // Vista de resultados de búsqueda combinada
  function renderSearchResults() {
    const q = searchQuery.trim();
    const totalCount = filteredOffers.length + filteredEvents.length;

    return (
      <>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, lineHeight: 1.2, margin: 0, fontFamily: T.font }}>
            Resultados para &ldquo;{q}&rdquo;
          </h1>
          <p style={{ fontSize: 14, color: T.t2, marginTop: 8, fontFamily: T.font }}>
            {totalCount === 0
              ? 'No se encontraron resultados.'
              : `${totalCount} resultado${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Sección Ofertas */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.t1, margin: '0 0 12px', fontFamily: T.font }}>
            Ofertas y prácticas
            <span style={{ fontSize: 13, fontWeight: 400, color: T.t3, marginLeft: 8 }}>({filteredOffers.length})</span>
          </h2>
          {loading && <LoadingSkeleton />}
          {!loading && filteredOffers.length === 0 && (
            <p style={{ fontSize: 14, color: T.t3, fontFamily: T.font, padding: '16px 0' }}>
              No hay ofertas que coincidan con la búsqueda.
            </p>
          )}
          {!loading && filteredOffers.slice(0, 5).map((offer, idx) => (
            <OfferCard key={offer.id} offer={offer} rank={idx} onClick={() => setSelectedOffer(offer)} />
          ))}
          {!loading && filteredOffers.length > 5 && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); changeSection('ofertas'); }}
              style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font, padding: '8px 0' }}
            >
              Ver las {filteredOffers.length} ofertas →
            </button>
          )}
        </div>

        {/* Sección Eventos */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.t1, margin: '0 0 12px', fontFamily: T.font }}>
            Eventos
            <span style={{ fontSize: 13, fontWeight: 400, color: T.t3, marginLeft: 8 }}>({filteredEvents.length})</span>
          </h2>
          {eventsLoading && <LoadingSkeleton />}
          {!eventsLoading && filteredEvents.length === 0 && (
            <p style={{ fontSize: 14, color: T.t3, fontFamily: T.font, padding: '16px 0' }}>
              No hay eventos que coincidan con la búsqueda.
            </p>
          )}
          {!eventsLoading && filteredEvents.slice(0, 5).map(event => (
            <EventCard key={event.id} event={event} compact onClick={setSelectedEvent} />
          ))}
          {!eventsLoading && filteredEvents.length > 5 && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); changeSection('eventos'); }}
              style={{ fontSize: 13, fontWeight: 500, color: T.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font, padding: '8px 0' }}
            >
              Ver los {filteredEvents.length} eventos →
            </button>
          )}
        </div>
      </>
    );
  }

  // Contenido central según pestaña
  function renderContent() {
    switch (activeSection) {
      case 'inicio':
        if (searchQuery.trim()) return renderSearchResults();
        return (
          <TabInicio
            firstName={firstName}
            offers={filteredOffers}
            loading={loading}
            error={error}
            filters={filters}
            setFilters={setFilters}
            onOfferClick={setSelectedOffer}
            onSection={changeSection}
          />
        );
      case 'ofertas':
        return (
          <TabOfertas
            offers={filteredOffers}
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
        return (
          <TabCandidaturas
            applications={applications}
            loading={applicationsLoading}
            error={applicationsError}
            onApplicationClick={setSelectedApplication}
          />
        );
      case 'empresas':
        return <TabPlaceholder title="Empresas" />;
      case 'eventos':
        return (
          <TabEventos
            events={filteredEvents}
            loading={eventsLoading}
            error={eventsError}
            scope={eventScope}
            setScope={setEventScope}
            onEventClick={setSelectedEvent}
          />
        );
      case 'recursos':
        return <TabPlaceholder title="Recursos" />;
      case 'orientacion':
        return <OrientacionPanel />;
      case 'perfil':
        return <TabPerfil offers={filteredOffers} />;
      case 'ajustes':
        return <TabPlaceholder title="Ajustes" />;
      default:
        return null;
    }
  }

  return (
    <PortalLayout
      activeSection={activeSection}
      onSection={changeSection}
      onNavigate={onNavigate}
      userName={displayName}
      userDegree={displayDetail}
      rightPanel={(
        <CandidaturasPanel
          applications={applications}
          onSection={changeSection}
          onApplicationClick={setSelectedApplication}
          vtActive={activeSection === 'inicio'}
        />
      )}
      rightPanelVisible={activeSection === 'inicio'}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
    >
      {renderContent()}
    </PortalLayout>
  );
}
