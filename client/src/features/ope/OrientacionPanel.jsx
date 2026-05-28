import { useState, useEffect } from 'react';
import { T, cardStyle } from '../../styles/theme.js';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MonitorIcon,
  BuildingIcon,
  CompassIcon,
  CheckIcon,
  GlobeIcon,
  ChevronRightIcon,
  Button,
} from '../../components/ui/index.js';
import { getAdvisors, getAppointments, createAppointment } from '../../lib/api.js';

// ── Constantes ────────────────────────────────────────────────────────────────

const REASONS = [
  'Revisión de CV',
  'Preparación de entrevistas',
  'Búsqueda de prácticas',
  'Orientación académica',
  'Otra consulta',
];

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ── Helpers de calendario (misma lógica que OpePortalPage/TabEventos) ─────────

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // lunes = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      iso: toISO(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      dow: date.getDay(), // 0 = domingo
    };
  });
}

function formatDateLong(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const wday = weekdays[date.getDay()];
  return `${wday.charAt(0).toUpperCase() + wday.slice(1)}, ${d} de ${MONTH_NAMES_ES[m - 1]} de ${y}`;
}

// ── OrientacionCalendar — mismo estilo que EventsCalendar en TabEventos ───────

function OrientacionCalendar({
  monthDate, selectedDate, availableDays,
  onSelectDate, onMonthChange, onToday,
  minMonth, maxMonth,
}) {
  const cells    = buildCalendarGrid(monthDate);
  const todayISO = toISO(new Date());
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(monthDate);
  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const canGoPrev = !minMonth || monthDate > minMonth;
  const canGoNext = !maxMonth || monthDate < maxMonth;

  return (
    <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, overflow: 'hidden' }}>
      {/* Cabecera con navegación */}
      <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, margin: 0, textTransform: 'capitalize', fontFamily: T.font }}>
          {monthLabel}
        </h2>
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

      {/* Grid de días */}
      <div style={{ padding: '8px 24px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
          {weekDays.map(day => (
            <span key={day} style={{ fontSize: 11, fontWeight: 700, color: T.t2, textAlign: 'center', fontFamily: T.font }}>{day}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {cells.map(cell => {
            const isSelected  = selectedDate === cell.iso;
            const isPast      = cell.iso < todayISO;
            const isAvailable = cell.inMonth && !isPast && availableDays.includes(cell.dow);

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectDate(cell.iso)}
                style={{
                  height: 42,
                  border: 'none',
                  borderRadius: T.radiusPill,
                  backgroundColor: isSelected ? T.orange : isAvailable ? T.orangeBg : 'transparent',
                  color: isSelected ? T.white : cell.inMonth ? T.t1 : T.t3,
                  fontSize: 14,
                  fontWeight: isSelected || isAvailable ? 700 : 400,
                  cursor: isAvailable ? 'pointer' : 'default',
                  position: 'relative',
                  fontFamily: T.font,
                  opacity: !cell.inMonth ? 0.35 : 1,
                }}
              >
                {cell.day}
                {isAvailable && !isSelected && (
                  <span style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 5,
                    transform: 'translateX(-50%)',
                    width: 5,
                    height: 5,
                    borderRadius: T.radiusPill,
                    backgroundColor: T.orange,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 24px 18px', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.t2, fontFamily: T.font }}>
          <span style={{ width: 7, height: 7, borderRadius: T.radiusPill, backgroundColor: T.orange }} />
          Disponible
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.t2, fontFamily: T.font }}>
          <span style={{ width: 14, height: 14, borderRadius: T.radiusPill, backgroundColor: T.orange, display: 'inline-block' }} />
          Seleccionado
        </span>
      </div>
    </div>
  );
}

// ── TimeSlots ─────────────────────────────────────────────────────────────────

function TimeSlots({ slots, selected, onSelect }) {
  if (!slots.length) {
    return (
      <p style={{ color: T.t3, fontSize: 13, fontStyle: 'italic', margin: 0, lineHeight: 1.6, fontFamily: T.font }}>
        Selecciona una fecha con disponibilidad en el calendario para ver los horarios.
      </p>
    );
  }

  const half = Math.ceil(slots.length / 2);
  const col1 = slots.slice(0, half);
  const col2 = slots.slice(half);

  function SlotBtn({ time }) {
    const active = time === selected;
    return (
      <button
        type="button"
        onClick={() => onSelect(time)}
        style={{
          padding: '8px 12px',
          border: `1.5px solid ${active ? T.orange : T.border}`,
          borderRadius: 8,
          background: active ? T.orangeBg : T.white,
          color: active ? T.orange : T.t1,
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          cursor: 'pointer',
          fontFamily: T.font,
          textAlign: 'center',
          width: '100%',
          transition: 'border-color 0.12s, background 0.12s',
        }}
      >
        {time}
      </button>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col1.map(t => <SlotBtn key={t} time={t} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col2.map(t => <SlotBtn key={t} time={t} />)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
        <GlobeIcon size={12} color={T.t3} />
        <span style={{ fontSize: 11, color: T.t3, fontFamily: T.font }}>Zona horaria: Madrid (CET)</span>
      </div>
    </div>
  );
}

// ── HistoryTable ──────────────────────────────────────────────────────────────

function HistoryTable({ appointments }) {
  const statusCfg = {
    Confirmada: { bg: '#DCFCE7', color: '#15803D' },
    Pendiente:  { bg: T.orangeBg, color: '#B45309' },
    Cancelada:  { bg: '#FEE2E2', color: '#B91C1C' },
  };
  const modalityIcon = {
    Online:     <MonitorIcon size={14} />,
    Presencial: <BuildingIcon size={14} />,
    Híbrida:    <UserIcon size={14} />,
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {['Fecha y hora', 'Orientador', 'Motivo', 'Modalidad', 'Estado'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 20px', fontSize: 11, fontWeight: 600, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map(apt => {
            const [, m, d] = apt.date.split('-').map(Number);
            const monthShort = MONTH_NAMES_ES[m - 1].slice(0, 3).toUpperCase();
            const st = statusCfg[apt.status] ?? statusCfg.Pendiente;

            return (
              <tr key={apt.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: T.orangeBg, borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.orange, lineHeight: 1 }}>{d}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: T.orange, letterSpacing: '0.04em', lineHeight: 1.4 }}>{monthShort}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: T.t1, fontWeight: 500 }}>
                        {String(d).padStart(2,'0')}/{String(m).padStart(2,'0')}/{apt.date.split('-')[0]}
                      </div>
                      <div style={{ fontSize: 12, color: T.t3 }}>{apt.time}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontWeight: 600, color: T.t1 }}>{apt.advisorName}</div>
                  <div style={{ fontSize: 11, color: T.t3, marginTop: 1 }}>{apt.advisorRole}</div>
                </td>
                <td style={{ padding: '14px 20px', color: T.t1 }}>{apt.reason}</td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.t2 }}>
                    {modalityIcon[apt.modality] ?? <MonitorIcon size={14} />}
                    <span>{apt.modality}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500 }}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── OrientacionPanel (principal) ──────────────────────────────────────────────

export default function OrientacionPanel() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const homeMonth = startOfMonth(today);
  const minMonth  = homeMonth;
  const maxMonth  = addMonths(homeMonth, 2);

  const [calMonth, setCalMonth]         = useState(homeMonth);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason]             = useState(REASONS[0]);
  const [modality, setModality]         = useState('Online');
  const [advisorId, setAdvisorId]       = useState('');
  const [comments, setComments]         = useState('');
  const [advisors, setAdvisors]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [booked, setBooked]             = useState(false);
  const [bookError, setBookError]       = useState('');

  useEffect(() => {
    Promise.all([getAdvisors(), getAppointments()])
      .then(([advs, apts]) => {
        setAdvisors(advs);
        if (advs.length) setAdvisorId(advs[0].id);
        setAppointments(apts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedAdvisor = advisors.find(a => a.id === advisorId);
  const availableDays   = selectedAdvisor?.availableDays ?? [];
  const slots           = selectedDate && selectedAdvisor ? selectedAdvisor.slots : [];

  function handleAdvisorChange(id) {
    setAdvisorId(id);
    setSelectedDate(null);
    setSelectedTime('');
  }

  function handleDateSelect(iso) {
    setSelectedDate(iso);
    setSelectedTime('');
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime || !advisorId) return;
    setSubmitting(true);
    setBookError('');
    try {
      const newApt = await createAppointment({
        advisorId, date: selectedDate, time: selectedTime,
        reason, modality, comments,
      });
      setAppointments(prev => [newApt, ...prev]);
      setBooked(true);
      setTimeout(() => setBooked(false), 5000);
      setSelectedDate(null);
      setSelectedTime('');
      setComments('');
    } catch {
      setBookError('No se pudo reservar la cita. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const canBook = Boolean(selectedDate && selectedTime && advisorId);

  if (loading) {
    return <div style={{ padding: 32, color: T.t3, fontFamily: T.font }}>Cargando orientación...</div>;
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusInput,
    fontSize: 13,
    color: T.t1,
    background: T.white,
    fontFamily: T.font,
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: T.t2,
    marginBottom: 5,
  };

  return (
    <>
      {/* Cabecera de sección */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: T.t1, fontFamily: T.font, margin: 0 }}>
          Orientación profesional
        </h1>
        <p style={{ fontSize: 14, color: T.t2, marginTop: 8, lineHeight: 1.5, fontFamily: T.font }}>
          Solicita una cita con la oficina de carreras y recibe apoyo personalizado.
        </p>
      </div>

      {/* Banner de confirmación */}
      {booked && (
        <div style={{ background: '#DCFCE7', border: `1px solid #BBF7D0`, borderRadius: T.radiusCard, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckIcon size={16} color="#15803D" />
          <span style={{ fontSize: 13, color: '#15803D', fontWeight: 500, fontFamily: T.font }}>
            ¡Cita reservada correctamente! Recibirás una confirmación en breve.
          </span>
        </div>
      )}

      {/* Layout de dos columnas: panel de reserva + calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>

        {/* ── Panel izquierdo: horarios + formulario ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Franjas horarias */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, margin: '0 0 6px', fontFamily: T.font }}>
              Selecciona un horario
            </h2>
            {selectedDate ? (
              <p style={{ fontSize: 13, color: T.t2, margin: '0 0 16px', fontFamily: T.font }}>
                {formatDateLong(selectedDate)}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: T.t3, margin: '0 0 16px', fontFamily: T.font }}>
                Selecciona una fecha disponible en el calendario →
              </p>
            )}
            <TimeSlots slots={slots} selected={selectedTime} onSelect={setSelectedTime} />
          </div>

          {/* Formulario de reserva */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, margin: '0 0 18px', fontFamily: T.font }}>
              Detalles de la cita
            </h2>

            {/* Motivo */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Motivo de la consulta</label>
              <select value={reason} onChange={e => setReason(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Modalidad */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Modalidad de la cita</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'Presencial', icon: <BuildingIcon size={14} /> },
                  { key: 'Online',     icon: <MonitorIcon  size={14} /> },
                  { key: 'Híbrida',    icon: <UserIcon     size={14} /> },
                ].map(({ key, icon }) => {
                  const active = modality === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setModality(key)}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        border: `1.5px solid ${active ? T.orange : T.border}`,
                        borderRadius: T.radiusInput,
                        background: active ? T.orangeBg : T.white,
                        color: active ? T.orange : T.t2,
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        fontFamily: T.font,
                        transition: 'border-color 0.12s, background 0.12s',
                      }}
                    >
                      {icon}
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fecha + Hora */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Fecha</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', border: `1px solid ${T.border}`, borderRadius: T.radiusInput, fontSize: 12, color: selectedDate ? T.t1 : T.t3, background: T.white, minHeight: 38, overflow: 'hidden' }}>
                  <CalendarIcon size={13} color={T.t3} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedDate ? formatDateLong(selectedDate) : 'Sin seleccionar'}
                  </span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hora</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', border: `1px solid ${T.border}`, borderRadius: T.radiusInput, fontSize: 13, color: selectedTime ? T.t1 : T.t3, background: T.white, minHeight: 38 }}>
                  <ClockIcon size={13} color={T.t3} style={{ flexShrink: 0 }} />
                  {selectedTime || '—'}
                </div>
              </div>
            </div>

            {/* Orientador */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Orientador disponible</label>
              <select
                value={advisorId}
                onChange={e => handleAdvisorChange(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {advisors.map(a => (
                  <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
                ))}
              </select>
            </div>

            {/* Comentarios */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>
                Comentarios adicionales{' '}
                <span style={{ color: T.t3, fontWeight: 400 }}>(opcional)</span>
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value.slice(0, 250))}
                placeholder="Cuéntanos brevemente el objetivo de tu consulta y/o preguntas específicas."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: T.t3, marginTop: 2 }}>
                {comments.length} / 250 caracteres
              </div>
            </div>

            {bookError && (
              <p style={{ fontSize: 12, color: '#B91C1C', margin: '0 0 12px', fontFamily: T.font }}>{bookError}</p>
            )}

            {/* Botón reservar */}
            <button
              type="button"
              onClick={handleBook}
              disabled={!canBook || submitting}
              style={{
                width: '100%',
                padding: '13px 16px',
                background: canBook && !submitting ? T.orange : T.border,
                border: 'none',
                borderRadius: T.radiusInput,
                color: canBook && !submitting ? '#fff' : T.t3,
                fontSize: 14,
                fontWeight: 600,
                cursor: canBook && !submitting ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: T.font,
                transition: 'background 0.15s',
              }}
            >
              <CalendarIcon size={16} />
              {submitting ? 'Reservando...' : 'Reservar cita'}
            </button>

            <p style={{ fontSize: 11, color: T.t3, textAlign: 'center', margin: '10px 0 0', fontFamily: T.font }}>
              🔒 Tu cita es personal y confidencial. Puedes cancelarla o reprogramarla desde "Mis citas".
            </p>
          </div>
        </div>

        {/* ── Columna derecha: orientador + calendario ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selector de orientador encima del calendario */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, padding: 20 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: T.t1, fontFamily: T.font }}>
              Orientador
            </p>
            <select
              value={advisorId}
              onChange={e => handleAdvisorChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusInput,
                fontSize: 13,
                color: T.t1,
                background: T.white,
                fontFamily: T.font,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {advisors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {selectedAdvisor && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: T.t2, fontFamily: T.font }}>
                {selectedAdvisor.role}
              </p>
            )}
          </div>

          <OrientacionCalendar
            monthDate={calMonth}
            selectedDate={selectedDate}
            availableDays={availableDays}
            minMonth={minMonth}
            maxMonth={maxMonth}
            onSelectDate={handleDateSelect}
            onMonthChange={date => { setCalMonth(startOfMonth(date)); setSelectedDate(null); setSelectedTime(''); }}
            onToday={() => { setCalMonth(homeMonth); setSelectedDate(null); setSelectedTime(''); }}
          />
        </div>
      </div>

      {/* ── Historial de citas ── */}
      {appointments.length > 0 && (
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, boxShadow: T.shadowCard, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.t1, fontFamily: T.font }}>
              Historial de citas
            </h2>
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.orange, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.font }}
            >
              Ver historial completo
              <ChevronRightIcon size={14} />
            </button>
          </div>
          <HistoryTable appointments={appointments} />
        </div>
      )}
    </>
  );
}
