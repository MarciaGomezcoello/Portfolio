/* ============================================================================
   What the cover page is made of.

   Every page of the editor has a file like this one, and every control on the
   screen is built from a `kind` in it — see pages.js for how they fit together.

   Two rules for anyone extending any of them:

   1. A `label` is what Marcia reads. Never let a field's programmer-name reach
      the screen: "kicker" is "la palabrita de arriba", not "kicker".
   2. A list's items carry the COMPLETE model of their type, including fields
      this page never draws — the cover page hands the whole object to the book
      or encounter page when it is pressed. Do not trim a list down to the
      fields its own view uses.
   ============================================================================ */

import { BOOK_FIELDS, UPCOMING_HOME_FIELDS } from "./shared.js";
import { MENU_Y_PIE } from "./sitio.js";

export const HOME = {
    file: "home",
    label: "Portada",
    sections: [
        {
            key: "hero",
            find: ".hero",
            toggle: true,
            label: "Portada",
            help: "Lo primero que se ve al abrir la página.",
            fields: [
                { name: "greeting", kind: "text", label: "Saludo" },
                { name: "honorific", kind: "text", label: "Título antes del nombre" },
                { name: "name", kind: "text", label: "Su nombre" },
                {
                    name: "roles", kind: "words",
                    label: "Las palabras que van cambiando",
                    help: "Se escriben solas, una tras otra, debajo del nombre.",
                },
                { name: "intro", kind: "prose", label: "Presentación" },
                { name: "photo", kind: "image", label: "Retrato", shape: "photoShape" },
                {
                    name: "primaryLabel", kind: "text", label: "Botón a los libros",
                    help: "Las palabras del botón que lleva a la página de Libros. Vacío, no sale.",
                },
                {
                    name: "secondaryLabel", kind: "text", label: "Botón a los tejidos",
                    help: "Las palabras del botón que lleva a la página de Tejidos. Vacío, no sale.",
                },
                {
                    name: "place", kind: "text", label: "Línea de los lugares",
                    help: "La línea pequeña debajo de los botones, por ejemplo «Azogues, Ecuador · Queens, Nueva York».",
                },
            ],
        },
        {
            key: "proximo",
            find: ".homeNextBand",
            toggle: true,
            label: "Lo próximo",
            help:
                "El próximo encuentro. Es la copia de la portada: cambiarla no " +
                "toca la página de Eventos. Si se dejan la fecha y el título " +
                "vacíos, la franja desaparece sola.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                {
                    name: "title", kind: "text", label: "Título de la franja",
                    help: "Vacío, la franja sale sin título.",
                },
                {
                    name: "detalleLabel", kind: "text", label: "Enlace para abrir el encuentro",
                    help: "Vacío, no sale el enlace. Úselo así si el encuentro todavía no tiene página.",
                },
                {
                    name: "todosLabel", kind: "text", label: "Enlace a la página de Eventos",
                    help: "Sale solo cuando la franja no tiene título.",
                },
                {
                    name: "evento", kind: "group", label: "El encuentro", open: true,
                    fields: UPCOMING_HOME_FIELDS,
                },
            ],
        },
        {
            key: "books",
            find: ".booksBand",
            toggle: true,
            label: "Libros",
            help:
                "Los libros de la portada. Elija uno de la página de Libros y se " +
                "copia entero, con su sinopsis y su enlace de compra. Después son " +
                "copias separadas: cambiar uno aquí no toca la página de Libros.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título de la franja" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                { name: "linkLabel", kind: "text", label: "Enlace a todos los libros" },
                {
                    name: "items", kind: "list", label: "Los libros",
                    itemTitle: "title", itemNoun: "libro", fields: BOOK_FIELDS,
                    // "+ Elegir un libro de Libros": copies a whole book in.
                    source: { file: "libros", key: "items", label: "Libros", image: "cover", detail: "year" },
                },
            ],
        },
        {
            key: "poem",
            find: ".poemBand",
            toggle: true,
            label: "Poema",
            help: "Un poema suyo, impreso entero en la portada.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                {
                    name: "heading", kind: "text", label: "Título de la franja",
                    help: "Vacío, la franja sale sin título.",
                },
                { name: "title", kind: "text", label: "Título del poema" },
                { name: "body", kind: "poem", label: "El poema" },
                {
                    name: "attribution", kind: "text", label: "De dónde sale el poema",
                    help: "El libro, o «Inédito». Sale debajo del poema.",
                },
                { name: "photo", kind: "image", label: "Imagen al lado", shape: "photoShape" },
                { name: "linkLabel", kind: "text", label: "Enlace a más poemas" },
            ],
        },
        {
            key: "tejidos",
            find: ".tejidosBand",
            toggle: true,
            label: "Tejidos",
            help: "Los dos canales, como salen en la portada.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título de la franja" },
                { name: "text", kind: "prose", label: "Texto de entrada" },
                { name: "video", kind: "video", label: "Video al lado de los canales" },
                { name: "linkLabel", kind: "text", label: "Enlace a los tejidos" },
                {
                    name: "channels", kind: "list", label: "Los canales",
                    itemTitle: "short", itemNoun: "canal",
                    fields: [
                        { name: "short", kind: "text", label: "Nombre corto" },
                        { name: "url", kind: "url", label: "Dirección del canal" },
                        { name: "logo", kind: "image", label: "Logo" },
                    ],
                },
            ],
        },
        {
            key: "quote",
            find: ".quoteBand",
            toggle: true,
            label: "La frase",
            help: "Una frase suya, que cierra la portada.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                {
                    name: "title", kind: "text", label: "Título de la franja",
                    help: "Vacío, la franja sale sin título.",
                },
                { name: "text", kind: "prose", label: "La frase" },
                { name: "source", kind: "text", label: "Quién la dice" },
            ],
        },
        MENU_Y_PIE,
    ],
};
