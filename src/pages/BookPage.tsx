import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { BibleLayout } from "@/components/templates/BibleLayout";
import { ChapterGrid } from "@/components/organisms/ChapterGrid";
import { bibleService } from "@/services/bible";

import type { Book } from "@/types/bible";

/**
 * Página de un libro: header con metadata + grilla de capítulos.
 * Capítulos sin archivo JSON se muestran como celdas deshabilitadas.
 */
export function BookPage() {
  const { bookId = "" } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setBook(undefined);
    bibleService
      .getBook(bookId)
      .then((b) => {
        if (!cancelled) setBook(b);
      })
      .catch(() => {
        if (!cancelled) setBook(null);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (book === undefined) {
    return (
      <BibleLayout>
        <p className="text-sm text-[var(--color-muted)]">Cargando…</p>
      </BibleLayout>
    );
  }

  if (book === null) {
    return <NotFoundShell message="El libro que buscás no existe." />;
  }

  return (
    <BibleLayout crumbs={[{ label: book.title }]}>
      <header className="mb-10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {book.abbreviation} ·{" "}
          {book.testament === "old" ? "Antiguo Testamento" : "Nuevo Testamento"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
          {book.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {book.chapters.length} de {book.totalChapters} capítulos disponibles
        </p>
      </header>

      <ChapterGrid
        bookId={book.id}
        totalChapters={book.totalChapters}
        availableChapters={book.chapters}
      />
    </BibleLayout>
  );
}

/** Shell de "no encontrado" usado cuando el libro no existe en el catálogo. */
function NotFoundShell({ message }: { message: string }) {
  return (
    <BibleLayout>
      <div className="py-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          404
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          No encontramos ese texto
        </h1>
        <p className="mx-auto mb-8 max-w-md text-[var(--color-muted)]">
          {message}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--color-rule)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-rule)]/30"
        >
          Volver al inicio
        </a>
      </div>
    </BibleLayout>
  );
}