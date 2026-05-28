/**
 * OpePortalPage.jsx — Portal OPE (Shell A)
 *
 * Usa PortalLayout para la estructura de shells (header + sidebar + grid).
 * Gestiona las pestañas y el estado de datos.
 */
import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { getOffers, getEvents } from '../../lib/api.js';
import { useAuth } from '../../context/useAuth.js';
import OfferDetail        from './OfferDetail.jsx';
import EventDetail        from './EventDetail.jsx';
import PortalLayout       from '../../layouts/PortalLayout.jsx';
import { T }              from '../../styles/theme.js';
import {
  OfferCard,
  ApplicationCard,
  StatBox,
  FilterDropdown,
  Badge,
  Button,
  Card,
  Pill,
  TrophyIcon,
  CalendarIcon,
  BookIcon,
  FilterIcon,
  PinIcon,
  ClockIcon,
  UserIcon,
  ChevronRightIcon,
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
function CandidaturasPanel({ onSection, vtActive = false }) {
  const counts = {
    enviadas:   8,
    revision:   MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length,
    entrevista: MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length,
    aceptada:   MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length,
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
function TabInicio({ firstName, offers, loading, error, showAll, setShowAll, filters, setFilters, onOfferClick, onSection }) {
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
function TabCandidaturas() {
  const counts = {
    enviadas:   8,
    revision:   MOCK_CANDIDATURAS.filter(c => c.status === 'revision').length,
    entrevista: MOCK_CANDIDATURAS.filter(c => c.status === 'entrevista').length,
    aceptada:   MOCK_CANDIDATURAS.filter(c => c.status === 'aceptada').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, viewTransitionName: 'cand-card' }}>
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
  const { user } = useAuth();
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAll,       setShowAll]       = useState(false);
  const [filters, setFilters] = useState({ sector: '', location: '', modality: '' });

  function changeSection(key) {
    if (!document.startViewTransition) {
      setActiveSection(key);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => setActiveSection(key));
    });
  }

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

  useEffect(() => {
    setEventsLoading(true);
    setEventsError(null);
    getEvents()
      .then(data => setEvents(data))
      .catch(() => setEventsError('No se pudieron cargar los eventos. Asegúrate de que el servidor está activo en el puerto 3001.'))
      .finally(() => setEventsLoading(false));
  }, []);

  // Vista de detalle de una oferta
  if (selectedOffer) {
    return (
      <PortalLayout
        activeSection="ofertas"
        onSection={changeSection}
        onNavigate={onNavigate}
        userName={displayName}
        userDegree={displayDetail}
      >
        <OfferDetail offer={selectedOffer} onBack={() => setSelectedOffer(null)} />
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
      >
        <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      </PortalLayout>
    );
  }

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
            onSection={changeSection}
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
        return (
          <TabEventos
            events={events}
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
      onSection={changeSection}
      onNavigate={onNavigate}
      userName={displayName}
      userDegree={displayDetail}
      rightPanel={<CandidaturasPanel onSection={changeSection} vtActive={activeSection === 'inicio'} />}
      rightPanelVisible={activeSection === 'inicio'}
    >
      {renderContent()}
    </PortalLayout>
  );
}
