# cvComillas — Modelo de datos

> Fuente de verdad de los contratos compartidos entre workstreams.
> Ningún workstream redefine estas estructuras. Cualquier cambio se hace **aquí primero**,
> incrementando `meta.schemaVersion`, antes de tocar código dependiente.

Versión del esquema: **1**

---

## Índice de entidades

| Entidad        | Descripción                                              | Productor   | Consumidores                  |
|----------------|----------------------------------------------------------|-------------|-------------------------------|
| `CV`           | Currículum completo del usuario                          | WS2, WS3    | WS2, WS4, WS5, WS6, WS7       |
| `Offer`        | Oferta de prácticas o empleo del portal OPE simulado     | WS1         | WS1, WS6                      |
| `MatchResult`  | Resultado de comparar un `CV` con una `Offer`            | WS6         | WS2                           |
| `AtsResult`    | Resultado del simulador de compatibilidad ATS            | WS6         | WS2                           |
| `ImportResult` | Salida del proceso de importación de PDF                 | WS3         | WS2                           |

---

## Convenciones generales

- **IDs:** strings opacos, únicos dentro de su contenedor. Generados en cliente con
  `crypto.randomUUID()`. Se usan como `key` de React y como handle de drag & drop.
- **Fechas de calendario:** formato `"YYYY-MM"` (mes). Cuando un periodo está en curso,
  `endDate` es `null` y `current` es `true`.
- **Marcas de tiempo:** formato ISO 8601 UTC (`"2026-05-26T10:30:00Z"`).
- **Campos opcionales:** valor `null` cuando no aplican; nunca se omite la clave.
- **Escala de nivel:** entero de **1 a 5** (1 = básico, 5 = nativo/experto). Misma escala
  para idiomas del `CV` y de la `Offer`, para permitir comparación directa.

---

## 1. Entidad `CV`

Estructura completa que el editor manipula y que se persiste en `localStorage`.

```json
{
  "meta": {
    "schemaVersion": 1,
    "id": "cv_8f3a2b9c",
    "createdAt": "2026-05-26T10:00:00Z",
    "updatedAt": "2026-05-26T10:30:00Z",
    "language": "es"
  },
  "style": {
    "template": "minimalista",
    "fontFamily": "Inter",
    "fontSize": "medium",
    "accentColor": "#1d4ed8"
  },
  "personal": {
    "fullName": "Ana García López",
    "headline": "Estudiante de Ingeniería Industrial — ICAI",
    "email": "ana.garcia@alu.comillas.edu",
    "phone": "+34 600 000 000",
    "location": "Madrid, España",
    "photoUrl": null,
    "links": [
      { "id": "lnk_1", "label": "LinkedIn", "url": "https://linkedin.com/in/anagarcia" }
    ]
  },
  "sections": {
    "summary": {
      "visible": true,
      "text": "Estudiante de Máster en Ingeniería Industrial con interés en consultoría…"
    },
    "experience": {
      "visible": true,
      "items": [
        {
          "id": "exp_1",
          "role": "Analista en prácticas",
          "company": "Iberdrola",
          "location": "Madrid",
          "startDate": "2024-06",
          "endDate": null,
          "current": true,
          "bullets": [
            { "id": "b_1", "text": "Análisis de datos de generación renovable." }
          ]
        }
      ]
    },
    "education": {
      "visible": true,
      "items": [
        {
          "id": "edu_1",
          "institution": "Universidad Pontificia Comillas (ICAI)",
          "degree": "Máster en Ingeniería Industrial",
          "field": "Ingeniería Industrial",
          "location": "Madrid",
          "startDate": "2023-09",
          "endDate": "2025-06",
          "current": false,
          "bullets": []
        }
      ]
    },
    "skills": {
      "visible": true,
      "items": [
        { "id": "sk_1", "name": "Python", "category": "Técnicas" },
        { "id": "sk_2", "name": "Modelización financiera", "category": null }
      ]
    },
    "languages": {
      "visible": true,
      "items": [
        { "id": "lng_1", "name": "Español", "level": 5 },
        { "id": "lng_2", "name": "Inglés", "level": 4 }
      ]
    },
    "projects": {
      "visible": true,
      "items": [
        {
          "id": "prj_1",
          "name": "Simulación de ciclo termodinámico",
          "description": "Modelo de turbina de gas en Python.",
          "link": null,
          "startDate": "2024-01",
          "endDate": "2024-05",
          "bullets": []
        }
      ]
    },
    "certifications": {
      "visible": true,
      "items": [
        {
          "id": "crt_1",
          "name": "Excel avanzado",
          "issuer": "Comillas",
          "date": "2024-03",
          "url": null
        }
      ]
    },
    "interests": {
      "visible": true,
      "items": ["Fotografía", "Trail running"]
    }
  },
  "layout": {
    "order": [
      "summary", "experience", "education", "skills",
      "languages", "projects", "certifications", "interests"
    ]
  }
}
```

### Notas de campos

**`meta`**
- `schemaVersion` (int): versión del esquema con que se creó el objeto. Habilita
  migraciones.
- `id` (string): identificador del CV.
- `createdAt` / `updatedAt` (ISO 8601): el editor actualiza `updatedAt` en cada cambio.
- `language` (`"es"` | `"en"` | …): idioma del contenido del CV. Lo modifica WS7 al
  traducir.

**`style`**
- `template`: `"minimalista"` | `"clasico"`. Una sola columna vs. dos columnas con barra
  lateral. WS4 puede añadir más valores; deben listarse aquí.
- `fontFamily` (string): nombre de la familia tipográfica.
- `fontSize`: `"small"` | `"medium"` | `"large"`.
- `accentColor` (string): color hex (`"#RRGGBB"`).

**`personal`** — bloque de cabecera, no reordenable.
- `photoUrl` (string | null): la visibilidad de la foto depende de la plantilla.
- `links[]`: cada enlace tiene `id`, `label` (texto visible) y `url`.

**`sections`** — contenedor de todas las secciones reordenables.
- Cada sección tiene `visible` (bool). Si es `false`, no se renderiza ni exporta.
- `summary.text` (string): resumen profesional.
- `experience.items[]` y `education.items[]`: comparten `startDate`, `endDate`, `current`
  y `bullets[]` (`{ id, text }`, reordenables por drag & drop).
- `skills.items[]`: `{ id, name, category }`. `category` es opcional (`null` si no se
  agrupa).
- `languages.items[]`: `{ id, name, level }`, `level` en escala 1–5.
- `projects.items[]`: incluye `description` (texto corto) y `bullets[]` opcionales.
- `certifications.items[]`: `{ id, name, issuer, date, url }`.
- `interests.items[]`: array de strings simples (etiquetas).

**`layout.order`** — array con las claves de `sections` en orden de render. El drag & drop
de secciones reordena este array. Toda clave presente en `sections` debe aparecer aquí.

---

## 2. Entidad `Offer`

Oferta del portal OPE simulado. El dataset sintético es un array de objetos `Offer`
servido por la API de WS1.

```json
{
  "id": "off_001",
  "title": "Prácticas en Consultoría Estratégica",
  "company": "Deloitte",
  "sector": "Consultoría",
  "location": "Madrid",
  "modality": "hibrido",
  "type": "practicas",
  "duration": "6 meses",
  "targetDegrees": ["Ingeniería Industrial", "ADE", "Doble Grado IE+ADE"],
  "publishedAt": "2026-05-10",
  "description": "Buscamos estudiantes de últimos cursos para incorporarse al equipo…",
  "requirements": {
    "hardSkills": ["Excel", "PowerPoint", "Modelización financiera"],
    "softSkills": ["Comunicación", "Trabajo en equipo"],
    "languages": [
      { "name": "Inglés", "level": 4 }
    ],
    "minExperience": "0-1 años",
    "education": ["Grado o Máster en curso"],
    "keywords": ["consultoría", "estrategia", "análisis"]
  }
}
```

### Notas de campos

- `modality`: `"presencial"` | `"hibrido"` | `"remoto"`.
- `type`: `"practicas"` | `"empleo"`.
- `duration` (string | null): p. ej. `"6 meses"`; `null` para empleo indefinido.
- `targetDegrees[]`: grados a los que se dirige la oferta. Sirve de filtro.
- `publishedAt`: fecha de publicación (`"YYYY-MM-DD"`).
- `description`: texto libre, tal como aparecería en el portal real.
- `requirements`: estructura que consume WS6 para el matching.
  - `languages[]`: `{ name, level }`, `level` en escala 1–5 (misma que el `CV`).
  - `minExperience` (string): rango legible, p. ej. `"0-1 años"`.
  - `keywords[]`: términos clave para el cálculo de cobertura.

---

## 3. Entidad `MatchResult`

Producida por WS6 en cliente (sin endpoint). Consumida por la UI de WS2.

```json
{
  "cvId": "cv_8f3a2b9c",
  "offerId": "off_001",
  "score": 72,
  "matchedSkills": ["Excel", "Inglés"],
  "missingSkills": ["Modelización financiera"],
  "strengths": ["Formación alineada con el sector de la oferta"],
  "weaknesses": ["Sin experiencia previa en modelización financiera"],
  "keywordCoverage": 0.6,
  "computedAt": "2026-05-26T11:00:00Z"
}
```

- `score` (int 0–100): compatibilidad global.
- `matchedSkills[]` / `missingSkills[]`: skills de la oferta presentes o ausentes en el CV.
- `strengths[]` / `weaknesses[]`: observaciones legibles para el usuario.
- `keywordCoverage` (float 0–1): proporción de `requirements.keywords` cubierta por el CV.

---

## 4. Entidad `AtsResult`

Producida por WS6 (simulador ATS, rule-based, en cliente). Consumida por la UI de WS2.

```json
{
  "cvId": "cv_8f3a2b9c",
  "score": 85,
  "issues": [
    {
      "severity": "warning",
      "field": "personal.photoUrl",
      "message": "Algunos parsers ATS no procesan imágenes; considera un CV sin foto."
    },
    {
      "severity": "error",
      "field": "sections.experience.items[0].bullets",
      "message": "Hay un bullet vacío."
    }
  ]
}
```

- `score` (int 0–100): compatibilidad estimada con parsers ATS.
- `issues[]`: cada incidencia tiene:
  - `severity`: `"info"` | `"warning"` | `"error"`.
  - `field` (string): ruta del campo afectado dentro del `CV`.
  - `message` (string): explicación legible.

---

## 5. Entidad `ImportResult`

Producida por WS3 al importar un PDF. Consumida por WS2.

```json
{
  "cv": { "...": "objeto CV, posiblemente parcial — mismos campos que la entidad CV" },
  "warnings": [
    "No se ha podido identificar la sección de idiomas con fiabilidad.",
    "Las fechas de experiencia se han extraído de forma aproximada."
  ]
}
```

- `cv`: objeto `CV` con la estructura completa. Los campos no detectados quedan vacíos
  (`""`, `[]` o `null` según el tipo). La importación es **best-effort**: el usuario debe
  revisar el resultado en el editor.
- `warnings[]`: avisos legibles sobre extracciones de baja fiabilidad.

---

## 6. Persistencia en `localStorage`

Gestionada por WS2. Esquema de claves (prefijo `cvcomillas.`):

| Clave                    | Contenido                                              |
|--------------------------|--------------------------------------------------------|
| `cvcomillas.schemaVersion` | Versión del esquema de los datos almacenados         |
| `cvcomillas.index`         | Array de IDs de los CVs guardados                    |
| `cvcomillas.activeCvId`    | ID del CV en edición                                 |
| `cvcomillas.cv.<id>`       | Objeto `CV` serializado (JSON)                       |

- El esquema admite uno o varios CVs; la UX concreta la decide WS2.
- **Autoguardado:** el editor persiste el CV activo cada 30 s y ante cambios relevantes.
- **Migraciones:** al cargar, WS2 compara `meta.schemaVersion` con la versión actual de
  este documento. Si difieren, aplica la migración correspondiente antes de usar el dato.

---

## 7. Contratos de API

Endpoints expuestos por el backend de WS1. Las cargas de request/response usan las
entidades definidas arriba. El detalle completo (códigos de error, validación) vive en el
spec de WS1.

| Método | Ruta                  | Request                          | Response                  |
|--------|-----------------------|----------------------------------|---------------------------|
| GET    | `/api/health`         | —                                | `{ status: "ok" }`        |
| GET    | `/api/offers`         | Query: `degree`, `sector`, `location`, `modality`, `type`, `skill`, `language` | `Offer[]` |
| GET    | `/api/offers/:id`     | —                                | `Offer`                   |
| POST   | `/api/pdf/import`     | `multipart/form-data`, campo `file` (PDF) | `ImportResult`   |
| POST   | `/api/pdf/generate`   | `application/json`, body `{ cv }`| `application/pdf` (binario)|

- El **matching** (`MatchResult`) y el **ATS** (`AtsResult`) se calculan en cliente: no
  tienen endpoint.
- `/api/offers` sin parámetros devuelve el dataset completo.
- WS5 decide internamente si `/api/pdf/generate` recibe el objeto `cv` o HTML
  pre-renderizado; el contrato público de entrada es `{ cv }`.
