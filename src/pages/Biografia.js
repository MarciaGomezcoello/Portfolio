import {
    hasItems, hasText, toLines, shapeRatio, partOn, sectionOn,
} from "../content/site";
import Figure from "../components/common/Figure";
import { ratioStyle, useNaturalRatio } from "../components/common/naturalRatio";
import Reveal from "../components/common/Reveal";
import PageHeader from "../components/common/PageHeader";
import "./Biografia.css";

/* ============================================================================
   Biografía — the long version, plus a dated spine down the page.

   The prose carries the story; the timeline lets someone scanning for a date
   or a title find it without reading four paragraphs first. What she trained
   as and what she was given for it sit together, above the timeline: the
   doctorate is the first credential and the awards are the rest of the same
   answer.

   The recognitions hang as a wall of framed pictures, each one in the shape it
   was photographed in — a diploma is wide, a certificate is tall, a medal is
   neither — using the same three shapes the knitting gallery offers, so there
   is one vocabulary of shapes across the whole site rather than two.

   Between the prose and the credentials sits the album: the personal half of
   the same story, and the only place on the site where a picture is not framed
   at all. See the note above the leaf for why it is built the way it is.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   The album.

   A leaf out of a photograph album: bare prints held to the paper by four
   paper corners, each sitting very slightly out of true, with the year and a
   line about it underneath.

   Nothing else on the site is laid out this way, and it is the shapes that
   made the layout. Every other wall of pictures here gives each picture the
   same WIDTH and lets the heights come out uneven — the knitting hangs from a
   thread, the recognitions hang in a row of frames. This one does the
   opposite: every print is the same HEIGHT and takes whatever width its shape
   gives it, so a wide photograph runs on across the page and a standing one
   sits narrow beside it, which is what a page of snapshots actually looks
   like. Mixing the three shapes is the whole point rather than something the
   layout has to survive.

   It is a centred flex line, so a short last row centres itself instead of
   being packed against the left — the same rule the clothesline needed.

   The tilt comes from each print's position in the list, five angles taken in
   turn, so the page reads as assembled by hand and nothing has to be written
   into the JSON to make it so. Adding a photograph re-deals the angles, which
   is fine: no single print's tilt means anything.
   ---------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
   The gold pieces of the credentials: a laurel medal carrying the rod of
   Asclepius for the doctorate.
   Drawn, not photographed, so they take the theme's own gold and cost no file.
   Decoration only: hidden from screen readers.
   ---------------------------------------------------------------------------- */

function laurelLeaves() {
    const leaves = [];
    for (let k = 0; k < 9; k++) {
        const a = 104 + k * 17; // degrees, from the foot of the wreath up its left side
        const rad = (a * Math.PI) / 180;
        const r = 41 + (k % 2 ? 3.5 : -3.5);
        const x = 50 + Math.cos(rad) * r;
        const y = 50 + Math.sin(rad) * r;
        const leaf = { rx: 4, ry: 9.6 - k * 0.35 };
        leaves.push(
            <ellipse key={`l${k}`} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={leaf.rx} ry={leaf.ry} transform={`rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})`} />,
            <ellipse key={`r${k}`} cx={(100 - x).toFixed(1)} cy={y.toFixed(1)} rx={leaf.rx} ry={leaf.ry} transform={`rotate(${180 - a} ${(100 - x).toFixed(1)} ${y.toFixed(1)})`} />
        );
    }
    return leaves;
}

function DoctorMedal({ className }) {
    return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
            <circle className="medalHalo" cx="50" cy="50" r="49" />
            <g className="medalLaurel">{laurelLeaves()}</g>
            <path className="medalTie" d="M44 90q6-6 12 0M50 86l-7 11M50 86l7 11" />
            <circle className="medalDisc" cx="50" cy="50" r="29" />
            <circle className="medalRing" cx="50" cy="50" r="25.5" />
            <path className="medalRod" d="M50 27v48" />
            <circle className="medalKnob" cx="50" cy="27" r="2.6" />
            <path className="medalSnake" d="M43 71c13-1 15-8 7-11s-8-9 1-11 10-8 0-12" />
            <circle className="medalKnob" cx="49" cy="37" r="2.2" />
        </svg>
    );
}

function AlbumLeaf({ album }) {
    const items = hasItems(album.items) ? album.items : [];
    if (!sectionOn(album) || items.length === 0) return null;

    // These prints do not open. They are her childhood and her family, and the
    // user asked that the personal photographs stay at the size she placed them
    // at rather than being pulled up full screen — the album is the one wall of
    // pictures on the site that is looked at as a page, not as a gallery.

    return (
        <section className="band albumBand">
            <div className="bandInner">
                <Reveal className="bandHead">
                    <div>
                        {hasText(album.kicker) && (
                            <span className="kicker">{album.kicker}</span>
                        )}
                        <h2 className="bandTitle">
                            {album.title || "Álbum"}
                        </h2>
                        {hasText(album.lead) && (
                            <p className="bandLead">{album.lead}</p>
                        )}
                    </div>
                </Reveal>

                <ul className="albumLeaf">
                    {items.map((shot, i) => (
                        <Reveal
                            as="li"
                            className="albumMount"
                            key={i}
                            delay={Math.min(i, 5) * 80}
                        >
                            <AlbumShot shot={shot} />

                            {(hasText(shot.year) || hasText(shot.pie)) && (
                                <div className="albumNote">
                                    {hasText(shot.year) && (
                                        <span className="albumYear">{shot.year}</span>
                                    )}
                                    {hasText(shot.pie) && (
                                        <span className="albumPie">{shot.pie}</span>
                                    )}
                                </div>
                            )}
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* One print on the leaf. The shape is on the mount as well as on the picture
   inside it: the mount is given a height and works its own width out from the
   ratio, which is what puts every print on the line at one height. That ratio is
   the photograph's own once the file is known, and until then the shape it was
   filed under. */
function AlbumShot({ shot }) {
    const ratio = useNaturalRatio(shot.photo, shapeRatio(shot.shape));

    return (
        <div className="albumShot" style={ratioStyle(ratio)}>
            <Figure
                src={shot.photo}
                alt={shot.photoAlt || shot.pie || ""}
                kind="portrait"
                ratio={ratio}
                label="photoFrame"
            />

            {/* Four paper corners. Opaque, because a real corner mount is a slip
                of paper the print tucks behind — and because a translucent one
                would vanish against the reserved frame, which is what she will
                be looking at until the photographs arrive. */}
            <span className="albumCorner albumCornerTL" aria-hidden="true" />
            <span className="albumCorner albumCornerTR" aria-hidden="true" />
            <span className="albumCorner albumCornerBR" aria-hidden="true" />
            <span className="albumCorner albumCornerBL" aria-hidden="true" />
        </div>
    );
}

function Biografia({ biografia = {} }) {
    const paras = toLines(biografia.body).filter((p) => p.trim() !== "");
    const roles = hasItems(biografia.roles) ? biografia.roles : [];
    const timeline = biografia.timeline || {};
    const timelineItems = hasItems(timeline.items) ? timeline.items : [];
    const album = biografia.album || {};
    const formacion = biografia.formacion || {};
    const recognition = biografia.recognition || {};
    const recognitionItems = hasItems(recognition.items) ? recognition.items : [];

    return (
        <>
            {partOn(biografia, "headVisible") && (
                <PageHeader
                    kicker={biografia.kicker}
                    title={biografia.title || "Biografía"}
                    lead={biografia.lede}
                />
            )}

            {partOn(biografia, "bioVisible") && (
                <section className="band">
                    <div className="bandInner bioGrid">
                        <Reveal className="bioPortrait">
                            <Figure
                                src={biografia.portrait}
                                alt={biografia.portraitAlt}
                                kind="portrait"
                                ratio={shapeRatio(biografia.portraitShape)}
                                label="portraitFrame"
                            />
                            {roles.length > 0 && (
                                <ul className="bioRoles">
                                    {roles.map((role, i) => (
                                        <li className="bioRole" key={i}>{role}</li>
                                    ))}
                                </ul>
                            )}
                        </Reveal>

                        <Reveal className="bioProse" delay={120}>
                            {paras.map((p, i) => (
                                <p className="bioPara" key={i}>{p}</p>
                            ))}
                        </Reveal>
                    </div>
                </section>
            )}

            {sectionOn(formacion) && hasText(formacion.degree) && (
                <section className="band bandStrong credsBand">
                    <div className="bandInner">
                        <Reveal className="credsHead">
                            {hasText(formacion.kicker) && (
                                <span className="kicker">{formacion.kicker}</span>
                            )}
                            <h2 className="bandTitle">
                                {formacion.title || "Formación"}
                            </h2>
                            {hasText(formacion.lead) && (
                                <p className="bandLead">{formacion.lead}</p>
                            )}
                        </Reveal>

                        {/* The doctorate is the biggest thing on this page, so
                            it is presented as what it is: a certificate. A
                            paper card with a double gold rule and corner marks,
                            her laurel medal, the degree set large, and the
                            diploma matted beside it. */}
                        <Reveal className="credsCert" delay={120}>
                            <span className="credsCorner isTL" aria-hidden="true" />
                            <span className="credsCorner isTR" aria-hidden="true" />
                            <span className="credsCorner isBL" aria-hidden="true" />
                            <span className="credsCorner isBR" aria-hidden="true" />

                            <div className="credsCertText">
                                <DoctorMedal className="credsMedal" />
                                <h3 className="credsDegree">{formacion.degree}</h3>
                                <span className="goldRule" aria-hidden="true"><i /></span>
                                {hasText(formacion.place) && (
                                    <span className="credsPlace">{formacion.place}</span>
                                )}
                                {hasText(formacion.detail) && (
                                    <span className="credsDetail">{formacion.detail}</span>
                                )}
                            </div>

                            <div className="credsPhoto">
                                <div className="credsMat">
                                    <Figure
                                        src={formacion.photo}
                                        alt={formacion.photoAlt}
                                        kind="award"
                                        ratio={shapeRatio(formacion.shape)}
                                        label="diploma"
                                        zoom={{
                                            src: formacion.photo,
                                            alt: formacion.photoAlt,
                                            caption: formacion.degree,
                                        }}
                                    />
                                </div>
                            </div>
                        </Reveal>

                    </div>
                </section>
            )}

            {sectionOn(recognition) && recognitionItems.length > 0 && (
                <section className="band">
                    <div className="bandInner">
                        <Reveal className="bandHead">
                            <div>
                                {hasText(recognition.kicker) && (
                                    <span className="kicker">{recognition.kicker}</span>
                                )}
                                <h2 className="bandTitle">
                                    {recognition.title || "Reconocimientos"}
                                </h2>
                                {hasText(recognition.lead) && (
                                    <p className="bandLead">{recognition.lead}</p>
                                )}
                            </div>
                        </Reveal>

                        <ul className="awardWall">
                            {recognitionItems.map((a, i) => (
                                <Reveal as="li" className="awardCard" key={i} delay={i * 90}>
                                    {/* The frame floats in a slot of its own so
                                        that frames of different shapes can be
                                        centred against each other and the words
                                        below them still start on one line. */}
                                    <div className="awardSlot">
                                        <div className="awardFrame">
                                            <Figure
                                                src={a.photo}
                                                alt={a.photoAlt || a.title || ""}
                                                kind="award"
                                                ratio={shapeRatio(a.shape)}
                                                label="award"
                                                /* A diploma is mostly small
                                                   print: the picture on this
                                                   page that most wants
                                                   opening. */
                                                zoom={{
                                                    src: a.photo,
                                                    alt: a.photoAlt || a.title || "",
                                                    caption: a.title,
                                                    note: a.year,
                                                }}
                                            />
                                            {a.year && (
                                                <span className="awardSeal">{a.year}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="awardBody">
                                        <span className="goldRule isSmall" aria-hidden="true"><i /></span>
                                        {a.title && (
                                            <h3 className="awardTitle">{a.title}</h3>
                                        )}
                                        {a.text && (
                                            <p className="awardText">{a.text}</p>
                                        )}
                                    </div>
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* Her life in photographs, after the recognitions and before the
                chronology. */}
            <AlbumLeaf album={album} />

            {sectionOn(timeline) && timelineItems.length > 0 && (
                <section className="band timelineBand">
                    <div className="bandInner">
                        <Reveal className="bandHead">
                            <div>
                                {hasText(timeline.kicker) && (
                                    <span className="kicker">{timeline.kicker}</span>
                                )}
                                <h2 className="bandTitle">{timeline.title || "Cronología"}</h2>
                            </div>
                        </Reveal>

                        <ol className="timeline">
                            {timelineItems.map((item, i) => (
                                <Reveal as="li" className="timelineItem" key={i} delay={(i % 4) * 70}>
                                    <span className="timelineDot" aria-hidden="true" />
                                    <span className="timelineYear">{item.year}</span>
                                    <div className="timelineBody">
                                        {item.title && (
                                            <h3 className="timelineTitle">{item.title}</h3>
                                        )}
                                        {item.text && (
                                            <p className="timelineText">{item.text}</p>
                                        )}
                                    </div>
                                </Reveal>
                            ))}
                        </ol>
                    </div>
                </section>
            )}
        </>
    );
}

export default Biografia;
