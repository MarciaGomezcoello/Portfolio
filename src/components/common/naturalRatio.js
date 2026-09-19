import { useEffect, useState } from "react";
import { asset } from "../../content/site";

/* ============================================================================
   The shape a picture actually is.

   Every frame on the site reserves its space from the one word she files a
   picture under — "alto", "ancho", "cuadrado". That word has to be written
   before the photograph is uploaded, and a photograph rarely comes out of a
   camera at exactly the proportion somebody guessed for it, so the frame was
   left holding a band of empty ground above or beside the picture.

   So the word now only reserves the space. The moment the file itself is known,
   the frame takes the picture's own proportion and closes around it.

   Two things this does not do, both deliberate:

   It does not fetch anything. `Figure` is the only thing that loads a picture,
   and it hands the measurement here as it lands; everything else reads what it
   left. Measuring by loading a second copy would have defeated the laziness
   that keeps a shelf of sixteen covers cheap.

   And it does not decide how big a picture is drawn — only what shape it is.
   Size is the layout's business and stays the layout's business: a row gives
   every picture in it the same height, or the same width, and a huge file and a
   small one come out at exactly the same size on the page. That is what keeps
   this safe with pictures of wildly different dimensions; all that comes from
   the file is its proportion.
   ============================================================================ */

// One picture can be an extreme: a panorama, or a strip scanned end to end. Left
// alone it would set the height of a whole row on its own. Nothing wider or
// taller than this is allowed to shape a frame — such a picture is fitted inside
// the widest frame we allow instead, which is the one case where a little ground
// still shows.
const LIMIT = 3;

const known = new Map();
const waiting = new Map();

function subscribe(src, fn) {
    if (!waiting.has(src)) waiting.set(src, new Set());
    waiting.get(src).add(fn);
    return () => {
        const set = waiting.get(src);
        if (!set) return;
        set.delete(fn);
        if (!set.size) waiting.delete(src);
    };
}

/* What `Figure` reports once the browser has the file. Callers pass the name as
   it is written in the JSON, here and in the hook alike, and the resolving is
   done in one place so the two can never disagree about the key. */
export function remember(name, width, height) {
    const src = asset(name);
    if (!src || !width || !height) return;
    if (known.has(src)) return;

    const raw = width / height;
    const held = Math.min(Math.max(raw, 1 / LIMIT), LIMIT);
    // Written as a plain number over one rather than as the pixel dimensions:
    // the clamp means the two are not always the same thing.
    const ratio = `${held.toFixed(4)} / 1`;

    known.set(src, ratio);
    const set = waiting.get(src);
    if (set) set.forEach((fn) => fn(ratio));
}

/* The shape to give a frame: the picture's own once it is known, and until then
   the one reserved by the word she filed it under. A picture that never arrives
   keeps the reserved shape for good, which is what a waiting frame should be. */
/* The style for a wrapper that is given a height and must take its width from
   the picture's shape. `aspect-ratio` alone says that, and Chrome honours it —
   but Safari, on the Mac and on every iPhone, does not work a width out of a
   height for a flex item, and the wrapper collapsed to nothing: covers vanished
   and their titles ran down the page a letter at a time. So the proportion is
   also handed over as a number, `--ratio`, and the stylesheet writes the width
   out as height × ratio. `aspect-ratio` stays for everything else it does. */
export function ratioStyle(ratio) {
    const [w, h] = String(ratio).split("/").map((n) => parseFloat(n));
    const value = w > 0 && h > 0 ? w / h : 1;
    return { aspectRatio: ratio, "--ratio": value.toFixed(4) };
}

export function useNaturalRatio(name, reserved) {
    const src = asset(name);
    const [ratio, setRatio] = useState(() => (src && known.get(src)) || reserved);

    useEffect(() => {
        if (!src) {
            setRatio(reserved);
            return undefined;
        }
        const already = known.get(src);
        setRatio(already || reserved);
        return already ? undefined : subscribe(src, setRatio);
    }, [src, reserved]);

    return ratio;
}
