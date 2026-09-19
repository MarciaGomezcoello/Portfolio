import { createContext, useContext } from "react";
import { HEART, LEAF } from "./fiestaShapes";
import * as Temas from "./Temas";
import "./Fiesta.css";

/* ============================================================================
   Fiesta — the extras a holiday theme brings with it.

   When site.json names a holiday theme (and "holidayExtras" is not switched
   off), a few small drawings join the page: something worn on her portrait
   and a companion at its foot (presents, a jack-o'-lantern, a turkey, a sugar
   skull…), the same companion on every page masthead, a little hat on her
   name in the bar, a garland hung along the top of the footer, and a few
   things falling gently through the hero and the mastheads — snow at
   Christmas, bats at Halloween, leaves at Thanksgiving, petals and skulls on
   the Day of the Dead.

   They are drawn here as inline SVG so they need no files, and every colour
   they use is a token (--fiesta-a … --fiesta-e, --fiesta-sky) set by each
   holiday theme in styles/themes-fiestas.css. Nothing here is content, and
   nothing appears in the everyday themes: <Adorno> renders nothing at all
   unless a holiday is on.

   The everyday themes have drawings of their own in the same places, drawn in
   Temas.js; this file picks whichever set the theme has.

   All of it is decoration: hidden from screen readers, never in the way of a
   click, and still for anyone who has asked for less motion.
   ============================================================================ */

export const FIESTAS = ["navidad", "halloween", "sanvalentin", "pascua", "gracias", "anonuevo", "muertos", "madre"];

const FiestaContext = createContext(null);

/* The theme whose drawings are on the page, or null when they are switched off.
   A word that is no theme at all is the everyday paper, as it is for colours. */
export function FiestaProvider({ theme, extras, children }) {
    const known = FIESTAS.includes(theme) || Temas.TEMAS.includes(theme) ? theme : "papel";
    const fiesta = extras !== false ? known : null;
    return <FiestaContext.Provider value={fiesta}>{children}</FiestaContext.Provider>;
}

export function useFiesta() {
    return useContext(FiestaContext);
}

/* --- Small shapes shared between the drawings ------------------------------ */


function Marigold({ x, y, r = 1, petal = "fa", heart = "fb" }) {
    const petals = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <circle key={i} className={petal} cx={x + Math.cos(a) * 9 * r} cy={y + Math.sin(a) * 9 * r} r={6.5 * r} />;
    });
    return (
        <g>
            {petals}
            <circle className={heart} cx={x} cy={y} r={6.5 * r} />
        </g>
    );
}

function Rose({ x, y, r = 1, fill = "fa" }) {
    return (
        <g>
            <circle className={fill} cx={x} cy={y} r={13 * r} />
            <path className="fline" d={`M${x - 6 * r} ${y}a${6 * r} ${6 * r} 0 1 1 ${6 * r} ${6 * r}a${3 * r} ${3 * r} 0 1 1 ${-3 * r} ${-3 * r}`} />
        </g>
    );
}

function WitchHat() {
    return (
        <svg viewBox="0 0 120 110">
            <ellipse className="fe" cx="60" cy="94" rx="58" ry="12" />
            <path className="fe" d="M28 92 64 8c4-8 10-8 13 2l17 82z" />
            <path className="fb" d="M33 80h60l3 12H29z" />
            <rect className="fc" x="54" y="79" width="14" height="14" rx="2" />
        </svg>
    );
}

function PartyHat() {
    return (
        <svg viewBox="0 0 80 112">
            <path className="fa" d="M8 102 40 14l32 88z" />
            <path className="fb" d="M20 70h40l-4 11H24zM30 42h20l-3 9H33z" />
            <circle className="fc" cx="40" cy="12" r="10" />
            <ellipse className="fb" cx="40" cy="102" rx="34" ry="7" />
        </svg>
    );
}

/* A sugar skull: bone, marigold eyes, a heart for a nose, stitched teeth. */
function Calavera({ detail = true }) {
    return (
        <svg viewBox="0 0 100 108">
            <path className="fbone" d="M50 4C24 4 8 22 8 46c0 14 6 24 16 30v14c0 6 4 10 10 10h32c6 0 10-4 10-10V76c10-6 16-16 16-30C92 22 76 4 50 4z" />
            <circle className="fa" cx="32" cy="48" r="13" />
            <circle className="fa" cx="68" cy="48" r="13" />
            <circle className="fhollow" cx="32" cy="48" r="6.5" />
            <circle className="fhollow" cx="68" cy="48" r="6.5" />
            <path className="fb" transform="translate(43 60) scale(0.14)" d={HEART} />
            <path className="fteeth" d="M30 84h40M36 78v12M43 78v12M50 78v12M57 78v12M64 78v12" />
            {detail && (
                <>
                    <Marigold x={50} y={22} r={0.5} petal="fb" heart="fc" />
                    <circle className="fe" cx="18" cy="60" r="4" />
                    <circle className="fe" cx="82" cy="60" r="4" />
                    <path className="fdots" d="M20 34q6-10 16-12M80 34q-6-10-16-12" />
                </>
            )}
        </svg>
    );
}

function PilgrimHat() {
    return (
        <svg viewBox="0 0 80 64">
            <path className="fe" d="M20 50 25 8h30l5 42z" />
            <ellipse className="fe" cx="40" cy="52" rx="38" ry="9" />
            <path className="fb" d="M22 34h36l1.5 11h-39z" />
            <rect className="fc" x="32" y="33" width="16" height="13" rx="1.5" />
            <rect className="fe" x="36.5" y="37" width="7" height="5" />
        </svg>
    );
}

/* --- On the portrait ------------------------------------------------------- */

const PORTRAIT = {
    navidad: (
        <svg viewBox="0 0 200 92" className="adornoAntlers">
            <g className="fstroke">
                <path d="M80 90C72 62 54 40 38 12M62 52C50 48 38 52 24 44M50 32c8-8 10-16 8-26M42 22C30 20 22 13 17 2" />
                <path d="M120 90c8-28 26-50 42-78M138 52c12-4 24 0 38-8M150 32c-8-8-10-16-8-26M158 22c12-2 20-9 25-20" />
            </g>
            <path className="fb" d="M60 74q10-10 20 0-10 10-20 0zM120 74q10-10 20 0-10 10-20 0z" />
        </svg>
    ),
    halloween: <WitchHat />,
    sanvalentin: (
        <svg viewBox="0 0 120 110">
            <path className="fb" transform="translate(52 34) scale(0.6)" d={HEART} />
            <path className="fa" transform="translate(4 10)" d={HEART} />
            <ellipse className="fshine" cx="30" cy="30" rx="9" ry="6" transform="rotate(-30 30 30)" />
        </svg>
    ),
    pascua: (
        <svg viewBox="0 0 140 112">
            <g transform="rotate(-12 46 60)">
                <ellipse className="fd" cx="46" cy="58" rx="19" ry="54" />
                <ellipse className="fa" cx="46" cy="62" rx="9" ry="40" />
            </g>
            <g transform="rotate(12 94 60)">
                <ellipse className="fd" cx="94" cy="58" rx="19" ry="54" />
                <ellipse className="fa" cx="94" cy="62" rx="9" ry="40" />
            </g>
            <path className="fstrokeB" d="M14 108q56-26 112 0" />
        </svg>
    ),
    gracias: (
        <svg viewBox="0 0 130 130">
            <g transform="translate(46 56) rotate(-30)"><path className="fb" d={LEAF} /><path className="fline" d="M0-34V26" /></g>
            <g transform="translate(84 44) rotate(24)"><path className="fa" d={LEAF} /><path className="fline" d="M0-34V26" /></g>
            <g transform="translate(62 88) rotate(-80) scale(0.8)"><path className="fc" d={LEAF} /><path className="fline" d="M0-34V26" /></g>
        </svg>
    ),
    anonuevo: <PartyHat />,
    muertos: (
        <svg viewBox="0 0 170 84">
            <path className="fc" d="M22 64c20-8 40-4 58-12M92 40c22 2 44-8 64-2" />
            <Marigold x={24} y={56} r={1.05} />
            <Marigold x={62} y={34} r={1.25} />
            <Marigold x={104} y={26} r={1.1} petal="fb" heart="fa" />
            <Marigold x={144} y={38} r={0.95} />
        </svg>
    ),
    madre: (
        <svg viewBox="0 0 140 120">
            <path className="fc" d="M30 96c10-26 30-40 56-44M52 108c4-28 20-50 50-62" />
            <g transform="translate(18 34) rotate(-20)"><path className="fc" d={LEAF} transform="scale(0.45)" /></g>
            <Rose x={48} y={56} r={1.3} />
            <Rose x={92} y={40} r={1.1} fill="fb" />
            <Rose x={104} y={78} r={0.9} />
            <circle className="fd" cx="72" cy="86" r="7" />
            <circle className="fd" cx="126" cy="54" r="6" />
        </svg>
    ),
};

/* --- At the foot of the portrait, and on every masthead --------------------
   A second drawing for each holiday, standing rather than worn: it sits at the
   lower corner of her portrait on the cover, and at the right of each inner
   page's masthead, so the holiday reaches past the cover page. */

const TURKEY_FEATHERS = [-72, -48, -24, 0, 24, 48, 72];

const COMPANION = {
    navidad: (
        <svg viewBox="0 0 124 110">
            <rect className="fa" x="8" y="50" width="64" height="56" rx="3" />
            <rect className="fa" x="4" y="40" width="72" height="14" rx="3" />
            <rect className="fc" x="34" y="40" width="12" height="66" />
            <path className="fc" d="M40 41C28 20 8 26 20 41zM40 41C52 20 72 26 60 41z" />
            <rect className="fb" x="74" y="68" width="46" height="38" rx="3" />
            <rect className="fd" x="74" y="82" width="46" height="8" />
            <rect className="fd" x="93" y="68" width="8" height="38" />
            <path className="fd" d="M97 69c-6-12-18-8-11 0zM97 69c6-12 18-8 11 0z" />
        </svg>
    ),
    halloween: (
        <svg viewBox="0 0 110 104">
            <path className="fstem" d="M55 24c0-10 3-16 10-20" />
            <ellipse className="fb foutline" cx="34" cy="62" rx="28" ry="38" />
            <ellipse className="fb foutline" cx="76" cy="62" rx="28" ry="38" />
            <ellipse className="fb foutline" cx="55" cy="62" rx="30" ry="40" />
            <path className="fline" d="M40 30q-8 32 0 64M70 30q8 32 0 64" />
            <path className="fc" d="M32 54l10-14 10 14zM58 54l10-14 10 14zM50 68l5-7 5 7z" />
            <path className="fc" d="M28 74q27 22 54 0l-7 3-5 6-6-5-6 6-6-6-6 5-5-6z" />
        </svg>
    ),
    sanvalentin: (
        <svg viewBox="0 0 124 100">
            <rect className="fd" x="6" y="26" width="108" height="70" rx="6" />
            <path className="fedge" d="M8 30l52 38 52-38" />
            <path className="fa" transform="translate(47 52) scale(0.26)" d={HEART} />
            <path className="fb" transform="translate(88 2) scale(0.22) rotate(14 50 50)" d={HEART} />
            <path className="fa" transform="translate(100 14) scale(0.13)" d={HEART} />
        </svg>
    ),
    pascua: (
        <svg viewBox="0 0 100 112">
            <circle className="fc" cx="50" cy="44" r="26" />
            <path className="fstrokeC" d="M48 19q0-9 7-12M52 19q4-7 10-7" />
            <circle className="fhollow" cx="41" cy="40" r="3.2" />
            <circle className="fhollow" cx="59" cy="40" r="3.2" />
            <path className="fa" d="M44 49h12l-6 8z" />
            <path className="fd" d="M12 60l9 9 9-9 9 9 11-9 9 9 9-9 9 9 11-9c3 30-13 48-38 48S9 90 12 60z" />
            <circle className="fb" cx="34" cy="90" r="4" />
            <circle className="fa" cx="62" cy="96" r="3.5" />
            <circle className="fb" cx="72" cy="80" r="3" />
        </svg>
    ),
    gracias: (
        <svg viewBox="0 0 140 132">
            {TURKEY_FEATHERS.map((a, i) => (
                <ellipse
                    key={a}
                    className={["fa", "fb", "fc"][i % 3]}
                    cx="70" cy="42" rx="13" ry="40"
                    transform={`rotate(${a} 70 84)`}
                />
            ))}
            <ellipse className="fe" cx="70" cy="90" rx="30" ry="32" />
            <path className="fline" d="M52 88q10 12 2 24M88 88q-10 12-2 24" />
            <circle className="fe" cx="70" cy="56" r="16" />
            <circle className="fcut" cx="63" cy="52" r="4.5" />
            <circle className="fcut" cx="77" cy="52" r="4.5" />
            <circle className="fhollow" cx="64" cy="53" r="2" />
            <circle className="fhollow" cx="76" cy="53" r="2" />
            <path className="fc" d="M65 59h10l-5 8z" />
            <path className="fb" d="M73 63c5 2 6 9 1 13-4-3-4-8-1-13z" />
            <path className="fstrokeC" d="M60 120v8m0 0-5 3m5-3 5 3M80 120v8m0 0-5 3m5-3 5 3" />
        </svg>
    ),
    anonuevo: (
        <svg viewBox="0 0 124 124">
            <g transform="rotate(-14 44 110)">
                <path className="fc foutline" d="M28 22h32l-3 34c-1 10-6 15-13 15s-12-5-13-15z" />
                <path className="fstem" d="M44 71v36M32 108h24" />
                <circle className="fd" cx="40" cy="42" r="2.5" />
                <circle className="fd" cx="48" cy="34" r="2" />
            </g>
            <g transform="rotate(14 80 110)">
                <path className="fc foutline" d="M64 22h32l-3 34c-1 10-6 15-13 15s-12-5-13-15z" />
                <path className="fstem" d="M80 71v36M68 108h24" />
                <circle className="fd" cx="76" cy="44" r="2.5" />
                <circle className="fd" cx="84" cy="36" r="2" />
            </g>
            <path className="fd" d="M62 0l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
            <path className="fd" d="M26 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM100 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        </svg>
    ),
    muertos: (
        <svg viewBox="0 0 150 120">
            <g transform="translate(22 8)"><Calavera /></g>
            <Marigold x={20} y={104} r={1.05} />
            <Marigold x={128} y={100} r={1.2} petal="fb" heart="fa" />
            <Marigold x={74} y={112} r={0.8} petal="fc" heart="fa" />
        </svg>
    ),
    madre: (
        <svg viewBox="0 0 110 122">
            <path className="fstrokeC" d="M55 76V36M40 76c0-14-6-22-13-30M70 76c0-14 6-22 13-30" />
            <path className="fa" d="M43 34c0-14 4-20 12-26 8 6 12 12 12 26 0 8-5 12-12 12s-12-4-12-12z" />
            <path className="fb" transform="translate(-28 12)" d="M43 34c0-14 4-20 12-26 8 6 12 12 12 26 0 8-5 12-12 12s-12-4-12-12z" />
            <path className="fd" transform="translate(28 12)" d="M43 34c0-14 4-20 12-26 8 6 12 12 12 26 0 8-5 12-12 12s-12-4-12-12z" />
            <rect className="fd" x="22" y="74" width="66" height="11" rx="3" />
            <path className="fb foutline" d="M27 85h56l-6 35H33z" />
            <path className="fa" transform="translate(47 94) scale(0.16)" d={HEART} />
        </svg>
    ),
};

/* --- On her name in the bar ------------------------------------------------ */

const BRAND = {
    navidad: (
        <svg viewBox="0 0 64 52">
            <path className="fa" d="M8 40C10 20 26 6 46 8c9 1 12 10 8 24l-2 8z" />
            <rect className="fd" x="3" y="36" width="52" height="13" rx="6.5" />
            <circle className="fd" cx="56" cy="30" r="7.5" />
        </svg>
    ),
    halloween: <WitchHat />,
    anonuevo: <PartyHat />,
    sanvalentin: <svg viewBox="0 0 100 90"><path className="fa" d={HEART} /></svg>,
    pascua: (
        <svg viewBox="0 0 60 76">
            <ellipse className="fa" cx="30" cy="42" rx="26" ry="32" />
            <path className="fstrokeD" d="M6 40l8-6 8 6 8-6 8 6 8-6 8 6" />
        </svg>
    ),
    gracias: <PilgrimHat />,
    muertos: <Calavera detail={false} />,
    madre: <svg viewBox="0 0 40 40"><Rose x={20} y={20} r={1.3} /></svg>,
};

/* --- One link of the garland along the footer ------------------------------ */

function GarlandItem({ fiesta, i }) {
    if (!FIESTAS.includes(fiesta)) return <Temas.GarlandItem tema={fiesta} i={i} />;
    const fill = ["fa", "fb", "fc", "fd"][i % 4];
    const wire = <path className="fwire" d="M0 3q20 10 40 0" />;
    switch (fiesta) {
        case "navidad":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <rect className="fe" x="16" y="7" width="8" height="7" rx="1.5" />
                    <ellipse className={fill} cx="20" cy="25" rx="7.5" ry="11" />
                </svg>
            );
        case "halloween":
            if (i % 3 === 2) {
                return (
                    <svg viewBox="0 0 40 44">
                        {wire}
                        <path className="fwire" d="M20 7v6" />
                        <ellipse className="fb" cx="20" cy="24" rx="12" ry="10" />
                        <path className="fc" d="M13 22l3-4 3 4zM21 22l3-4 3 4zM13 27q7 5 14 0z" />
                    </svg>
                );
            }
        // falls through: the other links are pennants, as at New Year.
        case "anonuevo":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <path className={fiesta === "halloween" ? ["fb", "fa"][i % 2] : ["fa", "fd"][i % 2]} d="M6 6h28L20 36z" />
                </svg>
            );
        case "sanvalentin":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <path className={["fa", "fb"][i % 2]} transform="translate(9 9) scale(0.22)" d={HEART} />
                </svg>
            );
        case "pascua":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <ellipse className={fill} cx="20" cy="26" rx="10" ry="13" />
                    <path className="fstrokeD" d="M10 24l5-3 5 3 5-3 5 3" />
                </svg>
            );
        case "gracias":
            if (i % 3 === 1) {
                return (
                    <svg viewBox="0 0 40 44">
                        {wire}
                        <path className="fstem" d="M20 8v8" />
                        <ellipse className="fa" cx="13" cy="26" rx="8" ry="9" />
                        <ellipse className="fa" cx="27" cy="26" rx="8" ry="9" />
                        <ellipse className="fb" cx="20" cy="26" rx="8" ry="10" />
                    </svg>
                );
            }
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <g transform={`translate(20 24) rotate(${i % 2 ? 20 : -20}) scale(0.42)`}>
                        <path className={["fa", "fb", "fc"][i % 3]} d={LEAF} />
                    </g>
                </svg>
            );
        case "muertos":
            return (
                <svg viewBox="0 0 40 44">
                    <path className="fwire" d="M0 3h40" />
                    <path className={["fa", "fb", "fc", "fd", "fe"][i % 5]} d="M4 3h32v30l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4z" />
                    {i % 2 ? (
                        <>
                            <path className="fcut" d="M20 9c-6 0-9 4-9 8 0 3 1 5 3 6v4h12v-4c2-1 3-3 3-6 0-4-3-8-9-8z" />
                            <circle className={["fa", "fb", "fc", "fd", "fe"][i % 5]} cx="16.5" cy="17" r="2.2" />
                            <circle className={["fa", "fb", "fc", "fd", "fe"][i % 5]} cx="23.5" cy="17" r="2.2" />
                        </>
                    ) : (
                        <path className="fcut" d="M20 11l4 5-4 5-4-5zM11 24h4v4h-4zM25 24h4v4h-4z" />
                    )}
                </svg>
            );
        case "madre":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <Rose x={20} y={22} r={0.7} fill={["fa", "fb"][i % 2]} />
                </svg>
            );
        default:
            return null;
    }
}

/* --- Things that fall ------------------------------------------------------ */

function Flake({ fiesta, i }) {
    if (!FIESTAS.includes(fiesta)) return <Temas.Flake tema={fiesta} i={i} />;
    const fill = ["fa", "fb", "fc", "fd"][i % 4];
    switch (fiesta) {
        case "navidad":
            return (
                <svg viewBox="-12 -12 24 24">
                    <path className="fsnow" d="M0-10V10M-8.7-5 8.7 5M-8.7 5 8.7-5" />
                </svg>
            );
        case "halloween":
            return (
                <svg viewBox="0 0 60 30">
                    <path className="fbat" d="M30 12c-3-6-8-8-12-6 2 2 2 5 0 7-4-3-10-2-14 2 5 0 8 3 9 8 3-3 7-4 11-2 2 3 4 5 6 7 2-2 4-4 6-7 4-2 8-1 11 2 1-5 4-8 9-8-4-4-10-5-14-2-2-2-2-5 0-7-4-2-9 0-12 6z" />
                </svg>
            );
        case "sanvalentin":
        case "madre":
            return <svg viewBox="0 0 100 90"><path className={fiesta === "madre" && i % 2 ? "fd" : ["fa", "fb"][i % 2]} d={HEART} /></svg>;
        case "pascua":
            return <svg viewBox="-12 -12 24 24"><ellipse className={fill} rx="7" ry="11" /></svg>;
        case "gracias":
            return <svg viewBox="-42 -42 84 84"><path className={["fa", "fb", "fc"][i % 3]} d={LEAF} /></svg>;
        case "anonuevo":
            return i % 3 === 0
                ? <svg viewBox="-12 -12 24 24"><path className="fc" d="M0-11 3-3 11 0 3 3 0 11-3 3-11 0-3-3z" /></svg>
                : <svg viewBox="0 0 10 16"><rect className={fill} width="10" height="16" rx="2" /></svg>;
        case "muertos":
            return i % 4 === 0
                ? <Calavera detail={false} />
                : <svg viewBox="-12 -12 24 24"><ellipse className={["fa", "fb"][i % 2]} rx="6" ry="10" /></svg>;
        default:
            return null;
    }
}

// A repeatable scatter: the same page draws the same sky every time.
function rand(i, k) {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

// `where` is "hero" or "masthead". Only a holiday reaches the mastheads.
export function FiestaSky({ count = 16, where = "hero" }) {
    const fiesta = useFiesta();
    if (!fiesta) return null;
    const holiday = FIESTAS.includes(fiesta);
    if (!holiday && where === "masthead") return null;
    // The everyday themes keep a quieter sky, or none at all.
    const mode = holiday ? (fiesta === "halloween" ? "fly" : "fall") : Temas.SKY_MODE[fiesta];
    if (!mode) return null;
    const shown = holiday ? count : Math.ceil(count / 2);
    const flies = mode === "fly" || mode === "drift";
    const big = mode === "drift" ? 3 : flies ? 1 : 0;
    return (
        <span className={`fiestaSky is-${mode}`} aria-hidden="true">
            {Array.from({ length: shown }, (_, i) => (
                <span
                    key={i}
                    className="fiestaFlake"
                    style={{
                        "--x": `${Math.round(rand(i, 1) * 96)}%`,
                        "--rest": `${Math.round(8 + rand(i, 2) * 80)}%`,
                        "--size": `${Math.round([11, 26, 0, 46][big] + rand(i, 3) * [12, 16, 0, 30][big])}px`,
                        "--drift": `${Math.round((rand(i, 4) - 0.5) * 80)}px`,
                        "--spin": `${Math.round((rand(i, 5) - 0.5) * 540)}deg`,
                        "--dur": `${(9 + rand(i, 6) * 9).toFixed(1)}s`,
                        "--delay": `${(-rand(i, 7) * 18).toFixed(1)}s`,
                    }}
                >
                    <Flake fiesta={fiesta} i={i} />
                </span>
            ))}
        </span>
    );
}

/* --- The places a page offers ---------------------------------------------- */

// `spot` is where it is mounted: "portrait", "companion" (the foot of the
// portrait), "masthead", "brand" or "garland".
export function Adorno({ spot }) {
    const fiesta = useFiesta();
    if (!fiesta) return null;

    if (spot === "garland") {
        return (
            <span className={`fiestaGarland is-${fiesta}`} aria-hidden="true">
                {Array.from({ length: 48 }, (_, i) => (
                    <span className="fiestaGarlandItem" key={i}>
                        <GarlandItem fiesta={fiesta} i={i} />
                    </span>
                ))}
            </span>
        );
    }

    const holiday = FIESTAS.includes(fiesta);
    const sets = holiday
        ? { portrait: PORTRAIT, companion: COMPANION, masthead: COMPANION, brand: BRAND }
        // The everyday drawings stay on the cover page. The user found a yarn
        // ball or a boat on the Libros or Eventos header unrelated to that page;
        // a holiday is the one time the whole site dresses up.
        : { portrait: Temas.PORTRAIT, companion: Temas.COMPANION, brand: Temas.BRAND };
    const art = sets[spot]?.[fiesta];
    if (!art) return null;
    return (
        <span className={`adorno adorno-${spot} is-${fiesta} ${holiday ? "" : "isTema"}`} aria-hidden="true">
            {art}
        </span>
    );
}
