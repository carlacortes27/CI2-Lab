# WS5 — Generación de PDF

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Construir el servicio server-side que convierte un `CV` en un PDF descargable de alta
fidelidad, usando Puppeteer y reutilizando las plantillas de WS4.

## 2. Alcance

**Incluido**
- Endpoint `POST /api/pdf/generate`: recibe `{ cv }` y devuelve un binario
  `application/pdf`. El router se registra en el servidor montado por WS1.
- Servicio Puppeteer: lanza Chromium headless, renderiza el `CV` con la plantilla de WS4 y
  exporta a PDF.
- Configuración de página (tamaño A4, márgenes, escala) coherente con las plantillas.
- UI en cliente: botón de descarga que llama al endpoint y descarga el archivo.

**Excluido** (pertenece a otros workstreams)
- Las plantillas visuales → WS4. WS5 las reutiliza, no las reimplementa.
- Infraestructura del servidor → WS1. WS5 solo añade su router.

## 3. Dependencias

- `docs/data-model.md`: contrato `CV` y contrato del endpoint `/api/pdf/generate`.
- WS1: servidor Express montado.
- WS4: plantillas que producen el render del `CV`.

## 4. Contratos

- **Consume:** `CV`. El contrato público de entrada del endpoint es `{ cv }`.
- **Produce:** binario PDF (`application/pdf`).

## 5. Ubicación de archivos

- `server/src/routes/` (router de generación), `server/src/services/` (servicio Puppeteer)
- `client/src/features/editor/` (botón de descarga)

## 6. Tareas y entregables

1. Implementar el servicio Puppeteer: lanzamiento de Chromium, render del `CV` a HTML,
   exportación a PDF con configuración A4.
2. Implementar el endpoint `POST /api/pdf/generate` que recibe `{ cv }`, valida el cuerpo
   y devuelve el binario.
3. Garantizar que la fidelidad del PDF coincide con la plantilla seleccionada (fuente,
   color de acento, orden de secciones, escala de idiomas).
4. UI: botón de descarga en el editor que invoca el endpoint y descarga el archivo.
5. Manejo de errores: tiempos de espera de Puppeteer, fallos de render.

## 7. Decisión técnica clave (resolver al inicio del workstream)

El contrato público del endpoint es `{ cv }`. WS5 debe convertir ese `cv` en HTML
server-side para que Puppeteer lo imprima. Esto requiere reutilizar las plantillas de WS4,
y la forma de hacerlo es la decisión central del workstream:

- **Opción recomendada:** renderizar las plantillas de WS4 a una cadena HTML en el
  servidor con `react-dom/server`, inyectando el CSS de la plantilla. Es viable porque las
  plantillas de WS4 son componentes puros (ver WS4, sección 7). Requiere que las
  plantillas se puedan importar desde `server/`.
- **Fallback documentado:** si la configuración de build hace impracticable importar las
  plantillas en el servidor, Puppeteer navega a una ruta de impresión dedicada del
  frontend que renderiza el `CV`.

El desarrollador debe validar la opción recomendada antes de construir la funcionalidad
completa, y dejar constancia de la decisión final en el código. El contrato público
`{ cv }` no cambia en ninguno de los dos casos.

## 8. Limitaciones

- Puppeteer arrastra Chromium completo: consumo de memoria y arranques en frío relevantes
  en Railway o Render. Tenerlo presente al desplegar.

## 9. Criterios de aceptación

- `POST /api/pdf/generate` con un `CV` válido devuelve un PDF.
- El PDF reproduce fielmente la plantilla seleccionada: fuente, color, orden de secciones.
- Funciona con las dos plantillas de WS4.
- El botón de descarga del cliente descarga correctamente el archivo.
- Un cuerpo de petición inválido se rechaza con un error claro.
