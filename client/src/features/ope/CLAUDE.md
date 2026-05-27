# Zona: Portal OPE — UI (Persona 4)

## Archivos de este módulo
- `OpePortalPage.jsx` — página principal del portal OPE
- `OfferListItem.jsx` — componente de una oferta en el listado
- `OfferDetail.jsx` — vista de detalle de una oferta

## Archivos compartidos que puedes usar (solo lectura)
- `src/lib/api.js` — `getOffers(filters)`, `getOfferById(id)` (llaman al servidor)
- `src/components/` — widgets genéricos

## Filtros disponibles en getOffers()
```js
getOffers({ type, sector, location, modality, degree, skill, language })
```
- `type`: `'practicas'` | `'empleo'`
- `sector`: string (ej. `'tecnología'`)
- `location`: string
- `modality`: `'presencial'` | `'hibrido'` | `'remoto'`
- `degree`: titulación (busca en `targetDegrees[]`)
- `skill`: habilidad técnica (busca en `requirements.hardSkills[]`)
- `language`: idioma (busca en `requirements.languages[].name`)

## Para añadir una ruta nueva
Edita **`src/routes.config.js`** añadiendo tu línea en la sección P4.
No toques `App.jsx` ni `Navbar.jsx`.

## PROHIBIDO tocar
- `src/features/home/` — zona de Persona 1
- `src/features/editor/` — zona de Persona 2
- `src/features/pdf/` — zona de Persona 3
- `server/src/data/offers.json` y `server/src/routes/offers.js` — zona de Persona 5
  (si necesitas un campo nuevo en las ofertas, coordínalo con P5)
- `src/routes.config.js` — solo añade tu línea, no modifiques las líneas de otros
- `src/App.jsx` y `src/components/Navbar.jsx` — archivos congelados

## Contratos relevantes
Lee `docs/data-model.md`, especialmente el objeto `Offer`.
Los datos de las ofertas son sintéticos (no hay scraping real). La API corre en
`http://localhost:3001` durante desarrollo. En producción usa el proxy de Vite (`/api`).
