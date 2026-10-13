import { BOOK_CATALOG } from "@/lib/bible/catalog";
import { chapterFileUrl } from "@/lib/bible/paths";

import type { Book, Chapter } from "@/types/bible";

/**
 * Contrato del repositorio bíblico.
 *
 * Esta interfaz existe aunque hoy tenga una sola implementación (HTTP)
 * porque:
 *   1. documenta el contrato que la capa de servicio consume,
 *   2. permite swap a otra fuente (DB, CMS, API) sin tocar servicios ni UI,
 *   3. hace triviales los tests de servicio con un mock in-memory.
 */
export interface IBibleRepository {
  /** Lista los libros disponibles, ordenados por `order` ascendente. */
  listBooks(): Promise<Book[]>;

  /** Devuelve un libro por id, o `null` si no existe. */
  findBook(bookId: string): Promise<Book | null>;

  /**
   * Devuelve un capítulo, o `null` si el libro no existe o el capítulo
   * no tiene archivo JSON.
   */
  findChapter(bookId: string, chapter: number): Promise<Chapter | null>;
}

/**
 * Implementación HTTP del repositorio.
 *
 * Los JSON viven en `public/content/books/<book-id>/<n>.json`. Para descubrir
 * qué capítulos existen de un libro, hacemos un HEAD probe del 1 al
 * totalChapters canónico (los capítulos son contiguos). Esto evita tener
 * que mantener un manifest a mano cuando se traduce uno nuevo.
 *
 * Para mantenerlo performante cacheamos el `Promise<Book>` por libro: si el
 * servicio pide el mismo libro varias veces (ej. para calcular navegación),
 * no repetimos los HEADs.
 *
 * Si en el futuro el set de libros crece mucho o la detección se vuelve
 * lenta, cambiar a un `manifest.json` global es trivial: agregar acá y listo.
 */
class HttpBibleRepository implements IBibleRepository {
  private readonly bookCache = new Map<string, Promise<Book | null>>();

  async listBooks(): Promise<Book[]> {
    const ids = Object.keys(BOOK_CATALOG).sort((a, b) => {
      const orderA = BOOK_CATALOG[a]?.order ?? Infinity;
      const orderB = BOOK_CATALOG[b]?.order ?? Infinity;
      return orderA - orderB;
    });

    const books = await Promise.all(ids.map((id) => this.findBook(id)));
    return books.filter((b): b is Book => b !== null);
  }

  findBook(bookId: string): Promise<Book | null> {
    const cached = this.bookCache.get(bookId);
    if (cached) return cached;

    const promise = this.detectBook(bookId);
    this.bookCache.set(bookId, promise);
    return promise;
  }

  private async detectBook(bookId: string): Promise<Book | null> {
    const meta = BOOK_CATALOG[bookId];
    if (!meta) return null;

    const probes = Array.from({ length: meta.totalChapters }, (_, i) => i + 1);
    const results = await Promise.all(
      probes.map(async (n) => {
        try {
          const res = await fetch(chapterFileUrl(bookId, n), { method: "HEAD" });
          // Importante: tanto Vite (dev) como el WebView de Tauri (prod)
          // resuelven rutas no encontradas con un fallback del SPA
          // (devuelven index.html con Content-Type: text/html y status 200).
          // Validar solo `res.ok` haría creer que el capítulo existe.
          // Comprobamos Content-Type para distinguir un JSON real del HTML.
          const contentType = res.headers.get("content-type") ?? "";
          return res.ok && contentType.includes("application/json") ? n : null;
        } catch {
          return null;
        }
      }),
    );

    const chapters = results
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    if (chapters.length === 0) return null;

    return { id: bookId, ...meta, chapters };
  }

  async findChapter(bookId: string, chapter: number): Promise<Chapter | null> {
    if (!Number.isInteger(chapter) || chapter < 1) return null;
    const meta = BOOK_CATALOG[bookId];
    if (!meta) return null;

    let res: Response;
    try {
      res = await fetch(chapterFileUrl(bookId, chapter));
    } catch {
      return null;
    }
    if (!res.ok) return null;

    try {
      const parsed = (await res.json()) as Chapter;
      // Validación mínima de forma.
      if (
        typeof parsed.bookId !== "string" ||
        typeof parsed.number !== "number" ||
        !Array.isArray(parsed.verses)
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}

export const bibleRepository: IBibleRepository = new HttpBibleRepository();