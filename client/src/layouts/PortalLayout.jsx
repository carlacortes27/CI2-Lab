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
import { useEffect, useRef, useState } from 'react';
import { T } from '../styles/theme.js';
import icaiLogo from '../assets/imagen comillas.jpg';
import { useAuth } from '../context/useAuth.js';
import { useCv } from '../context/CvContext.jsx';
import { calcProfileCompletion } from '../lib/profileCompletion.js';
import {
  HomeIcon, BriefcaseIcon, ClipboardIcon,
  CalendarIcon, BookIcon, CompassIcon, UserIcon,
  SearchIcon, BellIcon, MailIcon, ChevronDownIcon,
  ArrowLeftIcon,
} from '../components/ui/Icons.jsx';
import Avatar from '../components/ui/Avatar.jsx';

// ── Navegación ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'inicio',       label: 'Inicio',          Icon: HomeIcon      },
  { key: 'ofertas',      label: 'Ofertas',          Icon: BriefcaseIcon },
  { key: 'candidaturas', label: 'Mis candidaturas', Icon: ClipboardIcon },
  { key: 'eventos',      label: 'Eventos',          Icon: CalendarIcon  },
  { key: 'recursos',     label: 'Recursos',         Icon: BookIcon      },
  { key: 'orientacion',  label: 'Orientación',      Icon: CompassIcon   },
  { key: 'perfil',       label: 'Mi perfil',        Icon: UserIcon      },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onSection, onNavigate }) {
  const { cv } = useCv();
  const progress = calcProfileCompletion(cv);
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
      <nav style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
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
                {progress === 100 ? 'Perfil completo' : 'Completa tu perfil'}
              </p>
              {progress < 100 && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 1.4, fontFamily: T.font }}>
                  y mejora tus recomendaciones
                </p>
              )}
            </div>
          </div>
          {/* Barra de progreso */}
          <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: T.radiusPill, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: T.white, borderRadius: T.radiusPill, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: T.font }}>{progress}%</span>
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
function PortalHeader({ userName, userDegree, searchQuery = '', onSearchChange, onSection, onNavigate }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function openMenu() {
    setMenuOpen(true);
    requestAnimationFrame(() => itemRefs.current[0]?.focus());
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleButtonKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu();
    }
  }

  function handleMenuKeyDown(event, index) {
    const items = itemRefs.current.filter(Boolean);
    const lastIndex = items.length - 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[index === lastIndex ? 0 : index + 1]?.focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[index === 0 ? lastIndex : index - 1]?.focus();
    }

    if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    }

    if (event.key === 'End') {
      event.preventDefault();
      items[lastIndex]?.focus();
    }
  }

  function handleProfile() {
    closeMenu();
    onSection?.('perfil');
  }

  async function handleSwitchAccount() {
    closeMenu();
    await logout();
    onNavigate?.('login');
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    onNavigate?.('home');
  }

  const menuItems = [
    { label: 'Mi perfil', action: handleProfile },
    { label: 'Cambiar cuenta', action: handleSwitchAccount },
    { label: 'Cerrar sesión', action: handleLogout, danger: true },
  ];

  return (
    <header className="portal-shell-header" style={{
      minHeight:       96,
      backgroundColor: T.white,
      borderBottom:    `1px solid ${T.border}`,
      display:         'flex',
      alignItems:      'center',
      padding:         '18px 40px',
      gap:             24,
      flexShrink:      0,
      flexWrap:        'wrap',
      position:        'relative',
      zIndex:          2,
    }}>
      <div className="shell-brand" style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, minWidth: 0 }}>
        <img
          src={icaiLogo}
          alt="ICAI Universidad Pontificia Comillas"
          style={{
            width:      42,
            maxWidth:   '42vw',
            height:     42,
            objectFit:  'contain',
            flexShrink: 0,
          }}
        />
        <div style={{ textAlign: 'left' }}>
          <p style={{
            fontSize:      13,
            fontWeight:    800,
            color:         T.t1,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight:    1,
            fontFamily:    T.font,
          }}>
            CV Comillas
          </p>
          <p style={{
            fontSize:   10,
            fontWeight: 400,
            color:      T.t3,
            marginTop:  2,
            lineHeight: 1,
            fontFamily: T.font,
          }}>
            Comillas Career
          </p>
        </div>
      </div>

      {/* Buscador centrado */}
      <div className="portal-search" style={{ flex: '1 1 360px', minWidth: 220, display: 'flex', justifyContent: 'center' }}>
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
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
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
      <div className="portal-user-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="portal-profile-menu"
            onClick={() => setMenuOpen(open => !open)}
            onKeyDown={handleButtonKeyDown}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        10,
              padding:    '8px 12px',
              borderRadius: T.radiusCard,
              background: menuOpen ? T.hoverBg : 'none',
              border:     'none',
              cursor:     'pointer',
              boxShadow:  menuOpen ? T.shadowElevated : 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBg}
            onMouseLeave={e => {
              if (!menuOpen) e.currentTarget.style.backgroundColor = 'transparent';
            }}
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
            <span
              style={{
                color: T.t3,
                display: 'flex',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            >
              <ChevronDownIcon size={14} />
            </span>
          </button>

          {menuOpen && (
            <div
              id="portal-profile-menu"
              role="menu"
              aria-label="Menú de usuario"
              style={{
                position:        'absolute',
                top:             'calc(100% + 8px)',
                right:           0,
                zIndex:          10,
                minWidth:        220,
                padding:         6,
                borderRadius:    T.radiusCard,
                border:          `1px solid ${T.border}`,
                backgroundColor: T.white,
                boxShadow:       T.shadowElevated,
              }}
            >
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitem"
                  onClick={item.action}
                  onKeyDown={(event) => handleMenuKeyDown(event, index)}
                  style={{
                    width:           '100%',
                    display:         'flex',
                    alignItems:      'center',
                    padding:         '10px 12px',
                    borderRadius:    T.radiusInput,
                    border:          'none',
                    backgroundColor: 'transparent',
                    color:           item.danger ? '#991B1B' : T.t1,
                    fontSize:        13,
                    fontWeight:      600,
                    fontFamily:      T.font,
                    textAlign:       'left',
                    cursor:          'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = item.danger ? '#FEF2F2' : T.hoverBg}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  onFocus={e => e.currentTarget.style.backgroundColor = item.danger ? '#FEF2F2' : T.hoverBg}
                  onBlur={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const ANIMATION_STYLES = `
  @keyframes portalTabIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Suprime el crossfade global — sólo animan los elementos con nombre */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  /* Slide + scale para el título "Ofertas" y los filtros */
  ::view-transition-group(ofertas-heading),
  ::view-transition-group(ofertas-filters) {
    animation-duration: 0.38s;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Expansión de la tarjeta Mis candidaturas */
  ::view-transition-group(cand-card) {
    animation-duration: 0.45s;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Expansión de la tarjeta Próximos eventos → panel Eventos */
  ::view-transition-group(eventos-card) {
    animation-duration: 0.5s;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  ::view-transition-old(eventos-card) {
    animation-duration: 0.2s;
    animation-timing-function: ease-out;
  }
  ::view-transition-new(eventos-card) {
    animation-duration: 0.35s;
    animation-delay: 0.15s;
    animation-timing-function: ease-out;
  }
`;

// ── PortalLayout ──────────────────────────────────────────────────────────────
export default function PortalLayout({
  activeSection     = 'inicio',
  onSection,
  onNavigate,
  userName          = 'Usuario',
  userDegree        = 'ICAI',
  rightPanel,
  rightPanelVisible = !!rightPanel,
  searchQuery       = '',
  onSearchChange,
  children,
}) {
  return (
    <div
      data-shell="portal"
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          50,
        display:         'flex',
        flexDirection:   'column',
        fontFamily:      T.font,
        backgroundColor: T.bg,
      }}
    >
      <style>{ANIMATION_STYLES}</style>

      {/* HEADER — 88px, ancho completo */}
      <PortalHeader
        userName={userName}
        userDegree={userDegree}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSection={onSection}
        onNavigate={onNavigate}
      />

      {/* CONTENIDO: sidebar | main | panel derecho */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Sidebar */}
        <Sidebar
          active={activeSection}
          onSection={onSection}
          onNavigate={onNavigate}
        />

        {/* Área central — cada cambio de pestaña anima la entrada */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '32px 40px' }}>
          <div
            key={activeSection}
            style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'portalTabIn 0.25s ease both' }}
          >
            {children}
          </div>
        </main>

        {/* Panel derecho: siempre montado, colapsa con transición */}
        {!!rightPanel && (
          <aside style={{
            width:      rightPanelVisible ? 380 : 0,
            flexShrink: 0,
            overflow:   'hidden',
            transition: rightPanelVisible
              ? 'width 0.35s cubic-bezier(0.22,1,0.36,1)'
              : 'width 0.35s cubic-bezier(0.22,1,0.36,1) 0.15s',
          }}>
            <div style={{
              width:           380,
              height:          '100%',
              overflowY:       'auto',
              padding:         24,
              boxSizing:       'border-box',
              backgroundColor: T.bg,
              borderLeft:      `1px solid ${T.border}`,
              opacity:         rightPanelVisible ? 1 : 0,
              transition:      rightPanelVisible
                ? 'opacity 0.2s ease 0.1s'
                : 'opacity 0.15s ease',
            }}>
              {rightPanel}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
