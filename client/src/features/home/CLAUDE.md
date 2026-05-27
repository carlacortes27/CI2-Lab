# Zona: UI general / Landing (Persona 1)

## Archivos de este módulo
- `HomePage.jsx` — página de inicio

## Archivos compartidos que puedes usar (solo lectura)
- `src/context/CvContext.jsx` — estado global del CV
- `src/lib/api.js` — cliente HTTP
- `src/components/` — componentes genéricos (TextField, Navbar…)
- `src/App.css` — estilos globales (puedes añadir clases)

## Para añadir una ruta nueva
Edita **`src/routes.config.js`** añadiendo tu línea en la sección P1.
No toques `App.jsx` ni `Navbar.jsx`.

## PROHIBIDO tocar
- `src/features/editor/` — zona de Persona 2
- `src/features/pdf/` — zona de Persona 3
- `src/features/ope/` — zona de Persona 4
- `server/` — zona de Persona 5
- `src/context/CvContext.jsx` — contrato compartido; cambios vía PR a `docs/data-model.md`
- `src/routes.config.js` — solo añade tu línea, no modifiques las líneas de otros

## Contratos relevantes
Lee `docs/data-model.md` antes de cualquier cambio que afecte al objeto `CV`.
