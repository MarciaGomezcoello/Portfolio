/* ============================================================================
   Ajustes: what is not a page — the colours, the fonts, the English copy, and
   publishing.

   All of it lives in site.json. A theme and each font are one word the site
   stamps on the page (see src/styles/tokens.css); the swatches, corners and
   font samples below are only a picture of each choice, and must be kept
   roughly in step with that file.

   Every theme also brings its drawings — on the portrait, beside the name, on
   the mastheads, along the footer and through the hero — unless
   "holidayExtras" is switched off. The key kept its first name from when only
   the holidays had them. The drawings are in src/components/common/Fiesta.js
   (holidays) and Temas.js (everyday themes).
   ============================================================================ */

// `radius` is the theme's own corner, drawn on its swatch strip so the choice
// shows its shape as well as its colours.
export const THEMES = [
    {
        value: "papel", label: "Papel", radius: "8px",
        note: "El de siempre: crema y rosa. Con un ovillo junto a su nombre y botones en el pie; su foto queda sin adornos.",
        colors: ["#fdfaf6", "#f8f1e9", "#c0405e", "#c9922a", "#1f1b1a"],
    },
    {
        value: "salvia", label: "Salvia", radius: "4px",
        note: "Verde hoja sobre lino. Con ramitas, una maceta de hierbas y hojas que caen.",
        colors: ["#fbfaf5", "#f3f2e8", "#4d7c47", "#c49a3c", "#1d221d"],
    },
    {
        value: "lavanda", label: "Lavanda", radius: "14px",
        note: "Lila y ciruela, títulos inclinados. Con lavanda, libros de poemas y pétalos.",
        colors: ["#fcfafd", "#f5f0f7", "#8a5fae", "#c9922a", "#221c26"],
    },
    {
        value: "mar", label: "Mar", radius: "10px",
        note: "Azul de lago, con olas. Con gaviotas, un barquito de papel y burbujas.",
        colors: ["#f9fbfc", "#eff4f6", "#2f7d95", "#d0a04a", "#172026"],
    },
    {
        value: "terracota", label: "Terracota", radius: "2px",
        note: "Barro y arena, esquinas rectas. Con un sol y un cántaro de barro.",
        colors: ["#fcf8f3", "#f6ede2", "#b85a36", "#c28a2e", "#2a1d17"],
    },
    {
        value: "noche", label: "Noche", radius: "12px",
        note: "Oscuro, con el rosa encendido. Con una luna, una vela, un libro y estrellas.",
        colors: ["#1b1718", "#2d2627", "#f59aab", "#d9a441", "#f4ece8"],
    },
    {
        value: "durazno", label: "Durazno", radius: "16px",
        note: "Durazno y coral, muy redondo. Con una flor, una canasta de duraznos y banderines.",
        colors: ["#fffaf6", "#fdf0e6", "#b9502f", "#d4a03a", "#2b1f1a"],
    },
    {
        value: "vino", label: "Vino", radius: "0",
        note: "Burdeos formal, como un libro fino. Con cintas de marcapáginas, pluma y tintero.",
        colors: ["#fcf9f4", "#f5eee4", "#8e2f43", "#5a1f2c", "#241a1a"],
    },
    {
        value: "girasol", label: "Girasol", radius: "10px",
        note: "Amarillo y azul, con rayos de sol. Con girasoles y abejitas que vuelan.",
        colors: ["#fffdf5", "#fdf6dc", "#f2c230", "#2c4f86", "#1c2230"],
    },
    {
        value: "cielo", label: "Cielo", radius: "18px",
        note: "Azul de mañana, lo más redondo. Con nubes, un globo aerostático y pajaritos.",
        colors: ["#f9fbfe", "#eef4fb", "#4a78c2", "#e0a35a", "#1b2233"],
    },
    {
        value: "grafito", label: "Grafito", radius: "0",
        note: "Blanco y negro moderno, sin curvas. Con marcas de corte, una pluma y una regla.",
        colors: ["#fbfbfa", "#f2f2f0", "#8c8c8c", "#262626", "#161616"],
    },
    {
        value: "medianoche", label: "Medianoche", radius: "6px",
        note: "Azul noche con dorado. Con una estrella colgada, una constelación y estrellas.",
        colors: ["#111827", "#1f2a40", "#e8bd6a", "#8f99ad", "#eef1f7"],
    },
    // For a season: switched on for the holiday and back afterwards. Each one
    // brings its extras, described in the note.
    {
        value: "navidad", label: "Navidad", group: "Fiestas", radius: "8px",
        note: "Astas de reno en su foto, gorro de Santa, luces y nieve.",
        colors: ["#fdfaf4", "#f6efe2", "#b3262e", "#2f6b3a", "#1f1a17"],
    },
    {
        value: "halloween", label: "Halloween", group: "Fiestas", radius: "4px",
        note: "Sombrero de bruja, murciélagos volando y banderines.",
        colors: ["#15121a", "#26202e", "#ff9636", "#8e4fd6", "#f3ede6"],
    },
    {
        value: "sanvalentin", label: "San Valentín", group: "Fiestas", radius: "14px",
        note: "Un corazón en su foto y corazones cayendo.",
        colors: ["#fffafb", "#fdeff2", "#d6245a", "#ff9bb8", "#2a171c"],
    },
    {
        value: "pascua", label: "Pascua", group: "Fiestas", radius: "18px",
        note: "Orejas de conejo, huevitos pintados y colores pastel.",
        colors: ["#fdfcf8", "#f4f7ef", "#7b5cc4", "#9fd8b5", "#22222b"],
    },
    {
        value: "gracias", label: "Acción de Gracias", group: "Fiestas", radius: "5px",
        note: "Hojas de otoño en su foto, cayendo y en guirnalda.",
        colors: ["#fcf7f0", "#f5eadc", "#b8561c", "#d9a53a", "#2b1d14"],
    },
    {
        value: "anonuevo", label: "Año Nuevo", group: "Fiestas", radius: "2px",
        note: "Gorro de fiesta, confeti y banderines dorados.",
        colors: ["#121214", "#232327", "#e3c27a", "#c9cbd1", "#f2f0ea"],
    },
    {
        value: "muertos", label: "Día de Muertos", group: "Fiestas", radius: "10px",
        note: "Cempasúchil en su foto, papel picado y pétalos.",
        colors: ["#1a1220", "#2c2034", "#ffab3d", "#e8378f", "#fbefe4"],
    },
    {
        value: "madre", label: "Día de la Madre", group: "Fiestas", radius: "14px",
        note: "Un ramo de rosas en su foto y corazones.",
        colors: ["#fffafc", "#fbf0f5", "#c2548a", "#b58ad8", "#2a1d25"],
    },
];

/* The faces. Both "Letra de los títulos" and "Letra del texto" choose from this
   one list, so every face can be used for either. `family` draws the sample in
   the editor and must match the first name in the site's stack in tokens.css;
   `weight` is the weight the site sets titles in. */
export const FONTS = [
    { value: "fraunces", label: "Fraunces", group: "Clásicas", note: "La de siempre: clásica y cálida.", family: "'Fraunces'", weight: 600 },
    { value: "playfair", label: "Playfair", group: "Clásicas", note: "Elegante, de revista.", family: "'Playfair Display'", weight: 700 },
    { value: "cormorant", label: "Cormorant", group: "Clásicas", note: "Antigua, de libro fino.", family: "'Cormorant Garamond'", weight: 600 },
    { value: "lora", label: "Lora", group: "Clásicas", note: "Con serifa, como un libro.", family: "'Lora'", weight: 600 },
    { value: "merriweather", label: "Merriweather", group: "Clásicas", note: "Firme y muy clara.", family: "'Merriweather'", weight: 700 },
    { value: "baskerville", label: "Baskerville", group: "Clásicas", note: "Tradicional, de novela.", family: "'Libre Baskerville'", weight: 700 },
    { value: "sourceserif", label: "Source Serif", group: "Clásicas", note: "Con serifa, fácil de leer.", family: "'Source Serif 4'", weight: 600 },
    { value: "dmserif", label: "DM Serif", group: "Clásicas", note: "Moderna, con mucho contraste.", family: "'DM Serif Display'", weight: 400 },
    { value: "abril", label: "Abril", group: "Clásicas", note: "Gruesa y llamativa, de cartel.", family: "'Abril Fatface'", weight: 400 },
    { value: "inter", label: "Inter", group: "Modernas", note: "Clara y actual.", family: "'Inter'", weight: 700 },
    { value: "montserrat", label: "Montserrat", group: "Modernas", note: "Geométrica, limpia.", family: "'Montserrat'", weight: 700 },
    { value: "poppins", label: "Poppins", group: "Modernas", note: "Redonda y alegre.", family: "'Poppins'", weight: 600 },
    { value: "raleway", label: "Raleway", group: "Modernas", note: "Fina y elegante.", family: "'Raleway'", weight: 700 },
    { value: "lato", label: "Lato", group: "Modernas", note: "Suave y amable.", family: "'Lato'", weight: 700 },
    { value: "nunito", label: "Nunito", group: "Modernas", note: "Redondeada, cercana.", family: "'Nunito'", weight: 800 },
    { value: "worksans", label: "Work Sans", group: "Modernas", note: "Sencilla y firme.", family: "'Work Sans'", weight: 600 },
    { value: "dancing", label: "Dancing", group: "Manuscritas", note: "Manuscrita alegre.", family: "'Dancing Script'", weight: 700 },
    { value: "greatvibes", label: "Great Vibes", group: "Manuscritas", note: "De invitación, muy adornada.", family: "'Great Vibes'", weight: 400 },
    { value: "satisfy", label: "Satisfy", group: "Manuscritas", note: "Pincel suelto, de letrero.", family: "'Satisfy'", weight: 400 },
    { value: "pacifico", label: "Pacifico", group: "Manuscritas", note: "Redonda y juguetona.", family: "'Pacifico'", weight: 400 },
    { value: "caveat", label: "Caveat", group: "Manuscritas", note: "Letra a mano, de cuaderno.", family: "'Caveat'", weight: 700 },
    { value: "kalam", label: "Kalam", group: "Manuscritas", note: "A mano, pero fácil de leer.", family: "'Kalam'", weight: 700 },
];

export const AJUSTES = {
    file: "site",
    label: "Ajustes",
    sections: [
        {
            label: "Colores",
            help: "Cambia los colores de todo el sitio. Nada de lo escrito ni de las fotos cambia.",
            fields: [
                { name: "theme", kind: "theme", label: "Tema", options: THEMES },
                {
                    name: "holidayExtras", kind: "onoff", label: "Adornos del tema", default: true,
                    help: "Cada tema trae sus dibujitos: junto a su foto de la portada, junto a su nombre y en el pie. Los de fiesta adornan también la cabecera de cada página: gorro de Santa, murciélagos, papel picado… Apagado, quedan solo los colores.",
                },
            ],
        },
        {
            label: "Letras",
            help: "Cambia las letras de todo el sitio. Las dos listas tienen las mismas letras. Con una manuscrita en los títulos, los títulos pequeños quedan en una letra que se lee bien; en el texto, el sitio la agranda un poco para que se lea.",
            fields: [
                {
                    name: "fontTitles", kind: "font", label: "Letra de los títulos",
                    options: FONTS, sample: "Marcia Gomezcoello", defaultValue: "fraunces",
                },
                {
                    name: "fontText", kind: "font", label: "Letra del texto", small: true,
                    options: FONTS, sample: "Escribió su primer cuento a los once años, y desde entonces no ha parado.", defaultValue: "inter",
                },
            ],
        },
        {
            // Owns no keys in site.json: it rebuilds the files in en/. English is
            // always offered, and the footer's «Español · English» is fixed in
            // the site's own footer.
            label: "Inglés",
            custom: "english",
            keys: [],
            help: "La versión en inglés del sitio.",
            fields: [],
        },
        {
            // Owns no keys: it publishes the saved site and brings back old
            // versions, and edits nothing itself. See src/Publisher.jsx.
            label: "Publicar",
            custom: "publicar",
            keys: [],
            help:
                "Aplicar guarda los cambios en esta computadora. Publicar los sube al " +
                "sitio en internet, en español y en inglés, y guarda esa versión para " +
                "poder volver a ella.",
            fields: [],
        },
    ],
};
