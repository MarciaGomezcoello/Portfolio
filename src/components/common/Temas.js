import { LEAF, SPARKLE, starPath } from "./fiestaShapes";

/* ============================================================================
   Temas — the everyday themes' own drawings.

   The holidays were the first themes to bring drawings as well as colours
   (Fiesta.js). The user asked for every theme to have "its own spirit" in the
   same way, so each everyday theme has a set too: worn on or tucked against
   her portrait, a companion at its foot, a mark by her name, a garland along
   the footer, and — for some — a few things drifting through the hero. They
   are quieter than the holidays: fewer things in the sky, none at all for the
   calmer themes, and nothing on the inner pages' mastheads — a yarn ball or a
   boat there has nothing to do with Libros or Eventos. Only holidays dress
   the whole site.

   Colours are the theme's own tokens, through --fiesta-a … --fiesta-e and
   --fiesta-leaf (set for every theme at the end of styles/tokens.css).
   ============================================================================ */

export const TEMAS = [
    "papel", "salvia", "lavanda", "mar", "terracota", "noche",
    "durazno", "vino", "girasol", "cielo", "grafito", "medianoche",
];

/* How each theme's sky moves: things falling, rising, flying across, drifting
   slowly across, or still and twinkling. A theme not listed has no sky. */
export const SKY_MODE = {
    salvia: "fall",
    lavanda: "fall",
    durazno: "fall",
    mar: "rise",
    girasol: "fly",
    cielo: "drift",
    noche: "still",
    medianoche: "still",
};

/* --- Pieces ---------------------------------------------------------------- */

function YarnBall({ cx = 40, cy = 40, r = 30 }) {
    const k = r / 30;
    const t = (x, y) => `${(cx + x * k).toFixed(1)} ${(cy + y * k).toFixed(1)}`;
    return (
        <g>
            <circle className="fb" cx={cx} cy={cy} r={r} />
            <path
                className="fwrap"
                d={`M${t(-26, -10)}Q${t(0, -30)} ${t(26, -8)}M${t(-29, 4)}Q${t(0, -20)} ${t(29, 6)}M${t(-24, 18)}Q${t(0, -4)} ${t(24, 18)}M${t(-12, -27)}Q${t(-20, 0)} ${t(-6, 29)}M${t(12, -27)}Q${t(22, 2)} ${t(8, 29)}`}
            />
        </g>
    );
}

// A sprig of leaves from (x1, y1) to (x2, y2), leaves on alternate sides.
function Sprig({ x1, y1, x2, y2, n = 5, size = 0.36, fill = "fleaf" }) {
    const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const leaves = Array.from({ length: n }, (_, i) => {
        const f = (i + 1) / (n + 0.4);
        const x = x1 + (x2 - x1) * f;
        const y = y1 + (y2 - y1) * f;
        // The leaf's base sits on the stem and it points out at 50° to it.
        const dir = ang + (i % 2 ? 50 : -50);
        return (
            <path
                key={i}
                className={i % 3 === 2 && fill === "fleaf" ? "fb" : fill}
                transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(dir + 90).toFixed(0)}) scale(${size}) translate(0 -30)`}
                d={LEAF}
            />
        );
    });
    return (
        <g>
            <path className="fstemLeaf" d={`M${x1} ${y1}L${x2} ${y2}`} />
            {leaves}
        </g>
    );
}

// A stem of lavender: buds clustered along its last half.
function Lavender({ x1, y1, x2, y2 }) {
    const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const buds = [];
    for (let i = 0; i < 7; i++) {
        const f = 0.5 + i * 0.08;
        const x = x1 + (x2 - x1) * f;
        const y = y1 + (y2 - y1) * f;
        const off = i % 2 ? 4 : -4;
        buds.push(
            <ellipse
                key={i}
                className={i % 2 ? "fa" : "fb"}
                cx="0" cy={off} rx="5" ry="3.4"
                transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)})`}
            />
        );
    }
    return (
        <g>
            <path className="fstemLeaf" d={`M${x1} ${y1}L${x2} ${y2}`} />
            {buds}
        </g>
    );
}

function Sunflower({ cx, cy, r = 1 }) {
    const petals = Array.from({ length: 14 }, (_, i) => (
        <ellipse
            key={i}
            className={i % 2 ? "fc" : "fb"}
            cx={cx} cy={cy - 20 * r} rx={5.5 * r} ry={13 * r}
            transform={`rotate(${(i * 360) / 14} ${cx} ${cy})`}
        />
    ));
    return (
        <g>
            {petals}
            <circle className="fe" cx={cx} cy={cy} r={11 * r} />
            <circle className="fseed" cx={cx} cy={cy} r={6 * r} />
        </g>
    );
}

function Cloud({ x = 0, y = 0, s = 1, className = "fcloud" }) {
    return (
        <path
            className={className}
            transform={`translate(${x} ${y}) scale(${s})`}
            d="M18 50a16 16 0 0 1 4-31 24 24 0 0 1 45-6 18 18 0 0 1 28 16 14 14 0 0 1-3 21z"
        />
    );
}

function Crescent({ x = 0, y = 0, s = 1, className = "fc" }) {
    return (
        <path
            className={className}
            transform={`translate(${x} ${y}) scale(${s})`}
            d="M34 2A34 34 0 1 0 64 52 27 27 0 1 1 34 2z"
        />
    );
}

/* --- Worn on, or tucked against, the portrait ------------------------------ */

/* Papel, the default, leaves her portrait bare: the user asked for its needle
   and thread here and its yarn ball at the foot to go. Its yarn ball by her
   name and the buttons along the footer stay. */
export const PORTRAIT = {
    salvia: (
        <svg viewBox="0 0 130 110">
            <Sprig x1={10} y1={104} x2={120} y2={10} n={6} size={0.34} />
            <Sprig x1={40} y1={100} x2={100} y2={40} n={3} size={0.28} />
        </svg>
    ),
    lavanda: (
        <svg viewBox="0 0 120 120">
            <Lavender x1={14} y1={112} x2={96} y2={10} />
            <Lavender x1={14} y1={112} x2={112} y2={30} />
            <Lavender x1={14} y1={112} x2={70} y2={6} />
            <path className="fc" d="M36 84c-14-10-24-2-16 6zM36 84c2-16 14-18 14-6z" />
            <path className="fstrokeGold" d="M36 84l-12 22M36 84l2 24" />
        </svg>
    ),
    mar: (
        <svg viewBox="0 0 100 44">
            <path className="fbird" d="M8 34q12-15 24 0 12-15 24 0" />
            <path className="fbird" d="M58 14q8-10 16 0 8-10 16 0" />
        </svg>
    ),
    terracota: (
        <svg viewBox="0 0 100 100">
            <g className="fray">
                {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    return (
                        <path
                            key={i}
                            d={`M${(50 + Math.cos(a) * 30).toFixed(1)} ${(50 + Math.sin(a) * 30).toFixed(1)}L${(50 + Math.cos(a) * (i % 2 ? 40 : 46)).toFixed(1)} ${(50 + Math.sin(a) * (i % 2 ? 40 : 46)).toFixed(1)}`}
                        />
                    );
                })}
            </g>
            <circle className="fc" cx="50" cy="50" r="22" />
        </svg>
    ),
    noche: (
        <svg viewBox="0 0 110 90">
            <Crescent x={30} y={10} s={1.05} />
            <path className="fd" d={starPath(16, 20, 7, 4, 0.35)} />
            <path className="fd" d={starPath(100, 74, 5, 4, 0.35)} />
        </svg>
    ),
    durazno: (
        <svg viewBox="-60 -60 120 120">
            <path className="fleaf" transform="translate(-20 26) rotate(-130) scale(0.55)" d={LEAF} />
            <path className="fleaf" transform="translate(26 22) rotate(130) scale(0.45)" d={LEAF} />
            {Array.from({ length: 5 }, (_, i) => (
                <ellipse key={i} className="fb" cx="0" cy="-22" rx="17" ry="24" transform={`rotate(${i * 72})`} />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
                <ellipse key={i} className="fa" cx="0" cy="-12" rx="7" ry="12" transform={`rotate(${i * 72})`} />
            ))}
            <path className="fstrokeGold" d="M0 0l10-26" />
            <circle className="fc" cx="10" cy="-27" r="4" />
        </svg>
    ),
    vino: (
        <svg viewBox="0 0 44 96">
            <path className="fa" d="M2 0h18v92l-9-9-9 9z" />
            <path className="fc" d="M24 0h14v74l-7-7-7 7z" />
        </svg>
    ),
    girasol: (
        <svg viewBox="0 0 110 110">
            <path className="fleaf" transform="translate(30 84) rotate(-120) scale(0.6)" d={LEAF} />
            <Sunflower cx={58} cy={52} r={1.45} />
        </svg>
    ),
    cielo: (
        <svg viewBox="0 0 110 60">
            <Cloud />
        </svg>
    ),
    grafito: (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
                className="fcrop"
                vectorEffect="non-scaling-stroke"
                d="M0 9V0h7M93 0h7v9M100 91v9h-7M7 100H0v-9"
            />
        </svg>
    ),
    medianoche: (
        <svg viewBox="0 0 60 84">
            <path className="fwire" d="M34 0v38" />
            <path className="fc" d={starPath(34, 56, 18, 5, 0.45)} />
            <path className="fc" transform="translate(12 24) scale(0.55)" d={SPARKLE} />
        </svg>
    ),
};

/* --- At the foot of the portrait ------------------------------------------ */

export const COMPANION = {
    salvia: (
        <svg viewBox="0 0 120 120">
            <Sprig x1={60} y1={76} x2={30} y2={10} n={5} size={0.32} />
            <Sprig x1={60} y1={76} x2={96} y2={14} n={5} size={0.32} />
            <Sprig x1={60} y1={76} x2={62} y2={4} n={4} size={0.3} />
            <rect className="fa" x="26" y="72" width="68" height="12" rx="3" />
            <path className="fc" d="M31 84h58l-7 34H38z" />
        </svg>
    ),
    lavanda: (
        <svg viewBox="0 0 130 112">
            <rect className="fa" x="10" y="80" width="106" height="20" rx="2" />
            <rect className="fb" x="18" y="60" width="94" height="20" rx="2" />
            <rect className="fe" x="8" y="40" width="100" height="20" rx="2" />
            <path className="fpage" d="M14 50h88M22 70h84M16 90h94" />
            <Lavender x1={16} y1={36} x2={118} y2={14} />
            <Lavender x1={16} y1={36} x2={110} y2={2} />
        </svg>
    ),
    mar: (
        <svg viewBox="0 0 124 112">
            <path className="fd" d="M62 8v52H20z" />
            <path className="fb" d="M67 22v38h34z" />
            <path className="fe" d="M8 62h108l-18 26H26z" />
            <path className="fb" d="M0 90q15-9 31 0t31 0 31 0 31 0v22H0z" />
            <path className="fa" d="M0 100q15-9 31 0t31 0 31 0 31 0v12H0z" />
        </svg>
    ),
    terracota: (
        <svg viewBox="0 0 124 120">
            <path className="fstrokeA" d="M86 44q30 4 20 36" />
            <path className="fa" d="M42 24h40v10c24 8 34 30 32 50-2 22-24 34-52 34S12 106 10 84c-2-20 8-42 32-50z" />
            <rect className="fb" x="36" y="16" width="52" height="12" rx="3" />
            <path className="fzig" d="M18 70l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8" />
            <g className="fc">
                {[26, 40, 54, 68, 82, 96].map((x) => <circle key={x} cx={x} cy="86" r="3.2" />)}
            </g>
        </svg>
    ),
    noche: (
        <svg viewBox="0 0 132 112">
            <circle className="fglow" cx="26" cy="22" r="20" />
            <path className="fc" d="M26 4c7 9 9 16 0 25-9-9-7-16 0-25z" />
            <rect className="fb" x="16" y="34" width="20" height="66" rx="3" />
            <rect className="fe" x="8" y="98" width="36" height="8" rx="3" />
            <path className="fd" d="M50 82q20-10 40 0v24q-20-10-40 0z" />
            <path className="fd" d="M90 82q20-10 40 0v24q-20-10-40 0z" />
            <path className="fline" d="M58 88q12-5 26 0M58 95q12-5 26 0M96 88q12-5 26 0M96 95q12-5 26 0" />
        </svg>
    ),
    durazno: (
        <svg viewBox="0 0 130 116">
            <path className="fleaf" transform="translate(70 18) rotate(40) scale(0.4)" d={LEAF} />
            <circle className="fb" cx="40" cy="56" r="22" />
            <circle className="fa" cx="90" cy="56" r="22" />
            <circle className="fb" cx="65" cy="42" r="23" />
            <path className="fshine" d="M56 30a10 8 -30 0 1 12-4" />
            <path className="fc" d="M10 64h110l-14 50H24z" />
            <path className="fweave" d="M18 78h94M22 92h86M26 106h78M44 64l4 50M65 64v50M86 64l-4 50" />
        </svg>
    ),
    vino: (
        <svg viewBox="0 0 130 120">
            <path className="fb" d="M62 78C74 50 102 18 128 4 118 26 98 56 70 80z" />
            <path className="fquill" d="M64 82L124 10" />
            <rect className="fc" x="34" y="72" width="44" height="10" rx="2" />
            <path className="fe" d="M30 82h52v8c10 4 12 12 12 20v8H18v-8c0-8 2-16 12-20z" />
        </svg>
    ),
    girasol: (
        <svg viewBox="0 0 120 124">
            <path className="fstemLeaf" d="M44 82C40 60 36 44 34 34M76 82c4-24 10-40 14-50" />
            <path className="fleaf" transform="translate(44 64) rotate(-60) scale(0.35)" d={LEAF} />
            <Sunflower cx={34} cy={32} r={0.95} />
            <Sunflower cx={90} cy={30} r={1.05} />
            <path className="fd" d="M30 80h60v6c6 4 8 10 8 18v14c0 3-3 6-6 6H28c-3 0-6-3-6-6v-14c0-8 2-14 8-18z" />
            <rect className="fa" x="30" y="94" width="60" height="8" />
        </svg>
    ),
    cielo: (
        <svg viewBox="0 0 120 130">
            <path className="fb" d="M60 6c28 0 46 20 46 44 0 22-22 38-32 50H46C36 88 14 72 14 50 14 26 32 6 60 6z" />
            <ellipse className="fa" cx="60" cy="50" rx="14" ry="44" />
            <path className="fline" d="M48 100l4 14M72 100l-4 14" />
            <rect className="fc" x="48" y="112" width="24" height="16" rx="2" />
            <path className="fbird" d="M92 110q6-7 12 0 6-7 12 0" />
        </svg>
    ),
    grafito: (
        <svg viewBox="0 0 124 124">
            <path className="fe" d="M34 92c-14-2-22 8-14 18 10 10 26 4 26-8 8 8 20 2 16-8-4-8-18-10-28-2z" />
            <circle className="fe" cx="72" cy="112" r="4" />
            <circle className="fe" cx="16" cy="84" r="3" />
            <g transform="translate(78 48) rotate(40)">
                <path className="fe" d="M0-46l16 34-16 40-16-40z" />
                <path className="fcutLine" d="M0-6v34" />
                <circle className="fcut" cx="0" cy="-8" r="4" />
                <rect className="fe" x="-12" y="-72" width="24" height="26" rx="3" />
            </g>
        </svg>
    ),
    medianoche: (
        <svg viewBox="0 0 130 100">
            <path className="fconst" d="M12 80L38 52 66 62 92 26 118 40M66 62l34 28" />
            {[[12, 80, 10], [38, 52, 13], [66, 62, 9], [92, 26, 16], [118, 40, 10], [100, 90, 9]].map(([x, y, r]) => (
                <path key={`${x}-${y}`} className="fc" transform={`translate(${x} ${y}) scale(${r / 11})`} d={SPARKLE} />
            ))}
            <Crescent x={4} y={4} s={0.4} className="fd" />
        </svg>
    ),
};

/* --- By her name in the bar ------------------------------------------------ */

export const BRAND = {
    papel: <svg viewBox="0 0 80 80"><YarnBall cx={40} cy={40} r={34} /></svg>,
    salvia: <svg viewBox="-42 -42 84 84"><path className="fleaf" d={LEAF} /></svg>,
    lavanda: <svg viewBox="0 0 40 80"><Lavender x1={20} y1={78} x2={20} y2={4} /></svg>,
    mar: <svg viewBox="0 0 40 26"><path className="fwave" d="M2 16q9-12 18 0t18 0" /></svg>,
    terracota: PORTRAIT.terracota,
    noche: <svg viewBox="0 0 70 70"><Crescent /></svg>,
    durazno: (
        <svg viewBox="0 0 50 50">
            <path className="fleaf" transform="translate(30 8) rotate(50) scale(0.25)" d={LEAF} />
            <circle className="fb" cx="24" cy="30" r="18" />
        </svg>
    ),
    vino: <svg viewBox="0 0 44 96"><path className="fa" d="M12 0h20v92l-10-10-10 10z" /></svg>,
    girasol: <svg viewBox="0 0 70 70"><Sunflower cx={35} cy={35} r={1.05} /></svg>,
    cielo: <svg viewBox="0 0 100 56"><Cloud /></svg>,
    grafito: <svg viewBox="-14 -14 28 28"><path className="fcrop" d="M0-12V12M-10.4-6 10.4 6M-10.4 6 10.4-6" /></svg>,
    medianoche: <svg viewBox="-12 -12 24 24"><path className="fc" d={starPath(0, 0, 11, 5, 0.45)} /></svg>,
};

/* --- One link of the footer garland ---------------------------------------- */

export function GarlandItem({ tema, i }) {
    const wire = <path className="fwire" d="M0 3q20 10 40 0" />;
    switch (tema) {
        case "papel":
            return (
                <svg viewBox="0 0 40 44">
                    <path className="fthread" d="M2 5h12M24 5h14" />
                    {i % 3 === 1 && (
                        <>
                            <path className="fthreadThin" d="M20 5v8" />
                            <circle className={i % 2 ? "fb" : "fc"} cx="20" cy="21" r="8" />
                            <g className="fcut">
                                <circle cx="17.5" cy="18.5" r="1.3" /><circle cx="22.5" cy="18.5" r="1.3" />
                                <circle cx="17.5" cy="23.5" r="1.3" /><circle cx="22.5" cy="23.5" r="1.3" />
                            </g>
                        </>
                    )}
                </svg>
            );
        case "salvia":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <path
                        className={i % 3 === 2 ? "fb" : "fleaf"}
                        transform={`translate(20 ${i % 2 ? 12 : 10}) rotate(${i % 2 ? 160 : 200}) scale(0.3) translate(0 -30)`}
                        d={LEAF}
                    />
                </svg>
            );
        case "lavanda":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    {i % 2 === 0 && <Lavender x1={20} y1={7} x2={20} y2={40} />}
                </svg>
            );
        case "mar":
            return (
                <svg viewBox="0 0 40 44">
                    <path className={i % 2 ? "fwave" : "fwaveB"} d="M0 12q10 12 20 0t20 0" />
                    <path className="fwaveB" d="M0 24q10 12 20 0t20 0" opacity="0.5" />
                </svg>
            );
        case "terracota":
            return (
                <svg viewBox="0 0 40 44">
                    <path className="fwire" d="M0 3h40" />
                    <path className={i % 2 ? "fc" : "fa"} d="M20 6l12 14-12 14L8 20z" />
                    <path className="fd" d="M20 14l5 6-5 6-5-6z" />
                </svg>
            );
        case "noche":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <path className="fwire" d={`M20 8v${i % 2 ? 12 : 6}`} />
                    {i % 3 === 0
                        ? <Crescent x={12} y={i % 2 ? 20 : 14} s={0.24} className="fd" />
                        : <path className="fc" d={starPath(20, i % 2 ? 26 : 20, 6, 5, 0.45)} />}
                </svg>
            );
        case "durazno":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    <path className={["fa", "fb", "fc"][i % 3]} d="M7 7h26v14a13 13 0 0 1-26 0z" />
                </svg>
            );
        case "vino":
            return (
                <svg viewBox="0 0 40 44">
                    <path className="fwire" d="M0 10h40" />
                    <path className={i % 2 ? "fa" : "fc"} d="M20 3l6 7-6 7-6-7z" />
                    {i % 2 === 0 && <circle className="fa" cx="20" cy="24" r="2.5" />}
                </svg>
            );
        case "girasol":
            return (
                <svg viewBox="0 0 40 44">
                    {wire}
                    {i % 2 === 0
                        ? <Sunflower cx={20} cy={22} r={0.5} />
                        : <circle className="fa" cx="20" cy="14" r="3" />}
                </svg>
            );
        case "cielo":
            return (
                <svg viewBox="0 0 40 44">
                    {i % 3 === 0
                        ? <Cloud x={2} y={2} s={0.36} />
                        : <path className="fbird" d={`M${i % 2 ? 8 : 12} 22q5-6 10 0 5-6 10 0`} />}
                </svg>
            );
        case "grafito":
            return (
                <svg viewBox="0 0 40 44">
                    <path className="fruler" d="M0 3h40M0 3v12M10 3v6M20 3v9M30 3v6" />
                </svg>
            );
        case "medianoche":
            return (
                <svg viewBox="0 0 40 44">
                    <path className="fwire" d="M0 3h40" />
                    <path className="fwire" d={`M20 3v${[8, 16, 11][i % 3]}`} />
                    <path className="fc" transform={`translate(20 ${[16, 24, 19][i % 3]}) scale(${i % 2 ? 0.5 : 0.7})`} d={SPARKLE} />
                </svg>
            );
        default:
            return null;
    }
}

/* --- Things in the sky ----------------------------------------------------- */

export function Flake({ tema, i }) {
    switch (tema) {
        case "salvia":
            return <svg viewBox="-42 -42 84 84"><path className={i % 3 === 2 ? "fb" : "fleaf"} d={LEAF} /></svg>;
        case "lavanda":
        case "durazno":
            return <svg viewBox="-12 -12 24 24"><ellipse className={i % 2 ? "fa" : "fb"} rx="5" ry="9" /></svg>;
        case "mar":
            return <svg viewBox="-12 -12 24 24"><circle className="fbubble" r="9" /></svg>;
        case "girasol":
            return (
                <svg viewBox="0 0 34 24">
                    <ellipse className="fwing" cx="13" cy="6" rx="6" ry="5" />
                    <ellipse className="fwing" cx="20" cy="6" rx="6" ry="5" />
                    <ellipse className="fc" cx="17" cy="15" rx="11" ry="7" />
                    <path className="fbeeStripe" d="M13 9v12M19 8.5v13" />
                </svg>
            );
        case "cielo":
            return <svg viewBox="0 0 100 56"><Cloud /></svg>;
        case "noche":
        case "medianoche":
            return <svg viewBox="-12 -12 24 24"><path className={i % 3 ? "fc" : "fd"} d={SPARKLE} /></svg>;
        default:
            return null;
    }
}
