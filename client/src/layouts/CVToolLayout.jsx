/**
 * CVToolLayout.jsx — Shell B de la Herramienta CV
 *
 * Estructura: posición fija pantalla completa (cubre Navbar global).
 * Header (full width ~64px) + Grid: Sidebar(220px) | Workspace(1fr)
 *
 * Props:
 *  activeStep      → 'create' | 'improve' | 'preview'
 *  onNavigate      → callback de navegación cross-shell
 *  toolbarActions  → array de { label, onClick, primary? }
 *  children        → contenido del workspace (form + preview columns)
 */
import { T } from '../styles/theme.js';
import {
  ArrowLeftIcon,
  DownloadIcon,
  SpellcheckIcon,
  GlobeIcon,
  EyeIcon,
  FileTextIcon,
  UploadIcon,
} from '../components/ui/Icons.jsx';

// ── Escudo Comillas (mismo que PortalLayout) ──────────────────────────────────
function ComillasShield({ size = 32 }) {
  return (
    <svg viewBox="0 0 40 44" width={size} height={Math.round(size * 1.1)} fill="none" aria-hidden="true">
      <path
        d="M20 2L36 8V24C36 33 20 42 20 42C20 42 4 33 4 24V8Z"
        fill="#D4A017"
      />
      <path
        d="M20 14V30M13 22H27"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 2L36 8V24C36 33 20 42 20 42C20 42 4 33 4 24V8Z"
        stroke="#B8860B"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

// ── Ítems del flujo en el sidebar ─────────────────────────────────────────────
const STEPS = [
  { key: 'create',  label: 'Crear desde cero',   Icon: FileTextIcon  },
  { key: 'improve', label: 'Mejorar CV existente', Icon: UploadIcon   },
  { key: 'preview', label: 'Abrir vista previa',   Icon: EyeIcon      },
];

// ── Sidebar contextual (220px) ────────────────────────────────────────────────
function CVSidebar({ activeStep, onNavigate, onStep }) {
  return (
    <aside style={{
      width:           220,
      flexShrink:      0,
      backgroundColor: T.white,
      borderRight:     `1px solid ${T.border}`,
      display:         'flex',
      flexDirection:   'column',
      padding:         '24px 16px',
      overflowY:       'auto',
      gap:             8,
    }}>
      {/* Botón ← Volver */}
      <button
        type="button"
        onClick={() => onNavigate?.('home')}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        6,
          padding:    '8px 4px',
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          color:      T.t2,
          fontSize:   13,
          fontWeight: 500,
          fontFamily: T.font,
          marginBottom: 8,
        }}
        onMouseEnter={e => e.currentTarget.style.color = T.t1}
        onMouseLeave={e => e.currentTarget.style.color = T.t2}
      >
        <ArrowLeftIcon size={14} />
        Volver
      </button>

      {/* Label CV COMILLAS */}
      <p style={{
        fontSize:      10,
        fontWeight:    700,
        color:         T.orange,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily:    T.font,
        paddingLeft:   4,
        marginBottom:  2,
      }}>
        CV Comillas
      </p>

      {/* Título de la pantalla */}
      <h2 style={{
        fontSize:   18,
        fontWeight: 600,
        color:      T.t1,
        lineHeight: 1.2,
        fontFamily: T.font,
        paddingLeft: 4,
        marginBottom: 4,
      }}>
        Crear CV
      </h2>

      {/* Subtítulo */}
      <p style={{
        fontSize:   13,
        color:      T.t2,
        lineHeight: 1.5,
        fontFamily: T.font,
        paddingLeft: 4,
        marginBottom: 16,
      }}>
        Completa cada bloque y visualiza el resultado al instante.
      </p>

      {/* Lista de pasos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {STEPS.map(({ key, label, Icon }) => {
          const isActive = activeStep === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStep?.(key)}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             10,
                width:           '100%',
                padding:         '10px 12px',
                borderRadius:    T.radiusInput,
                border:          isActive ? 'none' : `1px solid ${T.border}`,
                backgroundColor: isActive ? T.orangeBg : T.white,
                color:           isActive ? T.t1 : T.t2,
                fontSize:        13,
                fontWeight:      isActive ? 600 : 400,
                cursor:          'pointer',
                textAlign:       'left',
                fontFamily:      T.font,
                transition:      'background-color 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = T.hoverBg; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = T.white; }}
            >
              <Icon size={15} color={isActive ? T.orange : T.t3} />
              {label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ── Header del Shell CV (64px, ancho completo) ────────────────────────────────
function CVHeader({ toolbarActions, onNavigate }) {
  return (
    <header style={{
      height:          64,
      backgroundColor: T.white,
      borderBottom:    `1px solid ${T.border}`,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      padding:         '0 32px',
      flexShrink:      0,
      gap:             24,
    }}>
      {/* Logo Comillas + label CV COMILLAS */}
      <button
        type="button"
        onClick={() => onNavigate?.('home')}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          padding:    0,
          flexShrink: 0,
        }}
      >
        <ComillasShield size={32} />
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
      </button>

      {/* Botones de toolbar action */}
      {toolbarActions && toolbarActions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {toolbarActions.map(({ label, onClick, loading: isLoading, primary = false }) => (
            <button
              key={label}
              type="button"
              disabled={!!isLoading}
              onClick={onClick}
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             6,
                padding:         '8px 14px',
                borderRadius:    T.radiusInput,
                border:          primary ? 'none' : `1px solid ${T.border}`,
                backgroundColor: primary ? T.t1 : T.white,
                color:           primary ? T.white : T.t1,
                fontSize:        13,
                fontWeight:      600,
                cursor:          isLoading ? 'not-allowed' : 'pointer',
                opacity:         isLoading ? 0.6 : 1,
                fontFamily:      T.font,
                whiteSpace:      'nowrap',
                transition:      'background-color 0.15s',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = primary ? '#2D2D2D' : T.hoverBg;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = primary ? T.t1 : T.white;
              }}
            >
              {isLoading ? `${label}...` : label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ── CVToolLayout ──────────────────────────────────────────────────────────────
export default function CVToolLayout({
  activeStep = 'create',
  onNavigate,
  toolbarActions = [],
  onStep,
  children,
}) {
  return (
    <div
      data-shell="cv"
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        50,
        display:       'flex',
        flexDirection: 'column',
        fontFamily:    T.font,
        backgroundColor: T.bg,
      }}
    >
      {/* HEADER — 64px, ancho completo */}
      <CVHeader toolbarActions={toolbarActions} onNavigate={onNavigate} />

      {/* GRID: Sidebar | Workspace */}
      <div style={{
        flex:               1,
        overflow:           'hidden',
        display:            'flex',
      }}>
        {/* Sidebar contextual */}
        <CVSidebar
          activeStep={activeStep}
          onNavigate={onNavigate}
          onStep={onStep}
        />

        {/* Workspace: área principal */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
