/**
 * Paths del contenido bíblico, relativos al origen web.
 *
 * En el proyecto anterior (Next.js) la raíz se resolvía con
 * `process.cwd()/content/books`. Aquí todo el contenido vive dentro de
 * `public/` para que Vite lo copie al bundle y Tauri lo embeba al binario.
 * Por eso se accede vía URL absoluta (`/content/...`) en vez de filesystem.
 *
 * Si más adelante queremos generar los capítulos en build time o cargar
 * desde otra fuente, este archivo es el único lugar a tocar.
 */

/** URL base del contenido bíblico, servida por Vite desde public/. */
export const CONTENT_BASE = "/content/books";

/** URL del archivo JSON de un capítulo. */
export function chapterFileUrl(bookId: string, chapter: number): string {
  return `${CONTENT_BASE}/${bookId}/${chapter}.json`;
}

/**
 * URL del directorio de un libro (sin slash final).
 * Útil para pedirle al repo que descubra los capítulos disponibles.
 */
export function bookDirUrl(bookId: string): string {
  return `${CONTENT_BASE}/${bookId}`;
}