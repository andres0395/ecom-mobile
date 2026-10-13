import { Link } from "react-router-dom";

import { BibleLayout } from "@/components/templates/BibleLayout";

/** Página 404 global (cualquier ruta no matcheada). */
export function NotFoundPage() {
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
          La ruta que pediste no existe.
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