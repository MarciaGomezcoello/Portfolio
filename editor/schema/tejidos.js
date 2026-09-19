export const TEJIDOS = {
    file: "tejidos",
    label: "Tejidos",
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
            find: ".channelGrid",
            toggle: "channelsVisible",
            label: "Los canales",
            help: "Los dos canales, como salen en esta página.",
            fields: [
                { name: "channelsKicker", kind: "text", label: "La palabrita de arriba" },
                {
                    name: "channelsTitle", kind: "text", label: "Título",
                    help: "Vacío, los canales salen sin título.",
                },
                {
                    name: "channels", kind: "list", label: "Los canales",
                    itemTitle: "short", itemNoun: "canal",
                    fields: [
                        {
                            name: "short", kind: "text", label: "Nombre corto",
                            help: "Es también la etiqueta de los videos de ese canal.",
                        },
                        { name: "name", kind: "text", label: "Nombre completo" },
                        { name: "description", kind: "prose", label: "Descripción del canal" },
                        { name: "url", kind: "url", label: "Dirección del canal" },
                        { name: "logo", kind: "image", label: "Logo" },
                    ],
                },
            ],
        },
        {
            key: "featured",
            find: ".reelBand",
            toggle: true,
            label: "Videos",
            help: "Los videos escogidos. Al tocar uno, se abre ahí mismo.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "items", kind: "list", label: "Los videos",
                    itemTitle: "title", itemNoun: "video",
                    fields: [
                        { name: "title", kind: "text", label: "Título" },
                        { name: "note", kind: "text", label: "Línea debajo del título" },
                        {
                            name: "channel", kind: "text", label: "De qué canal es",
                            help: "El nombre corto del canal: «Crochet» o «Palillos».",
                        },
                        { name: "photo", kind: "image", label: "Foto antes de tocar play" },
                        { name: "video", kind: "video", label: "Video" },
                    ],
                },
            ],
        },
        {
            key: "playlists",
            find: ".playlistCard",
            toggle: true,
            label: "Lo que se enseña",
            help: "Cajas con los temas de los canales.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                {
                    name: "items", kind: "list", label: "Los temas",
                    itemTitle: "name", itemNoun: "tema",
                    fields: [
                        { name: "name", kind: "text", label: "Tema" },
                        { name: "note", kind: "text", label: "Línea debajo del tema" },
                    ],
                },
            ],
        },
        {
            key: "gallery",
            find: ".galleryBand",
            toggle: true,
            label: "Galería",
            help: "Prendas terminadas, colgadas del hilo. Sin piezas, la sección no sale.",
            fields: [
                { name: "kicker", kind: "text", label: "La palabrita de arriba" },
                { name: "title", kind: "text", label: "Título" },
                { name: "lead", kind: "prose", label: "Texto de entrada" },
                {
                    name: "items", kind: "list", label: "Las piezas",
                    itemTitle: "title", itemNoun: "pieza",
                    fields: [
                        { name: "title", kind: "text", label: "Nombre de la prenda" },
                        {
                            name: "note", kind: "text", label: "Línea debajo del nombre",
                            help: "El material, el punto, para quién fue.",
                        },
                        { name: "photo", kind: "image", label: "Foto de la prenda", shape: "shape" },
                    ],
                },
            ],
        },
    ],
};
