/**
 * PortalLayout.jsx — Shell A del Portal OPE
 *
 * Estructura: posición fija pantalla completa (cubre Navbar global).
 * CSS Grid: Header (full width 88px) / Sidebar(260px) | Main(1fr) | RightPanel(380px, opcional)
 *
 * Props:
 *  activeSection   → clave de la sección activa en el sidebar
 *  onSection       → callback(key) al pulsar un ítem del sidebar
 *  onNavigate      → callback de navegación cross-shell
 *  userName        → nombre completo del usuario
 *  userDegree      → titulación / programa del usuario
 *  rightPanel      → JSX del panel derecho (opcional; si null, grid 2 columnas)
 *  children        → contenido del área central (main)
 */
import { T } from '../styles/theme.js';
import {
  HomeIcon, BriefcaseIcon, ClipboardIcon, BuildingIcon,
  CalendarIcon, BookIcon, CompassIcon, UserIcon, SettingsIcon,
  SearchIcon, BellIcon, MailIcon, ChevronDownIcon, TrophyIcon,
  ArrowLeftIcon,
} from '../components/ui/Icons.jsx';
import Avatar from '../components/ui/Avatar.jsx';

// ── Navegación ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'inicio',       label: 'Inicio',          Icon: HomeIcon      },
  { key: 'ofertas',      label: 'Ofertas',          Icon: BriefcaseIcon },
  { key: 'candidaturas', label: 'Mis candidaturas', Icon: ClipboardIcon },
  { key: 'empresas',     label: 'Empresas',         Icon: BuildingIcon  },
  { key: 'eventos',      label: 'Eventos',          Icon: CalendarIcon  },
  { key: 'recursos',     label: 'Recursos',         Icon: BookIcon      },
  { key: 'orientacion',  label: 'Orientación',      Icon: CompassIcon   },
  { key: 'perfil',       label: 'Mi perfil',        Icon: UserIcon      },
  { key: 'ajustes',      label: 'Ajustes',          Icon: SettingsIcon  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onSection, onNavigate }) {
  return (
    <aside style={{
      backgroundColor: T.white,
      borderRight:     `1px solid ${T.border}`,
      display:         'flex',
      flexDirection:   'column',
      overflowY:       'auto',
      overflowX:       'hidden',
      width:           260,
      flexShrink:      0,
    }}>
      {/* Botón Volver al homepage */}
      <div style={{ padding: '20px 16px 12px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             8,
            width:           '100%',
            padding:         '9px 14px',
            borderRadius:    T.radiusInput,
            border:          `1px solid ${T.border}`,
            backgroundColor: T.white,
            color:           T.t2,
            fontSize:        13,
            fontWeight:      500,
            cursor:          'pointer',
            fontFamily:      T.font,
            transition:      'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}
        >
          <ArrowLeftIcon size={15} color={T.t3} />
          Volver
        </button>
      </div>

      {/* Navegación */}
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSection(key)}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             12,
                width:           '100%',
                padding:         '11px 14px',
                borderRadius:    T.radiusInput,
                marginBottom:    2,
                backgroundColor: isActive ? T.orange : 'transparent',
                color:           isActive ? T.white : '#4B5563',
                fontSize:        14,
                fontWeight:      500,
                cursor:          'pointer',
                textAlign:       'left',
                border:          'none',
                transition:      'background-color 0.15s',
                fontFamily:      T.font,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = T.hoverBg; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Icon size={18} color={isActive ? T.white : T.t3} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* CTA "Completa tu perfil" — pie del sidebar */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <div style={{ backgroundColor: T.orange, borderRadius: T.radiusCard, padding: '20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{
              width:           36,
              height:          36,
              borderRadius:    10,
              flexShrink:      0,
              backgroundColor: 'rgba(255,255,255,0.25)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
            }}>
              <UserIcon size={18} color={T.white} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.white, lineHeight: 1.3, fontFamily: T.font }}>
                Completa tu perfil
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 1.4, fontFamily: T.font }}>
                y mejora tus recomendaciones
              </p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: T.radiusPill, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: '80%', backgroundColor: T.white, borderRadius: T.radiusPill }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: T.font }}>80%</span>
            <button
              type="button"
              onClick={() => onSection('perfil')}
              style={{
                fontSize:       12,
                fontWeight:     700,
                color:          T.white,
                textDecoration: 'underline',
                textUnderlineOffset: 2,
                background:     'none',
                border:         'none',
                cursor:         'pointer',
                fontFamily:     T.font,
              }}
            >
              Ver perfil →
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Header (88px, ancho completo) ─────────────────────────────────────────────
function PortalHeader({ userName, userDegree }) {
  return (
    <header style={{
      height:          88,
      backgroundColor: T.white,
      borderBottom:    `1px solid ${T.border}`,
      display:         'flex',
      alignItems:      'center',
      padding:         '0 40px',
      gap:             24,
      flexShrink:      0,
    }}>
      {/* Buscador centrado */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>
          <span style={{
            position:       'absolute',
            left:           16,
            top:            '50%',
            transform:      'translateY(-50%)',
            pointerEvents:  'none',
            display:        'flex',
            color:          T.t3,
          }}>
            <SearchIcon size={17} />
          </span>
          <input
            type="text"
            placeholder="Buscar empresas, posiciones o palabras clave"
            style={{
              width:          '100%',
              paddingLeft:    46,
              paddingRight:   20,
              paddingTop:     12,
              paddingBottom:  12,
              borderRadius:   T.radiusPill,
              border:         `1px solid ${T.border}`,
              fontSize:       14,
              color:          T.t1,
              backgroundColor: T.white,
              outline:        'none',
              fontFamily:     T.font,
              boxShadow:      T.shadowElevated,
            }}
            onFocus={e => {
              e.target.style.borderColor = T.orange;
              e.target.style.boxShadow   = `0 0 0 3px ${T.orangeBg}`;
            }}
            onBlur={e => {
              e.target.style.borderColor = T.border;
              e.target.style.boxShadow   = T.shadowElevated;
            }}
          />
        </div>
      </div>

      {/* Iconos + perfil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Campana */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={{
              width:           40,
              height:          40,
              borderRadius:    T.radiusPill,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              color:           T.t2,
              background:      'none',
              border:          'none',
              cursor:          'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <BellIcon size={20} />
          </button>
          <span style={{
            position:       'absolute',
            top:            4,
            right:          4,
            width:          16,
            height:         16,
            borderRadius:   T.radiusPill,
            backgroundColor:'#F97316',
            color:          T.white,
            fontSize:       9,
            fontWeight:     700,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            pointerEvents:  'none',
            fontFamily:     T.font,
          }}>
            2
          </span>
        </div>

        {/* Correo */}
        <button
          type="button"
          style={{
            width:           40,
            height:          40,
            borderRadius:    T.radiusPill,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           T.t2,
            background:      'none',
            border:          'none',
            cursor:          'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <MailIcon size={20} />
        </button>

        {/* Divisor */}
        <div style={{ width: 1, height: 28, backgroundColor: T.border, margin: '0 8px' }} />

        {/* Avatar + nombre */}
        <button
          type="button"
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        10,
            padding:    '8px 12px',
            borderRadius: T.radiusCard,
            background: 'none',
            border:     'none',
            cursor:     'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Avatar name={userName} size={36} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.t1, lineHeight: 1.3, fontFamily: T.font }}>
              {userName}
            </p>
            <p style={{ fontSize: 11, color: T.t3, lineHeight: 1.3, fontFamily: T.font }}>
              {userDegree}
            </p>
          </div>
          <span style={{ color: T.t3 }}>
            <ChevronDownIcon size={14} />
          </span>
        </button>
      </div>
    </header>
  );
}

// ── PortalLayout ──────────────────────────────────────────────────────────────
export default function PortalLayout({
  activeSection = 'inicio',
  onSection,
  onNavigate,
  userName   = 'Usuario',
  userDegree = 'ICAI',
  rightPanel,          // JSX del panel derecho (optional)
  children,            // contenido del área central
}) {
  const gridCols = rightPanel ? '260px 1fr 380px' : '260px 1fr';

  return (
    <div
      data-shell="portal"
      style={{
        position:    'fixed',
        inset:       0,
        zIndex:      50,
        display:     'flex',
        flexDirection:'column',
        fontFamily:  T.font,
        backgroundColor: T.bg,
      }}
    >
      {/* HEADER — 88px, ancho completo */}
      <PortalHeader userName={userName} userDegree={userDegree} />

      {/* GRID DE CONTENIDO */}
      <div style={{
        flex:               1,
        overflow:           'hidden',
        display:            'grid',
        gridTemplateColumns: gridCols,
      }}>
        {/* Sidebar */}
        <Sidebar
          active={activeSection}
          onSection={onSection}
          onNavigate={onNavigate}
        />

        {/* Área central */}
        <main style={{ overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {children}
        </main>

        {/* Panel derecho (opcional) */}
        {rightPanel && (
          <aside style={{
            overflowY:       'auto',
            padding:         24,
            backgroundColor: T.bg,
            borderLeft:      `1px solid ${T.border}`,
          }}>
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}