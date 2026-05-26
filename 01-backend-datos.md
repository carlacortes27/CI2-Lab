# WS1 — Backend, datos y portal OPE simulado

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Construir el servidor Express, la API, el dataset sintético de ofertas y la interfaz del
portal OPE simulado. WS1 establece además el esqueleto del servidor sobre el que WS3 y WS5
registran sus rutas.

## 2. Alcance

**Incluido**
- Servidor Express (ES Modules), arranque en puerto 3001, script `npm run dev`.
- Middleware base: CORS restringido a `http://localhost:3000`, parser JSON, manejador de
  errores centralizado.
- Estructura de rutas modular en `routes/` para que WS3 y WS5 puedan añadir sus routers.
- Endpoints: `GET /api/health`, `GET /api/offers`, `GET /api/offers/:id`.
- Dataset sintético de ofertas en `server/src/data/offers.json`.
- Lógica de filtrado de ofertas por query params.
- Página React del portal OPE simulado: listado, filtros y vista de detalle.
- Cliente API en `client/src/lib/api.js` para consumir los endpoints.

**Excluido** (pertenece a otros workstreams)
- Endpoints de PDF (`/api/pdf/import`, `/api/pdf/generate`) → WS3 y WS5 los registran.
- Editor de CV → WS2. Matching CV↔oferta → WS6.

## 3. Dependencias

- `docs/data-model.md`: contrato `Offer` y contratos de API.

## 4. Contratos

- **Produce:** dataset `Offer[]`; respuestas de `/api/offers` y `/api/offers/:id`.
- **Consume:** definición de `Offer`.

## 5. Ubicación de archivos

- `server/src/index.js`, `server/src/routes/`, `server/src/middleware/`
- `server/src/data/offers.json`
- `client/src/pages/` (página del portal), `client/src/features/offers/`
- `client/src/lib/api.js`

## 6. Tareas y entregables

1. Inicializar `server/` con `package.json`, Express, configuración ES Modules.
2. Montar `index.js` con middleware base y registro modular de routers.
3. Implementar `GET /api/health` → `{ status: "ok" }`.
4. Crear `offers.json` con **20–25 ofertas sintéticas** realistas del ecosistema Comillas
   (McKinsey, BCG, Iberdrola, Santander, Deloitte, EY, KPMG, Acciona, Indra, Repsol…),
   variando sector, modalidad y `type` (`practicas` / `empleo`). Cada oferta debe validar
   contra el contrato `Offer`.
5. Implementar `GET /api/offers` con filtrado en memoria por `degree`, `sector`,
   `location`, `modality`, `type`, `skill`, `language`.
6. Implementar `GET /api/offers/:id` → `Offer` o `404`.
7. Página del portal OPE: listado de ofertas, panel de filtros, vista de detalle.
8. Cliente API en `client/src/lib/api.js`.

## 7. Decisiones técnicas

- Las ofertas se cargan en memoria al arrancar; el filtrado opera sobre ese array.
- CORS limitado al origen del frontend en desarrollo.
- El dataset debe ser coherente y creíble: requisitos, sectores y empresas plausibles.

## 8. Limitaciones

- Datos sintéticos, no reales. No se simula el login del portal OPE ni se hace scraping.

## 9. Criterios de aceptación

- El servidor arranca con `npm run dev` en el puerto 3001.
- `/api/health` responde `{ status: "ok" }`.
- `/api/offers` devuelve el dataset completo; con filtros, el subconjunto correcto.
- `/api/offers/:id` devuelve la oferta o `404` si no existe.
- Cada oferta de `offers.json` valida contra el contrato `Offer`.
- La página del portal lista, filtra y muestra detalle sin errores de consola.
