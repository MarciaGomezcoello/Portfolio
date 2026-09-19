/* Small shapes shared by the holiday drawings (Fiesta.js) and the everyday
   themes' drawings (Temas.js). */

export const HEART = "M50 86C20 64 2 46 2 26 2 12 14 2 28 2c10 0 18 6 22 14C54 8 62 2 72 2c14 0 26 10 26 24 0 20-18 38-48 60z";
export const LEAF = "M0-40C18-30 26-8 0 30-26-8-18-30 0-40z";
export const SPARKLE = "M0-11 3-3 11 0 3 3 0 11-3 3-11 0-3-3z";

// A star of `points` points centred on (cx, cy), as a path.
export function starPath(cx, cy, r, points = 5, inner = 0.45) {
    const out = [];
    for (let i = 0; i < points * 2; i++) {
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? r * inner : r;
        out.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
    }
    return `M${out.join("L")}z`;
}
