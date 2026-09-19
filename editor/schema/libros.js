import { BOOK_FIELDS } from "./shared.js";

export const LIBROS = {
    file: "libros",
    label: "Libros",
    sections: [
        {
            find: ".pageHead",
            toggle: "headVisible",
            label: "Encabezado",
            help: "Lo de arriba de la página.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
            ],
        },
        {
            find: ".shelfBand",
            toggle: "shelfVisible",
            label: "Los libros",
            help: "Cada libro tiene su propia página. El orden de la lista es el orden en que salen.",
            fields: [
                {
                    name: "generos", kind: "words", label: "Los géneros",
                    help: "Las pestañas de arriba, en este orden. El género de cada libro se elige de aquí. Un género quitado deja de tener pestaña; sus libros siguen saliendo en «Todos».",
                },
                {
                    name: "items", kind: "list", label: "Los libros",
                    itemTitle: "title", itemNoun: "libro", fields: BOOK_FIELDS,
                },
                {
                    name: "detail", kind: "group", label: "Página de cada libro",
                    fields: [
                        { name: "backLabel", kind: "text", label: "Enlace para volver" },
                        { name: "synopsisLabel", kind: "text", label: "Título de la sinopsis" },
                        { name: "excerptLabel", kind: "text", label: "Título del fragmento" },
                    ],
                },
            ],
        },
        {
            key: "upcoming",
            find: ".upcomingBand",
            toggle: true,
            label: "Lo que viene",
            help: "Los libros que todavía no salen. Si se vacía el texto, la sección desaparece.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "body", kind: "prose", label: "Qué libro viene" },
                { name: "cover", kind: "image", label: "Imagen al lado", shape: "shape" },
            ],
        },
    ],
};
