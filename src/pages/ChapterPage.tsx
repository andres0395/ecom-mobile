import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BibleLayout } from "@/components/templates/BibleLayout";
import { ChapterView } from "@/components/organisms/ChapterView";
import { ChapterNav } from "@/components/organisms/ChapterNavigation";
import { bibleService } from "@/services/bible";

import type { Book, Chapter } from "@/types/bible";
import type { ChapterNavigation } from "@/services/bible";

type LoadedState = {
  status: "ok";
  book: Book;
  chapter: Chapter;
  navigation: ChapterNavigation;
};

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | LoadedState;

/**
 * Página de un capítulo. Carga libro + capítulo + navegación en paralelo.
 * Estado único discriminado para que el render sea explícito.
 */
export function ChapterPage() {
  const { bookId = "", chapter: chapterParam = "" } = useParams<{
    bookId: string;
    chapter: string;
  }>();
  const n = Number.parseInt(chapterParam, 10);

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    const validChapter = Number.isInteger(n) && n > 0;
    if (!validChapter) {
      setState({ status: "missing" });
      return;
    }

    Promise.all([
      bibleService.getBook(bookId),
      bibleService.getChapter(bookId, n),
      bibleService.getChapterNavigation(bookId, n),
    ])
      .then(([book, chapterData, navigation]) => {
        if (cancelled) return;
        if (!book || !chapterData) {
          setState({ status: "missing" });
        } else {
          setState({ status: "ok", book, chapter: chapterData, navigation });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, n]);

  if (state.status === "loading") {
    return (
      <BibleLayout>
        <p className="text-sm text-[var(--color-muted)]">Cargando…</p>
      </BibleLayout>
    );
  }

  if (state.status === "missing") {
    return <MissingChapter />;
  }

  if (state.status === "error") {
    return (
      <BibleLayout>
        <p className="text-sm text-[var(--color-muted)]">
          Error al cargar el capítulo: {state.message}
        </p>
      </BibleLayout>
    );
  }

  const { book, chapter, navigation } = state;
  return (
    <BibleLayout
      crumbs={[
        { label: book.title, href: `/${book.id}` },
        { label: `Capítulo ${chapter.number}` },
      ]}
    >
      <ChapterView chapter={chapter} />
      <ChapterNav
        navigation={navigation}
        currentLabel={`${book.abbreviation} ${chapter.number}`}
      />
    </BibleLayout>
  );
}

function MissingChapter() {
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
          El libro o capítulo que buscás no existe, o todavía no fue
          traducido.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--color-rule)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-rule)]/30"
        >
          Volver al inicio
        </Link>
      </div>
    </BibleLayout>
  );
}