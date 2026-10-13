# Biblia — Traducción contextual (escritorio)

App de escritorio multiplataforma (Tauri 2 + React + Vite + TypeScript + Tailwind v4) que muestra una traducción de la Biblia organizada por libro → capítulo → versículo, con notas de crítica textual y lingüística.

El contenido vive en archivos JSON dentro de `public/content/books/`, se sirve desde el WebView y no requiere backend.

## Stack

- **Frontend:** React 19 + Vite 8 + TypeScript + Tailwind v4 + React Router 7
- **Shell:** Tauri 2 (escritorio)
- **Datos:** archivos estáticos en `public/content/books/`
- **Linter/validador:** ESLint + `scripts/validate-chapter.mjs`

## Cómo correr

### Dev (solo el frontend)

```bash
pnpm install
pnpm dev          # http://localhost:1420
```

### Dev con ventana Tauri

Necesita Rust y los prerrequisitos de Tauri para tu OS (ver [tauri.app/start](https://tauri.app/start/prerequisites/)).

```bash
pnpm tauri dev
```

### Build de producción

```bash
pnpm tauri build
```

El binario queda en `src-tauri/target/release/bundle/`.

## Estructura

```
ecom-mobile/
├── src/
│   ├── types/bible.ts                       # tipos del dominio
│   ├── lib/
│   │   ├── cn.ts                            # helper de className
│   │   └── bible/
│   │       ├── catalog.ts                   # metadata de libros
│   │       └── paths.ts                     # utilidades de URL
│   ├── repositories/bible.ts                # acceso a datos (fetch)
│   ├── services/bible.ts                    # casos de uso
│   ├── components/
│   │   ├── atoms/                           # Badge, Button, Icon
│   │   ├── molecules/                       # BookTile, ChapterTile, ...
│   │   ├── organisms/                       # BookList, ChapterView, ...
│   │   └── templates/BibleLayout.tsx
│   ├── pages/                               # HomePage, BookPage, ...
│   ├── styles/globals.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── content/books/<book-id>/<n>.json     # contenido bíblico
│   ├── docs/*.pdf                           # PDFs fuente (opcional)
│   └── *.png, *.webmanifest                 # favicons
├── scripts/
│   └── validate-chapter.mjs                 # validador + auto-fix
├── src-tauri/
│   ├── src/lib.rs                           # shell de Tauri (vacío)
│   ├── capabilities/default.json
│   ├── tauri.conf.json
│   └── Cargo.toml
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Validación

```bash
pnpm validate:chapter public/content/books/genesis/24.json
pnpm validate:chapter:fix public/content/books/genesis/24.json
```

Ver `AGENTS.md` para detalles sobre el flujo de traducción y el validador.

## Plataformas soportadas

- ✅ macOS, Windows, Linux (escritorio, vía Tauri)
- ❌ Android, iOS (Tauri los soporta, pero este proyecto no compila para móvil todavía)

## Notas

- El proyecto **no** incluye una traducción religiosa, doctrinal ni confesional. Ver `AGENTS.md` para la filosofía completa.
- El backend Rust no expone comandos custom. Los datos son estáticos.
- El tema sigue `prefers-color-scheme` (claro/oscuro automático del sistema).