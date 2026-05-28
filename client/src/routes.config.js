/**
 * routes.config.js — Registro central de rutas de la aplicación
 *
 * REGLA: cada persona añade SOLO su propia línea. No tocar las demás.
 *   P1 (UI / Shell)  → ruta 'home'
 *   P2 (Editor CV)   → rutas 'create' y 'preview'
 *   P3 (PDF)         → ruta 'upload'
 *   P4 (Portal OPE)  → ruta 'ope'
 *
 * App.jsx y Navbar.jsx leen este archivo automáticamente.
 * NO modificar App.jsx ni Navbar.jsx para añadir rutas nuevas.
 */

// ── P1: UI general ────────────────────────────────────────────────────────────
import HomePage from './features/home/HomePage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';

// ── P2: Editor de CV ──────────────────────────────────────────────────────────
import CreateCVPage   from './features/editor/CreateCVPage.jsx';
import CVPreviewPage  from './features/editor/CVPreviewPage.jsx';

// ── P3: Importación / exportación PDF ────────────────────────────────────────
import UploadCVPage from './features/pdf/UploadCVPage.jsx';

// ── P4: Portal OPE ───────────────────────────────────────────────────────────
import OpePortalPage from './features/ope/OpePortalPage.jsx';

/**
 * @typedef  {Object} RouteConfig
 * @property {string}  key       - Identificador único de la ruta (usado en onNavigate)
 * @property {string}  label     - Texto que aparece en la barra de navegación
 * @property {boolean} nav       - true → se muestra en el Navbar
 * @property {React.ComponentType} Page - Componente a renderizar
 */

/** @type {RouteConfig[]} */
export const ROUTES = [
  // ── P1 ──────────────────────────────────────────────────────────────────────
  { key: 'home',    label: 'Inicio',       nav: true,  Page: HomePage },
  { key: 'login',   label: 'Login',        nav: false, Page: LoginPage },
  { key: 'register', label: 'Registro',    nav: false, Page: RegisterPage },

  // ── P2 ──────────────────────────────────────────────────────────────────────
  { key: 'create',  label: 'Crear CV',     nav: true,  Page: CreateCVPage },
  { key: 'preview', label: 'Vista previa', nav: true,  Page: CVPreviewPage },

  // ── P3 ──────────────────────────────────────────────────────────────────────
  { key: 'upload',  label: 'Subir CV',     nav: true,  Page: UploadCVPage },

  // ── P4 ──────────────────────────────────────────────────────────────────────
  { key: 'ope',     label: 'Portal OPE',   nav: true,  Page: OpePortalPage },
];
