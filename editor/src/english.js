/* ============================================================================
   The English copy of the site, made by any translator — usually an AI chat.

   The Spanish files are the site. English is a translation of them, never a
   second thing to keep in step by hand, so the round trip is:

     1. `spanishForTranslation` gathers every translatable word of every page
        into one JSON text, with instructions at the top, for her to copy.
     2. She pastes it into a translator and copies back what it returns.
     3. `englishFromTranslation` lays the returned words over a copy of the
        Spanish files. Everything that is not a word — photos, links, shapes,
        switches, slugs — is always taken from the Spanish, so a translator
        that "helpfully" edits a link or drops a photo cannot break anything.

   Arrays are matched by position, which is why the English is rebuilt from
   the Spanish every time rather than patched: after the Spanish changes, the
   next paste produces a fresh English file that lines up again.
   ============================================================================ */

export const FILES = ["site", "home", "libros", "arte", "tejidos", "eventos", "biografia"];

/* Keys whose values are not words. They are left out of what is sent, and
   always copied from the Spanish. */
const NOT_WORDS = new Set([
    "slug", "cover", "photo", "poster", "portrait", "logo", "src", "video",
    "shape", "photoShape", "posterShape", "portraitShape",
    "url", "buyUrl", "linkUrl", "icon", "page", "theme", "visible", "headVisible", "shelfVisible", "channelsVisible", "bioVisible",
    "fontTitles", "fontText", "holidayExtras",
]);

const isNote = (key) => key.startsWith("_");
const wanted = (key) => !isNote(key) && !NOT_WORDS.has(key);

/* Just the words of a value, in the same shape. Empty strings are dropped: a
   translator has nothing to do with them and they only make the text longer. */
function wordsOf(node) {
    if (typeof node === "string") return node.trim() ? node : undefined;
    if (Array.isArray(node)) return node.map((v) => wordsOf(v) ?? null);
    if (node && typeof node === "object") {
        const out = {};
        for (const [k, v] of Object.entries(node)) {
            if (!wanted(k)) continue;
            const w = wordsOf(v);
            if (w !== undefined && !(w && typeof w === "object" && !Array.isArray(w) && !Object.keys(w).length)) {
                out[k] = w;
            }
        }
        return out;
    }
    return undefined;
}

const INSTRUCTIONS = [
    "Translate the Spanish text in the JSON below into natural, warm English for a personal author website.",
    "Rules:",
    "- Reply with ONLY the JSON, nothing before or after it.",
    "- Keep every key, every bracket and the order exactly as they are. Translate only the text values.",
    "- Keep line breaks (\\n) where they are: a blank line separates paragraphs, and in poems each line is a verse.",
    "- Do not translate people's names, place names, YouTube channel names, or the titles of published books.",
    "- Keep «» quotation marks around titles.",
    "- Words used as labels — \"categoria\", \"channel\", \"short\", \"nombre\" — must be translated the same way every time they appear, because the site matches them to each other.",
    "- null stays null.",
].join("\n");

export function spanishForTranslation(content) {
    const files = {};
    for (const name of FILES) {
        if (content?.[name]) files[name] = wordsOf(content[name]);
    }
    return `${INSTRUCTIONS}\n\n${JSON.stringify(files, null, 2)}\n`;
}

/* The JSON inside whatever came back — with or without a ``` fence, or a
   sentence of chat before it. */
function parsePasted(text) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("No encuentro el texto traducido. Copie la respuesta completa.");
    try {
        return JSON.parse(text.slice(start, end + 1));
    } catch {
        throw new Error("La traducción llegó incompleta o con algún error. Pídale que la repita.");
    }
}

/* Spanish structure, English words wherever the translation has a word for
   the same place. Counts what was and was not found. */
function overlay(es, tr, tally) {
    if (typeof es === "string") {
        if (!es.trim()) return es;
        tally.total += 1;
        if (typeof tr === "string" && tr.trim()) {
            tally.done += 1;
            return tr;
        }
        return es;
    }
    if (Array.isArray(es)) {
        return es.map((v, i) => overlay(v, Array.isArray(tr) ? tr[i] : undefined, tally));
    }
    if (es && typeof es === "object") {
        const out = {};
        for (const [k, v] of Object.entries(es)) {
            out[k] = wanted(k) ? overlay(v, tr && typeof tr === "object" ? tr[k] : undefined, tally) : v;
        }
        return out;
    }
    return es;
}

export function englishFromTranslation(content, pasted) {
    const translated = parsePasted(pasted);
    const en = {};
    const tally = { total: 0, done: 0 };
    for (const name of FILES) {
        if (content?.[name]) en[name] = overlay(content[name], translated[name], tally);
    }
    return { en, ...tally };
}

/* True when the English was built from different Spanish than there is now —
   a book added, a photo changed, a section switched off. Words are ignored;
   everything else must match. */
export function englishIsBehind(content, en) {
    if (!en) return false;
    const frame = (node) => {
        if (typeof node === "string") return "";
        if (Array.isArray(node)) return node.map(frame);
        if (node && typeof node === "object") {
            const out = {};
            for (const [k, v] of Object.entries(node)) {
                if (isNote(k)) continue;
                out[k] = wanted(k) ? frame(v) : v;
            }
            return out;
        }
        return node;
    };
    return FILES.some((name) => en[name] && JSON.stringify(frame(content[name])) !== JSON.stringify(frame(en[name])));
}
