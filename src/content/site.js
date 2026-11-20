// ============================================================================
// Content loader.
//
// Every word and picture on this site lives in the JSON files beside this one,
// so the site can be updated without opening a single component. One file per
// page, plus `site.json` for the things that appear on every page (the name,
// the navigation, the footer, how to get in touch).
//
// Images: drop files into `public/content/` and reference them by file name
// ("portada.jpg"). A full "https://..." URL works too. Leave a value as "" and
// the page shows a designed placeholder frame instead — never a broken image.
// ============================================================================

import site from "./site.json";
import home from "./home.json";
import libros from "./libros.json";
import arte from "./arte.json";
import tejidos from "./tejidos.json";
import eventos from "./eventos.json";
import biografia from "./biografia.json";

// The English copy of every file, kept in `en/` with the same names. Only the
// words differ; the editing app builds these from the Spanish files.
import siteEn from "./en/site.json";
import homeEn from "./en/home.json";
import librosEn from "./en/libros.json";
import arteEn from "./en/arte.json";
import tejidosEn from "./en/tejidos.json";
import eventosEn from "./en/eventos.json";
import biografiaEn from "./en/biografia.json";

const english = {
    site: siteEn, home: homeEn, libros: librosEn, arte: arteEn,
    tejidos: tejidosEn, eventos: eventosEn, biografia: biografiaEn,
};

const BASE = process.env.PUBLIC_URL || "";

// Resolve an image reference to a usable src, or null when there is nothing to
// show. Callers render a placeholder on null rather than an empty <img>.
export function asset(name) {
    if (!name || typeof name !== "string") return null;
    const trimmed = name.trim();
    if (trimmed === "") return null;
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
    return `${BASE}/content/${trimmed.replace(/^\/+/, "")}`;
}

// A video reference is either a file she dropped into `public/content/`
// ("clase.mp4") or a link to a player somewhere else — YouTube, Vimeo, anything
// that hands out an embed address. A file plays in the page's own player; a
// link is framed. Nothing here is YouTube-specific, and an unrecognised value
// is treated as a link rather than guessed at.
const VIDEO_FILE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;

export function videoSource(value) {
    if (!hasText(value)) return null;
    const trimmed = value.trim();
    if (VIDEO_FILE.test(trimmed)) {
        return { kind: "file", src: asset(trimmed) };
    }
    return { kind: "embed", src: trimmed };
}

// Which of her channels a video belongs to. Matched on the short name the
// channel already carries in site.json ("Crochet", "Palillos"), so the tag on a
// video is the same word as the channel it came from and there is nothing to
// keep in sync. An unrecognised value still shows as typed — it just does not
// take a channel's colour.
export function channelIndex(name, channels) {
    if (!hasText(name) || !Array.isArray(channels)) return -1;
    const wanted = name.trim().toLowerCase();
    return channels.findIndex(
        (ch) => hasText(ch.short) && ch.short.trim().toLowerCase() === wanted
    );
}

// Split a multi-line field into lines, keeping blank lines so they can be
// rendered as stanza or paragraph breaks.
export function toLines(text) {
    if (text === undefined || text === null) return [];
    return String(text).replace(/\r\n/g, "\n").split("\n");
}

// True when a value is a non-empty array.
export function hasItems(value) {
    return Array.isArray(value) && value.length > 0;
}

/* ---------------------------------------------------------------------------
   Picture shapes.

   Every picture on this site that is not a video — a book cover, a poster, a
   photograph of an evening, a finished garment, a framed diploma, the
   illustration beside a poem — is one of three shapes, written in the JSON as
   a single word:

       "cuadrado"    square
       "alto"        standing: taller than it is wide
       "ancho"       lying: wider than it is tall

   That is the whole vocabulary, and it is the same word in every file, so an
   editing tool can offer the same three choices everywhere and never has to
   ask anybody to type "4 / 3". Anything unrecognised — a typo, an empty value,
   a shape that was removed — falls back to the standing one rather than
   distorting a picture.

   TO ADD A FOURTH SHAPE: add one line to each set below and one line to
   SHAPES. Nothing else on the site needs to change; every picture already
   reads its ratio from here.

   Why two sets rather than one table. A book is a genuinely more slender
   object than a photograph, and a wall of garments hung side by side wants
   less variation than a shelf of covers does — the user found a wider spread
   "too much size difference" there. So the three *names* are universal and the
   proportions those names resolve to depend on what kind of picture it is. The
   set is chosen by the component, never written in the JSON: whoever edits the
   content picks a shape and the site decides how slender that shape is here.
   --------------------------------------------------------------------------- */

export const SHAPES = ["cuadrado", "alto", "ancho"];

export const SHAPE_SETS = {
    // The wall set, for pictures that hang beside each other: the knitting
    // gallery, the recognitions, the illustrations beside a poem, a portrait.
    // Kept close to square on purpose — enough difference to tell the three
    // apart on one line, not so much that a standing piece towers over a lying
    // one two places along. At a given width these come out about 0.83, 1.00
    // and 1.20 times as tall.
    wall: {
        cuadrado: "1 / 1",
        alto: "5 / 6",
        ancho: "6 / 5",
    },

    // The print set, for things that were printed or photographed and have a
    // proportion of their own: covers, flyers, photographs out of a camera.
    // Cropping one of these into the gentler wall shape would cost too much of
    // the picture.
    print: {
        cuadrado: "1 / 1",
        alto: "2 / 3",
        ancho: "3 / 2",
    },
};

export const DEFAULT_SHAPE = "alto";

// The CSS ratio for a named shape. `set` picks how slender the three shapes
// are for this kind of picture; it is a design decision, so it lives in the
// component rather than in the JSON.
export function shapeRatio(shape, set = "wall") {
    const table = SHAPE_SETS[set] || SHAPE_SETS.wall;
    return table[String(shape || "").trim().toLowerCase()] || table[DEFAULT_SHAPE];
}

// A title turned into an address: accents dropped, everything else lowercased
// and joined with hyphens.
export function slugify(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Anything with its own page — a book, a poem — is addressed the same way:
// prefer the slug written in the JSON, and fall back to one derived from the
// title, so something added without a slug still gets a working page rather
// than a broken link.
function itemSlug(item) {
    if (!item) return "";
    if (typeof item.slug === "string" && item.slug.trim() !== "") {
        return item.slug.trim();
    }
    return slugify(item.title);
}

export const bookSlug = itemSlug;
export const poemSlug = itemSlug;

/* An encounter's address. Her evenings repeat their names year after year —
   there is an "Evento de Febrero" in 2019, 2020 and 2023 — so the title alone
   gave three encounters one address, and opening it from a shared link or a
   reload always showed the first. The year is added to the address unless the
   title already carries it ("evento-de-febrero-2023", but
   "herencia-hispana-2026" as it was), and a slug written in the JSON is used
   exactly as written.

   Two that still meet — the same title in the same year — are told apart by
   position: the later one in her list takes "-2", "-3". That needs the whole
   list, so the addresses are worked out once per list (`indexEvents`, which
   App runs whenever the content changes) and each encounter is looked up. */
function ownEventSlug(ev) {
    if (!ev) return "";
    if (typeof ev.slug === "string" && ev.slug.trim() !== "") return ev.slug.trim();
    const base = slugify(ev.title);
    const year = (String(ev.year || "").match(/\d{4}/) || [""])[0];
    if (!year || new RegExp(`(^|-)${year}(-|$)`).test(base)) return base;
    return base ? `${base}-${year}` : year;
}

/* The English copy of the events, given the Spanish addresses. The English
   file is the Spanish one with the words laid over it, item for item, so the
   item in the same place is the same encounter — and its address must not
   change with the language, or a link shared from one would be "not found"
   in the other. Only an address worked out from the title needs this; one
   written into the JSON is already the same in both. */
export function withSpanishEventAddresses(en, es) {
    const enItems = en?.past?.items;
    const esItems = es?.past?.items;
    if (!Array.isArray(enItems) || !Array.isArray(esItems)) return en;
    const items = enItems.map((ev, i) => {
        const twin = esItems[i];
        if (!ev || typeof ev !== "object" || !twin) return ev;
        if (typeof ev.slug === "string" && ev.slug.trim() !== "") return ev;
        return { ...ev, slug: ownEventSlug(twin) };
    });
    return { ...en, past: { ...en.past, items } };
}

const eventAddresses = new WeakMap();
const indexedLists = new WeakSet();

export function indexEvents(block) {
    const items = ((block || {}).past || {}).items;
    if (!Array.isArray(items) || indexedLists.has(items)) return;
    indexedLists.add(items);
    const used = new Set();
    items.forEach((ev) => {
        if (!ev || typeof ev !== "object") return;
        const own = ownEventSlug(ev);
        let slug = own;
        for (let n = 2; used.has(slug); n += 1) slug = `${own}-${n}`;
        used.add(slug);
        eventAddresses.set(ev, slug);
    });
}

export function eventSlug(ev) {
    if (!ev || typeof ev !== "object") return "";
    return eventAddresses.get(ev) || ownEventSlug(ev);
}

export function findBook(items, slug) {
    if (!Array.isArray(items)) return null;
    return items.find((b) => bookSlug(b) === slug) || null;
}

// The archive first, then the one still to come. Both can have a page, and both
// are addressed the same way. The order matters only in the moment she has filed
// an encounter into the archive without clearing it from `upcoming` yet: the
// filed copy wins, because that is the one with the photographs and the account
// on it.
export function findEvent(block, slug) {
    indexEvents(block);
    const items = ((block || {}).past || {}).items;
    const list = Array.isArray(items) ? items : [];
    const filed = list.find((e) => eventSlug(e) === slug);
    if (filed) return filed;

    const next = (block || {}).upcoming;
    if (next && eventSlug(next) === slug) return next;

    // An address from before the year was added to it — shared, bookmarked,
    // already in a search engine — still opens, on the encounter it always
    // opened: the first one with that title.
    return list.find((e) => !e.slug && slugify(e.title) === slug) || null;
}

// An encounter earns a page of its own once there is something on it to read or
// to look at. Without that a link only leads to its own title repeated, so the
// archive leaves it unlinked instead — she opens a page by writing one.
export function eventHasPage(ev) {
    return !!ev && (hasText(ev.body) || hasItems(ev.fotos));
}

// The distinct values of one field across a list, in the order they first
// appear, so a new one written into the JSON becomes a tab without any code
// change.
function distinctBy(list, key) {
    if (!Array.isArray(list)) return [];
    const seen = [];
    list.forEach((item) => {
        const name = typeof item[key] === "string" ? item[key].trim() : "";
        if (name && !seen.includes(name)) seen.push(name);
    });
    return seen;
}

/* The tabs over a list: the genres of the books, the classes of encounter.

   The words are kept in a list of their own (`libros.generos`,
   `eventos.past.categorias`), which is what lets her remove one and set their
   order. A tab appears for each listed word that at least one entry uses, in
   the list's order; an entry whose word is not in the list still shows, under
   "Todos" only. With no list — or a list none of whose words match, as a
   translation that renders them differently would give — the tabs fall back
   to the words the entries use, in the order they first appear, so a missing
   list never leaves the page without its tabs. */
function listedCategories(items, listed) {
    const used = distinctBy(items, "categoria");
    const names = (Array.isArray(listed) ? listed : [])
        .map((n) => (typeof n === "string" ? n : n?.nombre))
        .map((n) => (typeof n === "string" ? n.trim() : ""))
        .filter(Boolean);
    const shown = names.filter((n, i) => used.includes(n) && names.indexOf(n) === i);
    return shown.length ? shown : used;
}

// Tabs are a books idea and an archive idea only — the poems are a single run.
export function bookCategories(items, generos) {
    return listedCategories(items, generos);
}

export function eventCategories(items, categorias) {
    return listedCategories(items, categorias);
}

/* ---------------------------------------------------------------------------
   Switching a section off.

   A section is shown unless it has been switched off, so a block written before
   this flag existed keeps working untouched and an editor can hide a band
   without destroying what is inside it. Emptying the text used to be the only
   way, which meant hiding a section and losing it were the same gesture.
   --------------------------------------------------------------------------- */
export function sectionOn(block) {
    return !!block && block.visible !== false;
}

/* The same switch for a section whose fields sit at the top of its page's file
   rather than in a block of their own — the masthead, the shelf of books, the
   channel cards, the biography text. Each has a named flag beside its fields
   (`headVisible`, `shelfVisible`, `channelsVisible`, `bioVisible`), absent
   meaning shown. */
export function partOn(file, flag) {
    return !!file && file[flag] !== false;
}

// A book from this calendar year, going by the four-digit year written on it.
// Read from the visitor's clock when the page opens, so the tag comes off by
// itself on the first of January with nothing to edit.
export function isNewBook(book, now = new Date()) {
    const year = String(book?.year || "").match(/\d{4}/);
    return !!year && Number(year[0]) === now.getFullYear();
}

// True when a string has any content once trimmed.
export function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
}

export { site, home, libros, arte, tejidos, eventos, biografia, english };
export default site;
