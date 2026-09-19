import { createContext, useContext } from "react";

/* ============================================================================
   The site's loose words.

   A handful of words belong to no page: the label on an empty picture frame,
   "Cerrar" on the photo viewer, the link that skips to the content. They live
   in `site.json` under "ui" — in each language's own copy of that file — and
   App.js hands them down through this context rather than threading them
   through every page's props, because a frame deep inside a card has no other
   business with the site file.

   A word missing from the file falls back to the Spanish below, so an older or
   half-translated file never leaves a blank.
   ============================================================================ */

export const DEFAULT_WORDS = {
    skipLink: "Saltar al contenido",
    home: "Inicio",
    close: "Cerrar",
    reserved: "Espacio reservado para una fotografía",
    filterBooks: "Filtrar por género",
    all: "Todos",
    newBook: "Nuevo",
    filterEvents: "Clases de encuentro",
    posterFrame: "Afiche",
    coverFrame: "Portada",
    portraitFrame: "Retrato",
    photoFrame: "Fotografía",
    illustration: "Ilustración",
    knit: "Tejido",
    knitPhoto: "Foto del tejido",
    diploma: "Diploma",
    award: "Reconocimiento",
    sections: "Secciones",
    morePoems: "Más poemas",
    missingKicker: "No encontrado",
    missingText: "Puede que el enlace esté mal escrito, o que haya cambiado de dirección.",
    bookMissing: "Ese libro no está aquí",
    allBooks: "Ver todos los libros",
    poemMissing: "Ese poema no está aquí",
    allPoems: "Ver todos los poemas",
    eventMissing: "Ese encuentro no está aquí",
    notFoundKicker: "Página no encontrada",
    notFoundTitle: "Ese hilo se soltó",
    notFoundText: "La dirección que buscabas no existe — o cambió de lugar. Desde aquí se llega a todo lo demás.",
    notFoundHome: "Ir al inicio",
    language: "Idioma",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    readPoem: "Leer el poema →",
    seeBook: "Ver el libro →",
    seeChannel: "Ver el canal",
};

const Words = createContext(DEFAULT_WORDS);

export function WordsProvider({ words, children }) {
    return <Words.Provider value={{ ...DEFAULT_WORDS, ...(words || {}) }}>{children}</Words.Provider>;
}

export function useWords() {
    return useContext(Words);
}
