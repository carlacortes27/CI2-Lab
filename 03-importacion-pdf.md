# WS3 — Importación de PDF

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Permitir que el usuario suba un CV existente en PDF (de LinkedIn u otra herramienta) y
convertirlo en un objeto `CV` editable. La extracción es **best-effort**: el resultado
debe revisarse en el editor.

## 2. Alcance

**Incluido**
- Endpoint `POST /api/pdf/import`: subida con Multer, extracción de texto con `pdf-parse`.
  El router se registra en el servidor montado por WS1.
- Extracción de texto plano del PDF.
- Heurísticas de estructurado: detección de secciones, separación de items, extracción de
  fechas y de datos personales.
- Construcción de un objeto `CV` (posiblemente parcial) conforme a `data-model.md`.
- Generación de `warnings` sobre extracciones de baja fiabilidad.
- UI de importación en cliente: subir archivo, llamar al endpoint, mostrar `warnings` y
  cargar el `CV` resultante en el estado del editor de WS2.
- El endpoint devuelve un `ImportResult`.

**Excluido** (pertenece a otros workstreams)
- El editor en sí → WS2. WS3 entrega un `CV` que WS2 carga en su estado.
- Infraestructura del servidor → WS1. WS3 solo añade su router.

## 3. Dependencias

- `docs/data-model.md`: contratos `CV` e `ImportResult`.
- WS1: servidor Express montado y registro modular de rutas.
- WS2: recibe el `CV` importado en su estado.

## 4. Contratos

- **Produce:** `ImportResult`.
- **Consume:** `CV` (estructura objetivo).

## 5. Ubicación de archivos

- `server/src/routes/` (router de importación), `server/src/services/` (parser de PDF)
- `client/src/features/import/`

## 6. Tareas y entregables

1. Configurar Multer: subida en memoria, límite de tamaño (5 MB), validar tipo PDF.
2. Implementar el servicio de extracción con `pdf-parse`.
3. Implementar heurísticas de estructurado:
   - Datos personales: email, teléfono y URLs por expresiones regulares.
   - Secciones: detección por encabezados conocidos en español e inglés.
   - Items y fechas: asociación aproximada dentro de cada sección.
4. Construir el objeto `CV` parcial; los campos no detectados quedan vacíos
   (`""`, `[]` o `null` según el tipo).
5. Acumular `warnings` para toda extracción de fiabilidad baja.
6. Implementar el endpoint `POST /api/pdf/import` que devuelve `ImportResult`.
7. UI de importación: selector de archivo, llamada al endpoint, visualización de
   `warnings` y carga del `CV` en el editor.

## 7. Decisiones técnicas

- `pdf-parse` extrae texto sin información de maquetación: el estructurado es impreciso por
  diseño. Niveles de fiabilidad esperados: alta para email/teléfono/URLs (regex), media
  para detección de secciones, baja para asociar fechas y bullets a items concretos.
- Toda extracción de fiabilidad baja genera un `warning`.

## 8. Limitaciones

- La importación es best-effort. La UI debe comunicar explícitamente que el usuario debe
  revisar y corregir el resultado en el editor.

## 9. Criterios de aceptación

- Subir un PDF válido devuelve un `ImportResult` conforme al contrato.
- Email y teléfono presentes en el PDF se extraen correctamente.
- El objeto `cv` del resultado valida contra el contrato `CV`.
- Archivos que no son PDF o están corruptos se rechazan con un error claro.
- `warnings` refleja las secciones extraídas con baja fiabilidad.
- El `CV` importado se carga en el editor de WS2 y es editable.
