import { Route, Routes } from "react-router-dom";

import { HomePage } from "@/pages/HomePage";
import { BookPage } from "@/pages/BookPage";
import { ChapterPage } from "@/pages/ChapterPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * Componente raíz. Solo monta el árbol de rutas.
 * Los datos los carga cada página contra `bibleService`.
 *
 * Estructura:
 *   /                      → HomePage (índice de libros)
 *   /:bookId               → BookPage (grilla de capítulos)
 *   /:bookId/:chapter      → ChapterPage (lectura + panel de notas)
 *   *                      → NotFoundPage (404 global)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:bookId" element={<BookPage />} />
      <Route path="/:bookId/:chapter" element={<ChapterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}