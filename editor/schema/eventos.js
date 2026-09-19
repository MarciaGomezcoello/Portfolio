import { EVENT_FIELDS, UPCOMING_EVENTOS_FIELDS } from "./shared.js";

export const EVENTOS = {
    file: "eventos",
    label: "Eventos",
    sections: [
        {
            find: ".pageHead",
            toggle: "headVisible",
            label: "Encabezado",
            help: "Lo de arriba de la página.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "subtitle", kind: "text", label: "Subtítulo" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
            ],
        },
        {
            // The band's own heading sits at the top of eventos.json, beside
            // the encounter rather than inside it, so the encounter stays the
            // same model it is everywhere else.
            find: ".nextBand",
            toggle: true,
            toggleIn: "upcoming",
            label: "El próximo",
            help:
                "Uno solo. Cuando pase, se cambian sus datos por los del siguiente. " +
                "Si se dejan la fecha y el título vacíos, la franja desaparece sola.",
            fields: [
                { name: "upcomingKicker", kind: "text", label: "La palabrita de arriba" },
                {
                    name: "upcomingTitle", kind: "text", label: "Título de la franja",
                    help: "Vacío, el próximo encuentro sale sin título.",
                },
                { name: "upcoming", kind: "group", label: "El encuentro", flat: true, fields: UPCOMING_EVENTOS_FIELDS },
            ],
        },
        {
            key: "past",
            find: ".archiveBand",
            toggle: true,
            label: "El archivo",
            help: "Los encuentros que ya pasaron. Los años de arriba del archivo («2019 — 2024») no se escriben: salen solos del «Año» de cada encuentro.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "categorias", kind: "list", label: "Las clases de encuentro",
                    itemTitle: "nombre", itemNoun: "clase",
                    help: "Las clases que se eligen en cada encuentro: tertulia, recital, taller… Cada una con su pestaña en el archivo, en este orden. Una clase quitada de aquí deja de tener pestaña. La línea de presentación es opcional.",
                    fields: [
                        { name: "nombre", kind: "text", label: "Nombre de la clase" },
                        {
                            name: "texto", kind: "prose", label: "Línea de presentación",
                            help: "Opcional. Sale en el archivo al elegir esa pestaña.",
                        },
                    ],
                },
                {
                    name: "items", kind: "list", label: "Los encuentros",
                    itemTitle: "title", itemNoun: "encuentro",
                    // Her role, the poster, the short note and the extra link
                    // only show on the next encounter, so an encounter in the
                    // archive does not offer them.
                    fields: EVENT_FIELDS.filter((f) => !["rol", "poster", "note", "linkLabel", "linkUrl"].includes(f.name)),
                },
                {
                    name: "detalle", kind: "group", label: "Página de cada encuentro",
                    fields: [
                        { name: "backLabel", kind: "text", label: "Enlace para volver" },
                        { name: "detalleLabel", kind: "text", label: "Enlace para abrir un encuentro" },
                    ],
                },
            ],
        },
    ],
};
