import list from "../../tallas.json";
import { asset } from "../../content/site";
import { remember } from "./naturalRatio";

/* ============================================================================
   The smaller copies of a photograph, for the browser to choose from.

   `scripts/tallas.mjs` makes WebP copies of every photograph at a few widths
   before each build and lists them in `src/tallas.json`. A picture offers the
   browser all of them plus the original (`srcSet`), says how wide it is drawn
   (`sizes`), and the browser fetches the smallest one that is still sharp on
   that screen — a card on a phone takes a 30 KB copy rather than a 4 MB file.

   Anything not in the list is left exactly as before: a photograph added
   since the last build, one sent as a full https:// address, or one already
   smaller than the smallest copy.
   ============================================================================ */

const BASE = process.env.PUBLIC_URL || "";

// The list also knows each photograph's shape, so its frame can close around
// it straight away instead of after the file has arrived — nothing on the page
// shifts when a picture lands.
Object.entries(list).forEach(([name, e]) => {
    if (e.s) remember(name, e.s[0], e.s[1]);
});

function entryFor(name) {
    if (!name || typeof name !== "string") return null;
    const key = name.trim().replace(/^\/+/, "");
    if (key === "" || /^(https?:|data:)/i.test(key)) return null;
    return Object.prototype.hasOwnProperty.call(list, key) ? [key, list[key]] : null;
}

/* The `srcSet` for one photograph as written in the JSON, or undefined. */
export function srcSetFor(name) {
    const found = entryFor(name);
    if (!found) return undefined;
    const [key, e] = found;
    // Named after the whole original name, extension included (see the script).
    const copies = e.w.map((w) => `${BASE}/content/tallas/${encodeURIComponent(`${key}-${w}.webp`)} ${w}w`);
    // The original as the largest choice, for a big screen that needs it.
    copies.push(`${encodeURI(asset(key))} ${e.s[0]}w`);
    return copies.join(", ");
}

/* Fetches a photograph ahead of time at the size it will be drawn, so it is
   already in the browser when it is asked for — the next print in a carousel.
   `box` is the space it will be drawn in: its width, and its height when the
   height is what is fixed and the width follows the photograph's shape. The
   size must come out as Figure will measure it, or the browser would fetch one
   copy now and a different one when the print is shown. */
export function preload(name, box = {}) {
    const src = asset(name);
    if (!src) return;
    const img = new Image();
    const found = entryFor(name);
    if (found) {
        const [w, h] = found[1].s;
        let width = box.width || 0;
        if (box.height > 0) width = Math.min(width || Infinity, (box.height * w) / h);
        img.sizes = width > 0 && Number.isFinite(width) ? `${Math.ceil(width)}px` : "100vw";
        img.srcset = srcSetFor(name);
    }
    img.src = src;
}
