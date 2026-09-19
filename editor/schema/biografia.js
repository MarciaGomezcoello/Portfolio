export const BIOGRAFIA = {
    file: "biografia",
    label: "Biografía",
    sections: [
        {
            find: ".pageHead",
            toggle: "headVisible",
            label: "Encabezado",
            help: "Lo de arriba de la página, sobre el rosa.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lede", kind: "prose", label: "Primer párrafo" },
            ],
        },
        {
            find: ".bioGrid",
            toggle: "bioVisible",
            label: "Quién es",
            help: "El retrato, lo que hace y el texto de su vida.",
            fields: [
                { name: "portrait", kind: "image", label: "Retrato", shape: "portraitShape" },
                { name: "body", kind: "prose", label: "El resto de la biografía" },
                {
                    name: "roles", kind: "words", label: "Etiquetas debajo del retrato",
                    help: "Palabras cortas sobre lo que hace: «Escritora», «Poeta», «Instructora de tejido»…",
                },
            ],
        },
        {
            key: "formacion",
            find: ".credsBand",
            toggle: true,
            label: "Formación",
            help: "Su título de médica, presentado como un certificado.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título de la franja" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "degree", kind: "text", label: "Título obtenido",
                    help: "El texto grande del certificado. Vacío, la franja no sale.",
                },
                { name: "place", kind: "text", label: "Universidad" },
                { name: "detail", kind: "text", label: "Ciudad" },
                { name: "photo", kind: "image", label: "Foto del diploma", shape: "shape" },
            ],
        },
        {
            key: "recognition",
            find: ".awardWall",
            toggle: true,
            label: "Reconocimientos",
            help: "Premios, menciones y participaciones.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "items", kind: "list", label: "Los reconocimientos",
                    itemTitle: "title", itemNoun: "reconocimiento",
                    fields: [
                        { name: "title", kind: "text", label: "Título" },
                        {
                            name: "year", kind: "text", label: "Año",
                            help: "Sale en el sello dorado. Vacío, no sale el sello.",
                        },
                        { name: "text", kind: "prose", label: "De qué se trata" },
                        { name: "photo", kind: "image", label: "Foto o diploma", shape: "shape" },
                    ],
                },
            ],
        },
        {
            key: "album",
            find: ".albumBand",
            toggle: true,
            label: "Álbum",
            help: "Las fotos de su vida, en el orden de la lista. Sin fotos, la sección no sale.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "items", kind: "list", label: "Las fotos",
                    itemTitle: "pie", itemNoun: "foto",
                    fields: [
                        { name: "photo", kind: "image", label: "Foto", shape: "shape" },
                        {
                            name: "year", kind: "text", label: "Año o lugar",
                            help: "Sale en dorado, encima del texto de la foto. Puede quedar vacío.",
                        },
                        {
                            name: "pie", kind: "text", label: "Texto debajo de la foto",
                            help: "Una frase corta sobre la foto. Sale escrita debajo de ella, en el álbum.",
                        },
                    ],
                },
            ],
        },
        {
            key: "timeline",
            find: ".timelineBand",
            toggle: true,
            label: "Cronología",
            help: "Los momentos de su vida, en orden.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                {
                    name: "items", kind: "list", label: "Los momentos",
                    itemTitle: "title", itemNoun: "momento",
                    fields: [
                        { name: "year", kind: "text", label: "Año o lugar" },
                        { name: "title", kind: "text", label: "Qué pasó" },
                        { name: "text", kind: "prose", label: "Texto debajo" },
                    ],
                },
            ],
        },
    ],
};
