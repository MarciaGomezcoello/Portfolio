/* ============================================================================
   The models that appear in more than one place.

   A book on the cover page and a book on the Libros page are separate copies —
   each page owns its data — but they are the SAME shape, and each copy carries
   every field of it, because pressing one hands the whole object to its detail
   page. So the shape is written once, here, and both forms use it.
   ============================================================================ */

export const BOOK_FIELDS = [
    { name: "title", kind: "text", label: "Título" },
    { name: "year", kind: "text", label: "Año" },
    {
        name: "categoria", kind: "category", label: "Género",
        help: "Agrupa los libros en pestañas en la página de Libros. Se elige de «Los géneros», en Libros › Los libros; para uno nuevo, añádalo allí primero.",
        optionsFrom: [{ file: "libros", path: "generos" }],
        emptyLabel: "— Sin género —",
    },
    { name: "cover", kind: "image", label: "Carátula", shape: "shape" },
    {
        name: "tagline", kind: "text", label: "Frase corta bajo el título",
        help: "Sale debajo del título, en la lista de libros y en la página del libro.",
    },
    { name: "pages", kind: "text", label: "Número de páginas" },
    { name: "synopsis", kind: "prose", label: "Sinopsis" },
    {
        name: "excerpt", kind: "prose", label: "Un fragmento",
        help: "Opcional. Si se deja vacío, esa parte no sale.",
    },
    {
        name: "buyLabel", kind: "text", label: "Botón de compra: lo que dice",
        help: "Por ejemplo «Comprar en Amazon». Sale en la página del libro.",
    },
    {
        name: "buyUrl", kind: "url", label: "Botón de compra: adónde lleva",
        help: "La página del libro en Amazon o en la tienda que sea. Vacía, no sale el botón.",
    },
];

// One encounter, identical wherever it appears.
export const EVENT_FIELDS = [
    {
        name: "rol", kind: "text", label: "Su papel",
        help: "«Organiza» si el encuentro es suyo; «Invitada» si va a uno ajeno.",
    },
    {
        name: "categoria", kind: "category", label: "Clase de encuentro",
        help: "Se elige de las clases escritas arriba, en «Las clases de encuentro». Para una clase nueva, añádala allí primero.",
        optionsFrom: [{ file: "eventos", path: "past.categorias", field: "nombre" }],
        emptyLabel: "— Sin clase —",
    },
    { name: "date", kind: "text", label: "Fecha" },
    { name: "time", kind: "text", label: "Hora" },
    {
        name: "year", kind: "text", label: "Año",
        help: "Con los años de los encuentros se arman solos los años de arriba del archivo, como «2019 — 2024»: del más antiguo al más reciente.",
    },
    { name: "title", kind: "text", label: "Título del encuentro" },
    { name: "venue", kind: "text", label: "Lugar" },
    { name: "city", kind: "text", label: "Ciudad" },
    { name: "poster", kind: "image", label: "Afiche", shape: "posterShape" },
    {
        name: "photo", kind: "image", label: "Foto del archivo", shape: "shape",
        help: "La que se ve en el archivo de encuentros y encabeza su galería.",
    },
    { name: "note", kind: "prose", label: "Nota breve" },
    {
        name: "body", kind: "prose", label: "El relato",
        help: "Lo que se lee al abrir el encuentro. Con relato o con fotos, el encuentro tiene su propia página.",
    },
    {
        name: "fotos", kind: "list", label: "Fotos del encuentro",
        itemNoun: "foto", itemNumbered: "Foto",
        fields: [
            { name: "src", kind: "image", label: "Foto", shape: "shape" },
        ],
    },
    {
        name: "linkLabel", kind: "text", label: "Enlace extra: lo que dice",
        help: "Opcional. Un enlace a otra página de internet — la inscripción, el anuncio de la biblioteca… Sale debajo de los datos del encuentro, por ejemplo «Inscribirse». Vacío, no sale.",
    },
    {
        name: "linkUrl", kind: "url", label: "Enlace extra: adónde lleva",
        help: "La dirección completa de esa página, empezando por https://",
    },
];

/* The encounter still to come, as the editor shows it. The JSON keeps the
   whole model above — pressing it still hands every key to its page — but the
   form offers only what she can see change for an encounter that has not
   happened yet. Left out: the kind of encounter (it only sorts the archive
   into tabs, and on the page it would replace «Su papel»), the year (the page
   shows it only when there is no date), and the archive photo (it would take
   the poster's place on the page). */
const pick = (...names) => names.map((n) => EVENT_FIELDS.find((f) => f.name === n));

const ROL_UPCOMING = { ...pick("rol")[0], help: "«Organiza» si el encuentro es suyo; «Invitada» si va a uno ajeno. Sale sobre el título." };
const BODY_UPCOMING = { ...pick("body")[0], help: "Lo que se lee al abrir el encuentro. Con relato o con fotos, el encuentro tiene su propia página." };

// On the cover page: the strip, and the page it opens.
export const UPCOMING_HOME_FIELDS = [
    ROL_UPCOMING,
    ...pick("date", "time", "title", "venue", "city", "poster"),
    BODY_UPCOMING,
    ...pick("fotos"),
];

// On the Eventos page, whose band also shows a note and a button.
export const UPCOMING_EVENTOS_FIELDS = [
    ROL_UPCOMING,
    ...pick("date", "time", "title", "venue", "city", "poster", "note"),
    BODY_UPCOMING,
    ...pick("fotos", "linkLabel", "linkUrl"),
];
