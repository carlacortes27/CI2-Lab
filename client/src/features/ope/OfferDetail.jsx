import CompanyLogo from '../../components/ui/CompanyLogo.jsx';

// ── Tokens de diseño (idénticos a OpePortalPage) ─────────────────────────────
const T = {
  white:      '#FFFFFF',
  bg:         '#F6F7F9',
  orange:     '#F5A623',
  orangeBg:   '#FEF3E2',
  t1:         '#1A1A1A',
  t2:         '#6B7280',
  t3:         '#9CA3AF',
  border:     '#E5E7EB',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardRadius: 16,
  pillRadius: 9999,
  green:      '#16A34A',
  greenBg:    '#F0FDF4',
  red:        '#DC2626',
  redBg:      '#FEF2F2',
};

const card = {
  backgroundColor: T.white,
  borderRadius:    T.cardRadius,
  boxShadow:       T.cardShadow,
};

// ── Colores de marca (igual que OfferListItem) ────────────────────────────────
// ── Etiquetas ─────────────────────────────────────────────────────────────────
const MODALITY_LABEL = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };
const TYPE_LABEL     = { practicas: 'Prácticas',   empleo: 'Empleo' };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return d ? `${d}/${m}/${y}` : `${m}/${y}`;
}

const APPLICATION_PHASES = [
  { key: 'enviada', label: 'Inscrito' },
  { key: 'revision', label: 'CV revisado' },
  { key: 'entrevista', label: 'Entrevista' },
  { key: 'aceptada', label: 'Oferta final' },
  { key: 'finalizada', label: 'Finalizado' },
];

function ApplicationProgress({ application, onAdvance, onReject, advancing, rejecting }) {
  const activeIndex = Math.max(0, APPLICATION_PHASES.findIndex(phase => phase.key === application?.status));
  const isRejected = application?.status === 'rechazada';
  const isFinal = isRejected || activeIndex === APPLICATION_PHASES.length - 1;

  return (
    <div style={{ ...card, padding: '22px 28px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.t1, margin: 0 }}>Progreso de la candidatura</h2>
          <p style={{ fontSize: 13, color: T.t2, margin: '5px 0 0' }}>
            Fase actual: {isRejected ? 'Rechazada' : APPLICATION_PHASES[activeIndex]?.label}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            disabled={isFinal || advancing || rejecting}
            onClick={onAdvance}
            style={{
              padding: '10px 18px',
              borderRadius: T.pillRadius,
              backgroundColor: isFinal ? '#F3F4F6' : T.orange,
              color: isFinal ? T.t3 : T.white,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: isFinal || advancing || rejecting ? 'not-allowed' : 'pointer',
            }}
          >
            {advancing ? 'Actualizando...' : 'Siguiente fase'}
          </button>
          <button
            type="button"
            disabled={isFinal || advancing || rejecting}
            onClick={onReject}
            style={{
              padding: '10px 18px',
              borderRadius: T.pillRadius,
              backgroundColor: isRejected ? '#F3F4F6' : T.redBg,
              color: isRejected ? T.t3 : '#B91C1C',
              fontSize: 13,
              fontWeight: 700,
              border: `1px solid ${isRejected ? T.border : '#FECACA'}`,
              cursor: isFinal || advancing || rejecting ? 'not-allowed' : 'pointer',
            }}
          >
            {rejecting ? 'Actualizando...' : 'Rechazada'}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${APPLICATION_PHASES.length}, 1fr)`, gap: 8 }}>
        {APPLICATION_PHASES.map((phase, index) => {
          const completed = !isRejected && index <= activeIndex;
          return (
            <div key={phase.key}>
              <div style={{ height: 8, borderRadius: T.pillRadius, backgroundColor: isRejected ? T.redBg : completed ? T.orange : T.border }} />
              <p style={{
                margin: '7px 0 0',
                fontSize: 11,
                fontWeight: completed ? 700 : 500,
                color: completed ? T.t1 : T.t3,
                textAlign: 'center',
              }}>
                {phase.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Generadores de contenido de respaldo ──────────────────────────────────────
/**
 * Si la oferta no trae `responsibilities[]`, intenta construirlas desde la
 * descripción (frases separadas por ". ") y los keywords de los requisitos.
 */
function deriveResponsibilities(offer) {
  if (offer.responsibilities?.length) return offer.responsibilities;
  const sentences = (offer.description ?? '')
    .split(/\.\s+/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(s => s.length > 20);
  const kwItems = (offer.requirements?.keywords ?? [])
    .slice(0, 3)
    .map(k => `Trabajo con ${k}`);
  return [...sentences, ...kwItems].slice(0, 5);
}

/**
 * Si la oferta no trae `whatWeOffer[]`, genera beneficios genéricos razonables
 * en función del tipo y la modalidad.
 */
function deriveWhatWeOffer(offer) {
  if (offer.whatWeOffer?.length) return offer.whatWeOffer;
  const items = ['Aprendizaje en proyectos reales con impacto'];
  if (offer.type === 'practicas') items.push('Posibilidad de incorporación posterior');
  if (offer.modality !== 'remoto') items.push('Contacto con clientes nacionales e internacionales');
  items.push('Plan de desarrollo profesional');
  if (offer.duration && parseInt(offer.duration) >= 6) items.push('Formación interna y mentoring');
  return items.slice(0, 4);
}

// ── Iconos SVG ────────────────────────────────────────────────────────────────
function Ico({ children, size = 16, color, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

const ArrowLeft  = () => <Ico size={14} color={T.t3}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Ico>;
const PinIco     = ({ size = 14 }) => <Ico size={size} color={T.t3}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>;
const MonIco     = ({ size = 14 }) => <Ico size={size} color={T.t3}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Ico>;
const BriefIco   = ({ size = 14 }) => <Ico size={size} color={T.t3}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></Ico>;
const ClockIco   = ({ size = 14 }) => <Ico size={size} color={T.t3}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>;
const CalIco     = ({ size = 14, color }) => <Ico size={size} color={color ?? T.t3}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>;
const CheckCircle = ({ size = 16, color }) => <Ico size={size} color={color ?? T.orange}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Ico>;
const UserIco    = ({ size = 16 }) => <Ico size={size} color={T.t3}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;
const GlobeIco   = ({ size = 16 }) => <Ico size={size} color={T.t3}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Ico>;
const ListIco    = ({ size = 16 }) => <Ico size={size} color={T.t3}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Ico>;
const GiftIco    = ({ size = 16 }) => <Ico size={size} color={T.orange}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></Ico>;
const BookmarkIco = () => <Ico size={18} color={T.t2}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Ico>;
const ShareIco   = () => <Ico size={18} color={T.t2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Ico>;

// ── Subcomponentes ────────────────────────────────────────────────────────────

/** Píldora de metadato: icono + texto */
function MetaPill({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      color: T.t2, fontSize: 13,
    }}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

/** Separador vertical entre meta-pills */
function MetaSep() {
  return <span style={{ color: T.border, fontSize: 16, userSelect: 'none' }}>|</span>;
}

/** Tag de habilidad / etiqueta */
function Tag({ label, variant = 'default' }) {
  const styles = {
    default:  { bg: '#F3F4F6', color: T.t2 },
    orange:   { bg: T.orangeBg, color: '#92700A' },
    green:    { bg: T.greenBg,  color: T.green },
    blue:     { bg: '#EFF6FF',  color: '#2563EB' },
  };
  const s = styles[variant] ?? styles.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: T.pillRadius,
      backgroundColor: s.bg,
      color: s.color,
      fontSize: 13,
      fontWeight: 500,
    }}>
      {label}
    </span>
  );
}

/** Elemento de lista con checkmark naranja */
function CheckItem({ text }) {
  return (
    <li style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      fontSize: 14, color: T.t2, lineHeight: 1.6,
      listStyle: 'none',
    }}>
      <span style={{ flexShrink: 0, marginTop: 3 }}>
        <CheckCircle size={15} color={T.orange} />
      </span>
      {text}
    </li>
  );
}

/** Bloque de subsección de Requisitos */
function ReqBlock({ icon, label, children }) {
  return (
    <div>
      <p style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 700, color: T.t1,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 8,
      }}>
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

/** Cabecera de sección con icono */
function SectionHeader({ icon, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingBottom: 16,
      borderBottom: `1px solid ${T.border}`,
      marginBottom: 16,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        backgroundColor: T.orangeBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function OfferDetail({
  offer,
  onBack,
  application,
  onApply,
  onSave,
  onAdvanceApplication,
  onRejectApplication,
  applying = false,
  saving = false,
  advancing = false,
  rejecting = false,
  applyError,
}) {
  const typeLabel       = TYPE_LABEL[offer.type]     ?? offer.type;
  const modalityLabel   = MODALITY_LABEL[offer.modality] ?? offer.modality;
  const allTags         = [
    ...(offer.requirements?.hardSkills ?? []),
    ...(offer.requirements?.keywords   ?? []).slice(0, 2),
  ].slice(0, 6);
  const responsibilities = deriveResponsibilities(offer);
  const whatWeOffer      = deriveWhatWeOffer(offer);
  const languages        = offer.requirements?.languages ?? [];
  const isSaved = application?.status === 'guardada';
  const isApplied = Boolean(application) && !isSaved;

  return (
    <div style={{ padding: '28px 40px', backgroundColor: T.bg, minHeight: '100%' }}>

      {/* ── Breadcrumb + volver ─────────────────────────────────────────── */}
      <nav style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: T.t3, margin: 0 }}>
          <span style={{ cursor: 'pointer' }}
            onClick={onBack}
            onMouseEnter={e => { e.target.style.color = T.orange; }}
            onMouseLeave={e => { e.target.style.color = T.t3; }}>
            Inicio
          </span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ cursor: 'pointer' }}
            onClick={onBack}
            onMouseEnter={e => { e.target.style.color = T.orange; }}
            onMouseLeave={e => { e.target.style.color = T.t3; }}>
            Ofertas
          </span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: T.t1, fontWeight: 500 }}>{offer.title}</span>
        </p>
      </nav>

      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 500, color: T.t2,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px 0', marginBottom: 20,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = T.t1; }}
        onMouseLeave={e => { e.currentTarget.style.color = T.t2; }}
      >
        <ArrowLeft />
        Volver a ofertas
      </button>

      {/* ── Cabecera de la oferta ───────────────────────────────────────── */}
      <div style={{ ...card, padding: '28px 32px', marginBottom: 24 }}>

        {/* Fila superior: logo + título + acciones */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>

          {/* Logo empresa */}
          <CompanyLogo company={offer.company} size={80} style={{ borderRadius: 16 }} />

          {/* Título y metadatos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.t2, margin: '0 0 4px 0' }}>
              {offer.company}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.t1, margin: '0 0 16px 0', lineHeight: 1.25 }}>
              {offer.title}
            </h1>

            {/* Meta-pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MetaPill icon={<PinIco />}   text={offer.location} />
              <MetaSep />
              <MetaPill icon={<MonIco />}   text={modalityLabel} />
              <MetaSep />
              <MetaPill icon={<BriefIco />} text={typeLabel} />
              {offer.duration && (
                <>
                  <MetaSep />
                  <MetaPill icon={<ClockIco />} text={offer.duration} />
                </>
              )}
              {offer.publishedAt && (
                <>
                  <MetaSep />
                  <MetaPill icon={<CalIco />} text={`Publicada: ${formatDate(offer.publishedAt)}`} />
                </>
              )}
              {offer.deadlineAt && (
                <>
                  <MetaSep />
                  <MetaPill icon={<CalIco color="#DC2626" />} text={`Fecha límite: ${formatDate(offer.deadlineAt)}`} />
                </>
              )}
            </div>

            {/* Tags de habilidades */}
            {allTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allTags.map(tag => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            )}
          </div>

          {/* Acciones: guardar + compartir */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginTop: 4 }}>
            <button type="button" title={application ? 'Oferta guardada' : 'Guardar oferta'}
              disabled={Boolean(application) || saving}
              onClick={onSave}
              style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${T.border}`, cursor: application || saving ? 'default' : 'pointer', opacity: application ? 0.7 : 1 }}
              onMouseEnter={e => { if (!application && !saving) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <BookmarkIco />
            </button>
            <button type="button" title="Compartir oferta"
              style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${T.border}`, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <ShareIco />
            </button>
          </div>
        </div>
      </div>

      {isApplied && (
        <ApplicationProgress
          application={application}
          onAdvance={onAdvanceApplication}
          onReject={onRejectApplication}
          advancing={advancing}
          rejecting={rejecting}
        />
      )}

      {/* ── Grid: Descripción + Qué ofrece ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Descripción del puesto */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <SectionHeader
            icon={<ListIco size={16} />}
            title="Descripción del puesto"
          />
          <p style={{ fontSize: 14, color: T.t2, lineHeight: 1.75, margin: 0 }}>
            {offer.description}
          </p>
          {offer.sector && (
            <p style={{ fontSize: 12, color: T.t3, marginTop: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: T.pillRadius,
                backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: 11,
              }}>
                {offer.sector}
              </span>
            </p>
          )}
        </div>

        {/* Qué ofrece la empresa */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <SectionHeader
            icon={<GiftIco size={16} />}
            title="Qué ofrece la empresa"
          />
          <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {whatWeOffer.map((item, i) => (
              <CheckItem key={i} text={item} />
            ))}
          </ul>
        </div>
      </div>

      {/* ── Grid: Responsabilidades + Requisitos ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* Responsabilidades principales */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <SectionHeader
            icon={<ListIco size={16} />}
            title="Responsabilidades principales"
          />
          <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {responsibilities.map((item, i) => (
              <CheckItem key={i} text={item} />
            ))}
          </ul>
        </div>

        {/* Requisitos */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <SectionHeader
            icon={<BriefIco size={16} />}
            title="Requisitos"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Habilidades técnicas */}
            {offer.requirements?.hardSkills?.length > 0 && (
              <ReqBlock icon={<ListIco />} label="Habilidades técnicas">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {offer.requirements.hardSkills.map(s => (
                    <Tag key={s} label={s} variant="default" />
                  ))}
                </div>
              </ReqBlock>
            )}

            {/* Habilidades personales */}
            {offer.requirements?.softSkills?.length > 0 && (
              <ReqBlock icon={<UserIco />} label="Habilidades personales">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {offer.requirements.softSkills.map(s => (
                    <Tag key={s} label={s} variant="orange" />
                  ))}
                </div>
              </ReqBlock>
            )}

            {/* Idiomas */}
            {languages.length > 0 && (
              <ReqBlock icon={<GlobeIco />} label="Idiomas">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {languages.map(l => (
                    <Tag
                      key={l.name}
                      label={`${l.name} nivel ${l.level}/5`}
                      variant="blue"
                    />
                  ))}
                </div>
              </ReqBlock>
            )}

            {/* Experiencia mínima */}
            {offer.requirements?.minExperience && (
              <ReqBlock icon={<ClockIco />} label="Experiencia mínima">
                <p style={{ fontSize: 14, color: T.t2, margin: 0 }}>
                  {offer.requirements.minExperience}
                </p>
              </ReqBlock>
            )}

            {/* Titulaciones */}
            {offer.targetDegrees?.length > 0 && (
              <ReqBlock icon={<UserIco />} label="Titulaciones">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {offer.targetDegrees.map(d => (
                    <Tag key={d} label={d} variant="green" />
                  ))}
                </div>
              </ReqBlock>
            )}
          </div>
        </div>
      </div>

      {/* ── Botón de inscripción ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          disabled={isApplied || applying}
          onClick={onApply}
          style={{
            padding: '14px 36px',
            borderRadius: T.pillRadius,
            backgroundColor: isApplied ? T.green : T.orange,
            color: T.white,
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            cursor: isApplied || applying ? 'default' : 'pointer',
            transition: 'background-color 0.15s, transform 0.1s',
            boxShadow: `0 2px 8px rgba(245,166,35,0.35)`,
          }}
          onMouseEnter={e => { if (!isApplied && !applying) e.currentTarget.style.backgroundColor = '#D4880A'; }}
          onMouseLeave={e => { if (!isApplied && !applying) e.currentTarget.style.backgroundColor = T.orange; }}
          onMouseDown={e =>  { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e =>    { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isApplied ? 'Inscrito en la oferta' : applying ? 'Inscribiendo...' : 'Inscribirse en la oferta'}
        </button>

        <button
          type="button"
          disabled={Boolean(application) || saving}
          onClick={onSave}
          style={{
            padding: '14px 28px',
            borderRadius: T.pillRadius,
            backgroundColor: isSaved ? T.greenBg : 'transparent',
            color: isSaved ? T.green : T.t2,
            fontSize: 15,
            fontWeight: 500,
            border: `1px solid ${isSaved ? T.green : T.border}`,
            cursor: application || saving ? 'default' : 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            if (!application && !saving) {
              e.currentTarget.style.borderColor = T.t2;
              e.currentTarget.style.color = T.t1;
            }
          }}
          onMouseLeave={e => {
            if (!application && !saving) {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.t2;
            }
          }}
        >
          {isSaved ? 'Oferta guardada' : saving ? 'Guardando...' : 'Guardar oferta'}
        </button>
      </div>

      {applyError && (
        <p style={{ fontSize: 13, color: '#B91C1C', marginTop: 12 }}>
          {applyError}
        </p>
      )}

    </div>
  );
}
