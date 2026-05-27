# Zona: Backend / Datos OPE (Persona 5)

## Archivos de este módulo
- `src/data/offers.json` — dataset sintético de ofertas (25 entradas)
- `src/routes/offers.js` — endpoints GET /api/offers y GET /api/offers/:id
- `src/index.js` — **congelado**: no añadir rutas directamente aquí

## Para añadir un endpoint nuevo
1. Crea un archivo en `src/routes/mi-ruta.js`
2. Exporta un Express Router
3. Regístralo en `src/index.js` añadiendo:
   ```js
   import miRuta from './routes/mi-ruta.js';
   app.use('/api', miRuta);
   ```
   (una línea, mínimo conflicto con los demás)

## API de ofertas disponible
```
GET /api/offers?type=practicas&sector=tecnología&modality=remoto&degree=ICAI&skill=Python&language=inglés
GET /api/offers/:id
```

## Estructura del objeto Offer
Lee `docs/data-model.md` — el contrato `Offer` es obligatorio.
Campos requeridos: id, title, company, sector, location, modality, type,
targetDegrees[], publishedAt, description, requirements{}.

## Para añadir una oferta al dataset
Edita `src/data/offers.json`. Cada entrada debe cumplir el contrato `Offer`.
Genera IDs con formato `offer-XX` (incrementar el número).

## PROHIBIDO tocar
- `client/` — zona del frontend (P1–P4)
- `src/index.js` — solo añade la línea de registro de tu ruta
- `src/middleware/errorHandler.js` — infraestructura compartida

## Contratos relevantes
Lee `docs/data-model.md`. El servidor usa ES Modules (`import/export`), no CommonJS.
Puerto de desarrollo: 3001. CORS restringido a `http://localhost:3000`.
