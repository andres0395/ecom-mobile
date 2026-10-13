# Proyecto: Biblia — Traducción contextual (escritorio)

## Qué es

Una aplicación de escritorio (Tauri 2 + React + Vite + TypeScript + Tailwind v4) que muestra una traducción de la Biblia organizada por libro → capítulo → versículo, con notas de crítica textual y lingüística. La fuente de contenido son archivos JSON versionados en este repo.

Este proyecto nace de portar la lógica de `translate-bible` (originalmente Next.js) a un wrapper de Tauri, para poder consumir la Biblia offline en escritorio. No usa comandos Rust custom: los JSON viven en `public/content/books/` y se sirven desde el WebView.

## Qué **no** es

**No es una traducción religiosa, doctrinal ni confesional.** No confesamos credo. No añadimos teología. La intención es dejar al descubierto lo que el autor del texto original quiso decir, dado el contexto lingüístico, histórico, geográfico y cultural de su época.

## Filosofía de traducción

> "se tome el texto lingüísticamente bajo el contexto de la época, y con la ayuda de la inteligencia artificial que tiene acceso a los libros, a los registros y a la información de esa época, se tome en cuenta que en las citas del texto y en el propio texto esté plasmada la idea del autor."

En concreto:

1. **Fidelidad al texto fuente, no a una tradición doctrinal.** Si el hebreo dice YHWH, traducimos YHWH (o Yavé/Jehová); nunca "Adonai" por escrito. Si el griego dice una cosa, esa cosa, no lo que una tradición posterior reinterpretó.
2. **Privilegiar la intención del autor sobre la lectura religiosa posterior.** Las notas de crítica textual existen justamente para mostrar el rango de interpretaciones históricas (TM, LXX, Targumes, Vulgata, Samaritanus) sin imponer una.
3. **Respetar el contexto lingüístico de la época.** Terminos hebreos como `mal'akh` (mensajero, no ángel en sentido técnico), `chesed` (lealtad pactada, no "misericordia" genérica), `toledot` (genealogía/generaciones como estructura), `bekhorah` (derecho legal, no solo "primogenitura" mística) deben aparecer y explicarse, no aplastarse con equivalentes cristianos modernos.
4. **Documentar cada decisión de traducción** con una nota cuando el término sea:
   - teológicamente cargado (YHWH, Adonai, Elohim, El Shaddai),
   - un hapax legomenon o palabra rara,
   - un término con debate filológico vivo (ej. `lasuach` en Gén 24:63),
   - un topónimo con forma original distinta a la usual (Aram Naharayim → Mesopotamia),
   - o cualquier unidad de peso/medida con valor técnico (beka', siclo, etc.).
5. **Preservar la estructura narrativa del texto.** Si el original tiene "Parte 1 / Parte 2 / Parte 3...", mantenemos las partes con su `verseRange`. No las colapsamos.
6. **Marcas `[n]` en el texto** referencian notas por id. Conservarlas tal cual: el `VerseCard` las renderiza como botones clicables que abren la nota correspondiente en el panel lateral.

## Convenciones de formato

### Idioma y estilo

- **Español rioplatense/peninsular neutro**, con preferencia por registro sobrio, casi académico. Sin arcaísmos gratuitos, sin "vosotros" en narración salvo cita directa.
- **Comillas angulares `«»`** para discurso directo. Comillas rectas `""` dentro del discurso directo o para términos transliterados (ej. "el `chesed` de YHWH").
- **Términos transliterados** en cursiva o entre comillas, seguidos de la explicación en la nota.
- **Tetragrámaton**: `YHWH` en el texto. Solo `Yavé` o `Jehová` si el contexto lo justifica. Nunca `Adonai` por escrito.
- Números ordinales en versículos: "el primogénito" no "el primogénito de los primogénitos".

### Estructura del JSON por capítulo

Path: `public/content/books/<book-id>/<chapter>.json` (servido como `/content/books/<book-id>/<chapter>.json`).

```jsonc
{
  "bookId": "genesis",          // kebab-case, coincide con carpeta
  "number": 24,                  // 1-based
  "title": "La búsqueda de esposa para Isaac",  // tema principal
  "parts": [
    {
      "title": "El juramento de Abraham",
      "verseRange": [1, 9]       // inclusivo
    }
  ],
  "verses": [
    {
      "number": 1,
      "text": "Abraham era ya viejo, entrado en días; y YHWH[1] había bendecido a Abraham en todo."
      // Las marcas [n] se mantienen literalmente en el texto
    }
  ],
  "notes": [
    {
      "id": 1,                    // coincide con la marca [n] en el versículo
      "verse": 1,                 // versículo al que está asociada
      "title": "Nombre Divino",
      "transcription": "יהוה — YHWH",  // opcional, hebreo/griego + romanización
      "content": "En el texto hebreo original aparece el Tetragrámaton..."
    }
  ]
}
```

### Idempotencia de los IDs de nota

Dentro de un capítulo, los `id` de notas son únicos y ascienden. Si una nota referencia un término que aparece en varios versículos, se duplica la nota con su `id` propio y se marca en cada versículo con su `[n]` correspondiente. No se reutiliza el mismo `id` para dos notas distintas.

## Workflow de traducción

### Tamaño de lote

**Un capítulo por vez.** Ni dos, ni cuatro. La razón: cada capítulo debe ser leído completo, revisado en su totalidad y aprobado antes de pasar al siguiente. Lotes más grandes acumulan contenido sin verificar, y la calidad cae porque la atención se diluye. Un capítulo a la vez garantiza que cada JSON que entra al repo esté verificado contra su fuente.

### Formas de entrada

El material del usuario puede llegar de **dos formas**, y el agente debe estar preparado para ambas:

1. **PDF** — el usuario deja el archivo en `docs/`. El agente lo lee con la herramienta `read`, que soporta PDF (con parámetro `pages` para capítulos largos). Ideal cuando el material viene de una fuente académica con notas de crítica textual extensas.
2. **Texto pegado directamente en el chat** — el usuario copia el material al mensaje. Útil cuando la fuente es accesible sin necesidad de PDF, o cuando el material es corto. Formato sugerido: encabezado por capítulo (`## Génesis N`), número de versículo pegado al texto, notas al final del capítulo o intercaladas.

En ambos casos, el resultado es el mismo: el agente recibe el material íntegro y verificado antes de producir el JSON.

### Pasos por capítulo

1. Leer el material completo (no saltearse secciones, no saltarse notas).
2. Identificar la estructura: título del capítulo, partes/secciones narrativas, versículos, notas.
3. Respetar **todas** las notas de crítica textual y lingüística del material original; no resumirlas ni omitirlas. Si hay decisiones de traducción que el autor del material justifica (TM vs LXX, hapax legomena, etc.), la nota debe explicarlas.
4. Producir el JSON con la forma exacta de arriba.
5. Validar el JSON antes de escribirlo (mentalmente: ¿`parts.length` correcto?, ¿`verses` consecutivos desde 1?, ¿`notes[].id` único?, ¿`notes[].verse` apunta a un versículo real?).
6. **Ejecutar el validador** (`scripts/validate-chapter.mjs`). Ver detalles abajo.
7. Si un versículo contiene varias notas, marcarlo con varios `[n]`. El parser ya lo soporta.

### Validador automático

Existe `scripts/validate-chapter.mjs` con dos comandos npm:

```bash
pnpm validate:chapter public/content/books/genesis/24.json          # solo chequea
pnpm validate:chapter:fix public/content/books/genesis/24.json      # chequea y auto-corrige
```

Chequeos que aplica (errores bloqueantes):

1. Verses consecutivos desde 1.
2. Parts cubren todos los versículos sin solaparse.
3. Note IDs únicos.
4. Cada `[n]` en el texto tiene su nota correspondiente.
5. Cada `note.verse` apunta a un versículo real.
6. **Balance de comillas: `«` count == `»` count.**

Chequeos de advertencia:

7. Note IDs no consecutivos.
8. Notas sin marca `[n]` en el texto.
9. **`"` suelto al final de un versículo dentro de un speech abierto** (auto-fixable: `"` → `»`).
10. **`«` extra al inicio de un versículo cuando ya hay un speech abierto** (no es speech nuevo; el validador lo reporta pero NO auto-corrige porque requiere juicio editorial).

### Regla de auto-fix obligatoria

El síntoma que se ha presentado en la fuente en varias ocasiones (Gén 27:12, 27:19, 28:16) es la **comilla `"` suelta al final de un versículo dentro de un speech abierto**, donde debería ir `»`. Este síntoma es sistemático: parece un error de copy-paste desde el PDF original.

**Regla**: si el validador detecta este síntoma en un nuevo capítulo, el agente **debe corregirlo automáticamente con `--fix`** antes de declarar el capítulo listo. No se consulta al usuario, no se devuelve al mini-informe como `⚠️`, se corrige y se reporta en el resumen del capítulo como "auto-fix aplicado".

**Heurística del auto-fix**: solo se reemplaza `"` por `»` cuando (a) estamos dentro de un speech abierto (running count de `«` > 0), (b) el versículo termina con `"` seguido opcionalmente de `.`, `?` o `!`, y (c) el versículo siguiente abre un nuevo `«` (o no hay versículo siguiente). Esto evita falsos positivos con cierres de comillas internas legítimas como `"Es mi hermana"`.

### Protocolo de revisión (segundo análisis)

El agente **no codifica directamente**. Antes de escribir el JSON, hace un segundo análisis del material recibido y devuelve un mini-informe con tres secciones:

- ✅ **OK** — puntos del material que pasan la revisión sin cambios.
- ⚠️ **Sugerencias** — ajustes propuestos (con la corrección concreta). Esperar aprobación del usuario antes de aplicar.
- ❓ **Verificar contra fuente** — cualquier cosa donde la memoria del modelo no alcance o donde haya riesgo de error. Marcar como `"Decisión pendiente de confirmar con el autor"` en el JSON, no inventar.

Una vez aprobado el informe (o aplicadas las correcciones), el agente codifica el JSON. Este paso de revisión es la razón principal por la que el flujo es de un capítulo por vez: garantiza que cada bloque que entra al repo pasó por control de calidad contra la fuente.

### Regla de honestidad

**No agregar contenido que no esté en el material fuente.** Si una decisión queda ambigua, dejar una nota al final del JSON como `content` que diga "Decisión pendiente de confirmar con el autor". El agente no debe rellenar vacíos con suposiciones, ni siquiera cuando "le parece obvio".

## Estado actual del proyecto

### Stack
- Tauri 2 (escritorio) + React 19 + TypeScript strict + Vite 8 + Tailwind v4
- React Router 7 (rutas cliente en lugar de Next App Router)
- Sin backend Rust custom. Sin base de datos. Contenido en JSON embebido.
- Tema claro/oscuro via `prefers-color-scheme` (paleta en `src/styles/globals.css`).
- Fuentes: solo fallbacks de sistema (sin Google Fonts) para mantener offline-first.

### Capas (clean architecture)
- `src/types/bible.ts` — tipos del dominio (`Book`, `Chapter`, `Verse`, `Note`, `ChapterPart`).
- `src/lib/bible/catalog.ts` — metadata estática por libro (título, abreviatura, orden, testamento, totalChapters). Equivalente al `BOOK_CATALOG` del repositorio anterior.
- `src/lib/bible/paths.ts` — utilidades de URL (`/content/books/<id>/<n>.json`).
- `src/repositories/bible.ts` — única capa que toca los datos. Implementación `HttpBibleRepository` (HEAD probes para detectar capítulos disponibles, GET para el JSON). Interfaz `IBibleRepository` exportada.
- `src/services/bible.ts` — casos de uso: `listBooks`, `getBook`, `getChapter`, `getChapterNavigation`, `groupByTestament`.
- `src/components/atoms|molecules|organisms|templates` — Atomic Design. Atoms sin lógica, organisms reciben data por props, templates son layout shells.
- `src/pages/` — solo rutas cliente. `ChapterPage` usa un estado discriminado (`loading | missing | error | ok`) que reemplaza al `notFound()` de Next.

### Catálogo de libros (en `src/lib/bible/catalog.ts`)
Por ahora configurados: `genesis` (50 caps), `exodo` (40), `levitico` (27), `numeros` (36), `deuteronomio` (34). Para agregar un libro nuevo: entrada en `BOOK_CATALOG` + carpeta `public/content/books/<id>/` con sus capítulos. El repositorio descubre los capítulos con HEAD probes, así que no hace falta regenerar un manifest.

### Contenido traducido
Los mismos que en `translate-bible`: `public/content/books/genesis/{24..40}.json`.

### Rutas
- `/` — índice de libros (AT/NT)
- `/:bookId` — grilla de capítulos del libro
- `/:bookId/:chapter` — vista de lectura con panel de notas lateral
- `*` — 404 global (`NotFoundPage`)

### Decisiones de UX ya tomadas
- Notas en **panel lateral colapsable** (no al pie, no inline). Click en `[n]` o en el número de versículo → resalta y scrollea a la nota.
- Navegación **anterior/siguiente salta capítulos no traducidos** para no enlazar a 404.
- Capítulos faltantes se muestran en la grilla como celdas punteadas deshabilitadas.

## Convenciones operativas para el agente

- **No borrar ni sobrescribir** un JSON existente sin confirmación explícita del usuario, salvo que la tarea sea precisamente esa.
- **No traducir contenido religioso/teológico** que no esté en el material fuente. Si el material fuente contiene una nota que explica un debate teológico histórico, esa nota va al JSON, pero no se "cura" ni se "corrige" hacia una postura.
- **Revisar el JSON generado** antes de escribirlo: ¿verses consecutivos? ¿`verseRange` de las partes cubre todos los versículos sin solaparse? ¿`notes[].id` único y monótono creciente? ¿cada `[n]` en el texto tiene su nota correspondiente y viceversa?
- **Mantenerse en español** salvo que el usuario cambie de idioma. Las notas de crítica textual pueden incluir términos en hebreo, griego, arameo, latín, inglés técnico (TM, LXX, hapax legomenon, etc.).
- **El usuario revisa el código y el contenido.** No dar nada como "definitivo". Cuando haya decisiones de traducción discutibles, presentarlas con la opción tomada, la(s) alternativa(s) y la razón.

## Cómo correr el proyecto

### Dev (solo el HTML/CSS/JS, sin ventana Tauri)

```bash
pnpm install
pnpm dev          # http://localhost:1420
```

### Build + ventana Tauri nativa

Necesita el toolchain de Rust + Tauri CLI. Ver `https://tauri.app/start/prerequisites/`.

```bash
pnpm tauri dev          # dev con ventana nativa (macOS/Windows/Linux desktop)
pnpm tauri build        # build de producción del binario
```

### Validar capítulos

```bash
pnpm validate:chapter public/content/books/genesis/24.json
pnpm validate:chapter:fix public/content/books/genesis/24.json
```