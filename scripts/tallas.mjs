/* ============================================================================
   Tallas — smaller copies of every photograph, made before each build.

   Her photographs arrive straight from a phone, 3000–4000px across and up to
   several megabytes each, and the site used to send that whole file even to a
   card 175px wide. This makes WebP copies of each one at a few widths into
   `public/content/_tallas/`, and writes `src/tallas.json` saying which copies
   exist, so a picture can offer the browser the size it actually needs.

   - Her originals are never touched. The copies are made from them, and both
     the copies and the list are left out of git (see .gitignore): they can
     always be made again.
   - Only what is new or changed is made, so after the first run this takes a
     second or two. A copy whose original is gone is removed.
   - A photograph narrower than the smallest width gets no copies and is sent
     as it is — it is small already.
   - Runs on its own before `npm start`, `npm run build` (and so before
     `npm run deploy`) and `npm run build:preview`.

   The folder is `_tallas`, not `.tallas`: GitHub Pages publishing and the
   editor's own server both skip files whose names start with a dot.
   ============================================================================ */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "public", "content");
const OUT = path.join(CONTENT, "_tallas");
const LIST = path.join(ROOT, "src", "tallas.json");

export const WIDTHS = [480, 960, 1600];
const PICTURE = /\.(jpe?g|png|webp)$/i;
const QUALITY = 80;

const copyName = (name, w) => `${name.replace(/\.[^.]+$/, "")}-${w}.webp`;

async function mtime(file) {
    try {
        return (await fs.stat(file)).mtimeMs;
    } catch {
        return 0;
    }
}

// Width and height as the picture is shown — a phone photo stored sideways
// with an orientation flag is shown upright, so its sides are swapped.
function shownSize(meta) {
    const turned = meta.orientation >= 5;
    return turned ? [meta.height, meta.width] : [meta.width, meta.height];
}

async function makeOne(name, previous) {
    const file = path.join(CONTENT, name);
    const changed = await mtime(file);

    // Already done, and the original has not changed since.
    const before = previous[name];
    if (before && before.t === Math.round(changed)) {
        const ok = await Promise.all(
            before.w.map(async (w) => (await mtime(path.join(OUT, copyName(name, w)))) > 0)
        );
        if (ok.every(Boolean)) return { entry: before, made: 0 };
    }

    const meta = await sharp(file).metadata();
    const [width, height] = shownSize(meta);
    const widths = WIDTHS.filter((w) => w < width);

    for (const w of widths) {
        await sharp(file)
            .rotate() // upright, from the orientation flag
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toFile(path.join(OUT, copyName(name, w)));
    }

    return { entry: { w: widths, s: [width, height], t: Math.round(changed) }, made: widths.length };
}

async function main() {
    const started = Date.now();
    await fs.mkdir(OUT, { recursive: true });

    let previous = {};
    try {
        previous = JSON.parse(await fs.readFile(LIST, "utf8"));
    } catch {
        previous = {};
    }

    const names = (await fs.readdir(CONTENT))
        .filter((n) => !n.startsWith(".") && PICTURE.test(n))
        .sort();

    const list = {};
    let made = 0;
    let failed = 0;
    let next = 0;

    // A few at a time; sharp already spreads each one over the cores.
    const workers = Array.from({ length: Math.max(2, Math.min(6, os.cpus().length)) }, async () => {
        while (next < names.length) {
            const name = names[next++];
            try {
                const done = await makeOne(name, previous);
                if (done.entry.w.length > 0) list[name] = done.entry;
                made += done.made;
            } catch (err) {
                // A file sharp cannot read is sent as it is, as before.
                failed += 1;
                console.warn(`tallas: se deja como está ${name} (${err.message})`);
            }
        }
    });
    await Promise.all(workers);

    // Copies whose original is gone, or a width no longer made.
    const keep = new Set(
        Object.entries(list).flatMap(([name, e]) => e.w.map((w) => copyName(name, w)))
    );
    let removed = 0;
    for (const n of await fs.readdir(OUT)) {
        if (!keep.has(n)) {
            await fs.rm(path.join(OUT, n), { force: true });
            removed += 1;
        }
    }

    const sorted = Object.fromEntries(Object.keys(list).sort().map((k) => [k, list[k]]));
    await fs.writeFile(LIST, JSON.stringify(sorted) + "\n", "utf8");

    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
        `tallas: ${names.length} fotos, ${Object.keys(sorted).length} con copias` +
        `, ${made} copias nuevas, ${removed} quitadas` +
        (failed ? `, ${failed} sin leer` : "") +
        ` (${secs}s)`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
