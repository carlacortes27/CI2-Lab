# cvComillas — Guía maestra del proyecto

> Documento canónico del proyecto. Claude Code lo lee automáticamente en cada sesión.
> Toda decisión de arquitectura, alcance y convención parte de aquí.
> Los contratos de datos están en `docs/data-model.md` y son la única fuente de verdad.

---

## 1. Objetivo

cvComillas es un **generador de CVs interactivo** orientado a estudiantes y alumni de la
Universidad Pontificia Comillas (ICAI). El usuario edita su CV con previsualización en
tiempo real, puede importar un CV existente en PDF, exportarlo a PDF, y comparar su perfil
contra ofertas de prácticas y empleo.

Diferenciación: nicho universitario Comillas. Frente a herramientas genéricas, cvComillas
cruza el CV con datos del ecosistema de empleo de la universidad (ofertas tipo OPE,
empresas que contratan perfiles Comillas). El modelo es replicable a otras universidades.

---

## 2. Cómo debe operar Claude Code en este repositorio

Reglas de obligado cumplimiento al trabajar en este proyecto:

1. **Trabaja contra el spec del workstream.** Cada tarea pertenece a un workstream
   (sección 6). Antes de escribir código, carga el MD correspondiente en
   `docs/workstreams/`.
2. **No redefinas contratos.** Las estructuras `CV`, `Offer`, `MatchResult`, `AtsResult`
   y el esquema de `localStorage` están definidos en `docs/data-model.md`. Consúmelos; no
   los reinventes en cada módulo.
3. **Cambios a un contrato compartido → primero el contrato.** Si un workstream necesita
   modificar `CV` u `Offer`, se actualiza `docs/data-model.md`, se incrementa
   `meta.schemaVersion` y se comunica antes de tocar código dependiente. Nunca al revés.
4. **Sin LLM ni servicios de pago.** Prohibido introducir dependencias de APIs de LLM de
   pago. Ver sección 10.
5. **Sin scraping.** El portal OPE se simula con un dataset sintético. No se implementa
   ningún scraper.
6. **Idioma.** Código, identificadores y nombres de archivo en inglés. Comentarios y
   textos de interfaz en español.
7. **Pregunta ante ambigüedad.** Si un spec es incompleto o contradice este documento,
   detente y consúltalo; no inventes la decisión.

---

## 3. Stack tecnológico

| Capa            | Tecnología                                  |
|-----------------|---------------------------------------------|
| Frontend        | React + Vite + Tailwind CSS                 |
| Componentes UI  | Propios (sin librerías de componentes)      |
| Backend         | Node.js (≥18) + Express, ES Modules         |
| Persistencia CV | `localStorage` (navegador)                  |
| Datos de ofertas| Dataset sintético en JSON servido por API   |
| Generación PDF  | Puppeteer (server-side)                     |
| Importación PDF | Multer (subida) + `pdf-parse` (extracción)  |
| Drag & drop     | API nativa HTML5 (sin librerías)            |
| NLP / matching  | `compromise` (client-side)                  |
| Traducción      | LibreTranslate (instancia self-hosted)      |
| Testing         | Vitest + React Testing Library + Supertest  |
| Calidad         | ESLint + Prettier                           |
| Despliegue      | Vercel (cliente) + Railway/Render (servidor)|

---

## 4. Decisiones de arquitectura y su justificación

Distinción entre hecho verificable y decisión de diseño:

- **Vite en lugar de Create React App.** *Hecho:* el equipo de React deprecó CRA a inicios
  de 2025 y dejó de mantenerlo. *Decisión:* se usa Vite por ser el estándar actual y estar
  mantenido.
- **Dataset sintético en JSON en lugar de PostgreSQL.** Al no haber scraping ni datos
  reales, una base de datos relacional es complejidad innecesaria. Las ofertas viven en un
  archivo JSON versionado y se sirven vía API. Si en el futuro se incorporan datos reales,
  el contrato `Offer` no cambia: solo cambia la fuente.
- **Matching y ATS en cliente.** El análisis CV↔oferta y el simulador ATS se ejecutan en
  el navegador con `compromise`, sin endpoint. Evita coste de servidor y de API.
- **Persistencia en `localStorage`.** Sin autenticación ni base de datos. El esquema de
  claves está en `docs/data-model.md` y admite uno o varios CVs.
- **ES Modules en el backend.** Coherencia con el frontend; un solo estilo de imports en
  todo el repo.

---

## 5. Estructura de carpetas

```
cvcomillas/
├── CLAUDE.md                       # este documento
├── README.md                       # instrucciones de arranque para humanos
├── docs/
│   ├── data-model.md               # contratos de datos (fuente de verdad)
│   └── workstreams/                # specs de cada workstream
│       ├── 01-backend-datos.md
│       ├── 02-editor-cv.md
│       ├── 03-importacion-pdf.md
│       ├── 04-plantillas.md
│       ├── 05-generacion-pdf.md
│       ├── 06-matching-analisis.md
│       └── 07-texto-correccion-traduccion.md
├── .claude/
│   └── agents/                     # definiciones de los subagentes
│       ├── desarrollador.md
│       ├── tester.md
│       └── auditor.md
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/             # UI reutilizable (botones, inputs, campos)
│       ├── features/               # lógica por dominio (editor, import, matching…)
│       ├── templates/              # plantillas de CV
│       ├── pages/                  # landing, editor, portal OPE simulado
│       ├── lib/                    # utilidades, cliente API, parsers
│       ├── data/                   # CV de ejemplo, constantes
│       └── styles/
└── server/
    ├── package.json
    └── src/
        ├── index.js                # arranque Express
        ├── routes/                 # definición de endpoints
        ├── services/               # Puppeteer, pdf-parse, etc.
        ├── middleware/
        └── data/                   # ofertas sintéticas (JSON)
```

---

## 6. Workstreams

El proyecto se divide en 7 paquetes de trabajo. Cada uno tiene un spec autocontenido en
`docs/workstreams/`. Las dependencias indican qué workstreams deben tener su contrato
estable antes de integrar.

| ID  | Workstream                         | Ámbito                                                                 | Depende de       |
|-----|------------------------------------|------------------------------------------------------------------------|------------------|
| WS1 | Backend + datos + portal OPE       | Servidor Express, API, dataset sintético de ofertas, UI del portal      | data-model       |
| WS2 | Editor de CV (frontend core)       | Editor de dos paneles, preview en vivo, drag & drop, autoguardado       | data-model       |
| WS3 | Importación de PDF                 | Subida, extracción con `pdf-parse`, estructurado a objeto `CV` parcial  | data-model, WS1  |
| WS4 | Plantillas y maquetación           | Plantillas de CV, selectores de fuente/tamaño/color                     | data-model, WS2  |
| WS5 | Generación de PDF                  | Servicio Puppeteer, render de plantilla a PDF                           | WS1, WS4         |
| WS6 | Matching y análisis CV↔oferta      | Comparación CV/oferta, extracción de keywords, simulador ATS            | data-model, WS1  |
| WS7 | Texto: corrección y traducción     | Corrección ortográfica/reglas, traducción vía LibreTranslate            | data-model       |

Notas:
- El "coordinador" no es un workstream: la orquestación es el enrutado y la shell de la
  aplicación, responsabilidad transversal de WS2.
- Los 12 módulos del diseño inicial se consolidaron en estos 7 para reducir solapamiento y
  riesgo de integración.

---

## 7. Contratos compartidos

Las estructuras de datos que cruzan workstreams están definidas en
**`docs/data-model.md`**. Resumen:

| Entidad        | Productor          | Consumidores                         |
|----------------|--------------------|--------------------------------------|
| `CV`           | WS2, WS3           | WS2, WS4, WS5, WS6, WS7              |
| `Offer`        | WS1                | WS1, WS6                             |
| `MatchResult`  | WS6                | WS2 (UI de resultados)              |
| `AtsResult`    | WS6                | WS2 (UI de resultados)              |
| `ImportResult` | WS3                | WS2                                  |
| Esquema `localStorage` | WS2        | WS2                                  |

Ningún workstream redefine estas estructuras. Cualquier cambio sigue la regla 3 de la
sección 2.

---

## 8. Convenciones de código

- **Idioma:** identificadores en inglés; comentarios y UI en español.
- **React:** componentes funcionales con hooks; un componente por archivo; `PascalCase`
  para componentes, `camelCase` para funciones y variables.
- **Estado:** React state y Context API. Sin Redux ni librerías de estado externas.
- **UI:** componentes propios; Tailwind para estilos. Sin librerías de componentes.
- **Backend:** ES Modules; controladores finos en `routes/`, lógica en `services/`.
- **Formato:** Prettier, indentación de 2 espacios. ESLint sin warnings antes de integrar.
- **IDs de datos:** strings opacos generados en cliente (`crypto.randomUUID`), únicos
  dentro de un mismo `CV`; se usan como `key` de React y como handle de drag & drop.
- **Commits:** mensajes descriptivos; se recomienda Conventional Commits
  (`feat:`, `fix:`, `docs:`…).
- **Tests:** cada workstream entrega tests de su lógica no trivial.

---

## 9. Comandos

Instalación (una vez por carpeta):

```bash
cd client && npm install
cd ../server && npm install
```

Desarrollo:

```bash
# Backend → http://localhost:3001
cd server && npm run dev

# Frontend → http://localhost:3000
cd client && npm run dev
```

Verificación:

```bash
npm test          # tests (en client/ o server/)
npm run lint      # ESLint
cd client && npm run build   # build de producción del frontend
```

---

## 10. Alcance y limitaciones explícitas

Limitaciones asumidas conscientemente. Claude Code no debe intentar superarlas
introduciendo dependencias prohibidas.

- **Sin LLM.** No se integra ninguna API de LLM de pago. Consecuencias directas:
  - WS7 (corrección): solo ortografía por diccionario y reglas. Reescribir frases,
    "mejorar el tono" o convertir párrafos en bullets **con calidad real no es viable** sin
    LLM. Estas funciones se documentan como heurísticas limitadas o se aplazan.
  - El "generador desde formulario" no genera texto: es el propio editor con campos
    vacíos y plantillas de ejemplo.
  - WS7 (traducción): LibreTranslate produce traducción automática genérica, no estilo
    profesional adaptado.
  - WS6 (matching): `compromise` está orientado a inglés; con texto en español el
    análisis se apoya más en normalización y listas de keywords curadas que en su NLP.
- **Sin scraping.** El portal OPE es una simulación: UI propia + dataset sintético de
  ofertas. Ninguna credencial real, ningún acceso al portal real.
- **Sin autenticación ni base de datos.** Persistencia del CV en `localStorage`. Las
  ofertas son un JSON estático servido por la API.
- **Calidad final.** Se asume que el resultado será inferior al de una solución con LLM.
  Es una decisión de proyecto, no un defecto a corregir.

---

## 11. Subagentes

El proyecto define **3 subagentes por rol** en `.claude/agents/`. Cada uno se invoca sobre
un workstream concreto y carga el spec correspondiente de `docs/workstreams/`.

| Subagente      | Rol                                                                 |
|----------------|----------------------------------------------------------------------|
| `desarrollador`| Implementa funcionalidad de un workstream según su spec.            |
| `tester`       | Diseña y ejecuta pruebas del workstream; verifica contra el spec.   |
| `auditor`      | Revisa código y arquitectura: contratos, convenciones, alcance.     |

Patrón de uso: el subagente aporta el *cómo* (su rol); el spec del workstream aporta el
*qué* (el alcance). No hay un subagente por workstream.

Limitación conocida: los subagentes corren en contexto separado y devuelven un resumen.
Rinden muy bien en auditoría y testing. Para `desarrollador`, conviene acotar cada
invocación a una tarea concreta de un único workstream, no a "construir el módulo entero".

---

## 12. Reglas de integración

- `docs/data-model.md` es la única fuente de verdad de los contratos. Si dos workstreams
  discrepan sobre una estructura, gana data-model.
- Los workstreams se integran cuando sus contratos están estables, siguiendo el grafo de
  dependencias de la sección 6.
- Cambios en un contrato → actualizar `data-model.md`, incrementar `schemaVersion`,
  comunicar a los workstreams dependientes.
- Antes de integrar un workstream: ESLint sin errores, tests en verde, conformidad con
  este documento verificada por el subagente `auditor`.
