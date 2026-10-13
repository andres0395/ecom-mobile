import { useEffect, useState } from "react";

import { BibleLayout } from "@/components/templates/BibleLayout";
import { BookList } from "@/components/organisms/BookList";
import { bibleService } from "@/services/bible";

import type { Book } from "@/types/bible";

/**
 * Página de inicio: lista de libros agrupados por testamento.
 * Carga async contra `bibleService` y muestra estados de loading / error.
 */
export function HomePage() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    bibleService
      .listBooks()
      .then((b) => {
        if (!cancelled) setBooks(b);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BibleLayout>
      <section className="mb-12">
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
          Biblia
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
          Traducción basada en la intención del autor y el contexto histórico y
          lingüístico de cada texto, sin doctrina religiosa.
        </p>
      </section>

      {error ? (
        <p className="text-sm text-[var(--color-muted)]">
          Error al cargar los libros: {error}
        </p>
      ) : !books ? (
        <p className="text-sm text-[var(--color-muted)]">Cargando…</p>
      ) : (
        (() => {
          const { old, new: newTestament } = bibleService.groupByTestament(books);
          return (
            <>
              <BookList title="Antiguo Testamento" books={old} />
              <BookList title="Nuevo Testamento" books={newTestament} />
            </>
          );
        })()
      )}
    </BibleLayout>
  );
}