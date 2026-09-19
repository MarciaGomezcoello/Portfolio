export const ARTE = {
    file: "arte",
    label: "Arte",
    sections: [
        {
            find: ".pageHead",
            toggle: "headVisible",
            label: "Encabezado",
            help: "Lo de arriba de la página, sobre el rosa. Si se deja el título vacío, la página empieza por los poemas.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
            ],
        },
        {
            key: "poems",
            find: ".poemsBand",
            toggle: true,
            label: "Poemas",
            help: "Cada poema tiene su propia página. El orden de la lista es el orden en que salen.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "items", kind: "list", label: "Los poemas",
                    itemTitle: "title", itemNoun: "poema",
                    fields: [
                        { name: "title", kind: "text", label: "Título" },
                        {
                            name: "source", kind: "text", label: "De dónde sale",
                            help: "El libro, o «Inédito».",
                        },
                        { name: "year", kind: "text", label: "Año" },
                        {
                            name: "preview", kind: "poem", label: "Vista previa", rows: 3,
                            help: "Unas líneas del poema para la lista de Arte, las que mejor lo presenten. Vacía, salen sus primeras dos líneas.",
                        },
                        {
                            name: "body", kind: "poem", label: "El poema completo",
                            help: "Sale entero en la página del poema. Cada salto de línea se respeta; una línea en blanco abre una estrofa.",
                        },
                        { name: "photo", kind: "image", label: "Imagen al lado", shape: "shape" },
                    ],
                },
                {
                    name: "detail", kind: "group", label: "Página de cada poema",
                    fields: [
                        { name: "backLabel", kind: "text", label: "Enlace para volver" },
                        { name: "prevLabel", kind: "text", label: "Botón «anterior»" },
                        { name: "nextLabel", kind: "text", label: "Botón «siguiente»" },
                    ],
                },
            ],
        },
        {
            key: "songs",
            find: ".songsBand",
            toggle: true,
            label: "Canciones",
            help: "Una pared de tarjetas, una por canción. Al tocar una, el video se abre ahí mismo.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "items", kind: "list", label: "Las canciones",
                    itemTitle: "title", itemNoun: "canción",
                    fields: [
                        { name: "title", kind: "text", label: "Título" },
                        { name: "year", kind: "text", label: "Año" },
                        { name: "note", kind: "prose", label: "Texto debajo del título" },
                        { name: "photo", kind: "image", label: "Foto antes de tocar play" },
                        {
                            name: "video", kind: "video", label: "Video",
                            help: "Sin video, la canción sale igual, sin botón.",
                        },
                    ],
                },
            ],
        },
    ],
};
