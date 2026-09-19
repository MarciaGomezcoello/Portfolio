import { useEffect, useRef, useState } from "react";
import { useWords } from "../components/common/Words";
import { Link, useLocation, useParams } from "react-router-dom";
import {
    findEvent, hasItems, hasText, toLines, shapeRatio,
} from "../content/site";
import Figure from "../components/common/Figure";
import { ratioStyle, useNaturalRatio } from "../components/common/naturalRatio";
import Reveal from "../components/common/Reveal";
import "./EventoDetalle.css";

/* ============================================================================
   One encounter, on its own page.

   The photographs first, then what happened — which is the order somebody
   remembers an evening in, and the order she will have the material in too: the
   pictures exist the same night, the account gets written later or not at all.

   The pictures are drawn as prints out of an envelope: one on a mount, and the
   rest of them below it in a tray, small, the way a photographer lays a sheet of
   proofs out. Touching one of the small prints puts it on the mount. The big
   print was itself a rail that could be dragged and is not any more — a gesture
   that had to be held to one picture however hard it was thrown turned out to
   cost more than it was worth, and pointing at the print you want is both surer
   and less to explain. The frame counter is set as a fraction in the display
   face, the way a plate is numbered in a book. Nothing advances on its own and
   there are no dots.

   Every frame she has written counts, whether or not its picture has been
   uploaded — an empty one shows the reserved frame that stands in for a picture
   everywhere else on this site. That matters here more than most places: it is
   what lets her see the gallery she is building before she has filled it.

   The account goes underneath, and is optional; so is the gallery. With neither,
   the archive does not link here in the first place.
   ============================================================================ */

/* --- The prints ----------------------------------------------------------- */

/* One of the small prints in the tray. It is a component of its own so that it
   can carry the shape of its own file: the frame closes around the photograph
   once the browser has it, and holds the shape it was filed under until then. */
function StripFrame({ frame, reserved, isUp, label, onChoose, hold }) {
    const ratio = useNaturalRatio(frame.src, reserved);

    return (
        <button
            type="button"
            className={`eventStripFrame ${isUp ? "isUp" : ""}`}
            style={ratioStyle(ratio)}
            onClick={onChoose}
            aria-label={label}
            aria-current={isUp ? "true" : undefined}
            ref={hold}
        >
            <Figure src={frame.src} alt="" kind="event" ratio={ratio} label="" />
        </button>
    );
}

function Gallery({ frames, label, shape }) {
    // Each photograph may name its own shape and falls back to the encounter's.
    // The print set, not the gentle one: one picture is shown at a time, so the
    // three shapes can be as different as they really are.
    const ratioOf = (f) => shapeRatio((f && f.shape) || shape, "print");

    const count = frames.length;
    const many = count > 1;

    // Which photograph is on the mount. That is the whole state of this
    // gallery now.
    //
    // The big print used to be a rail that was dragged, laid out three times
    // over so it could run on past the last picture into the first. It is a
    // single mounted print instead, and the small prints underneath are the way
    // through the envelope — which is what they were already for, and they can
    // be pointed at exactly rather than aimed at. Gone with the rail: the
    // circular reel, the pointer drag, the wheel handling, the neighbours
    // peeking at the edges, and the re-centring after a resize, all of which
    // existed to make a gesture behave.
    const [shown, setShown] = useState(0);
    const current = frames[Math.min(shown, count - 1)];

    // The plate closes around the photograph itself once the file is known; the
    // shape it was filed under only reserves the space until then.
    const plateRatio = useNaturalRatio(current.src, ratioOf(current));

    /* --- The strip of small prints ---------------------------------------- */

    // The strip is a rail. With five prints it fits and none of this shows;
    // with thirty it does not, and a row that can only be reached by a scrollbar
    // is a row most people never reach at all. So it drags, it carries the print
    // that is up into view on its own, and it says at its edges when there is
    // more of it.
    //
    // This one is still scrolled by the browser, and should stay that way: it is
    // a strip to be run along, not stepped through a frame at a time, so there
    // is nothing here for a fling to overshoot.
    const strip = useRef(null);
    const thumbs = useRef([]);
    const stripDrag = useRef(null);
    const swept = useRef(false);
    const [stripDragging, setStripDragging] = useState(false);
    const [spills, setSpills] = useState(false);

    const measureStrip = () => {
        const el = strip.current;
        if (el) setSpills(el.scrollWidth > el.clientWidth + 1);
    };

    useEffect(() => {
        measureStrip();
        window.addEventListener("resize", measureStrip);
        return () => window.removeEventListener("resize", measureStrip);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    // Whichever print is up is brought into the strip if it has fallen off
    // either end — but only far enough to be seen, so the strip is not
    // constantly re-centring itself under the hand.
    useEffect(() => {
        const el = strip.current;
        const t = thumbs.current[shown];
        if (!el || !t) return;
        const edge = 14;
        const left = t.offsetLeft - edge;
        const right = t.offsetLeft + t.offsetWidth + edge;
        if (left < el.scrollLeft) {
            el.scrollTo({ left, behavior: "smooth" });
        } else if (right > el.scrollLeft + el.clientWidth) {
            el.scrollTo({ left: right - el.clientWidth, behavior: "smooth" });
        }
    }, [shown]);

    const onStripDown = (e) => {
        if (e.pointerType === "touch" || !strip.current) return;
        stripDrag.current = {
            x: e.clientX,
            from: strip.current.scrollLeft,
            moved: false,
        };
        setStripDragging(true);
    };

    const onStripMove = (e) => {
        if (!stripDrag.current || !strip.current) return;
        const by = e.clientX - stripDrag.current.x;
        if (Math.abs(by) > 3) stripDrag.current.moved = true;
        strip.current.scrollLeft = stripDrag.current.from - by;
    };

    // A drag that ends on a small print must not also count as choosing it.
    const onStripUp = () => {
        if (!stripDrag.current) return;
        swept.current = stripDrag.current.moved;
        stripDrag.current = null;
        setStripDragging(false);
    };

    const goToFrame = (frame) => {
        if (swept.current) {
            swept.current = false;
            return;
        }
        setShown(frame);
    };

    return (
        <section className="eventGallery" aria-label={label}>
            <Reveal className="eventPrint">
                {/* One print on its mount: warm paper carrying the site's weave,
                    a thread-gold hairline just inside the edge the way the
                    recognitions are framed, and a shadow deep enough to lift it
                    off the band. The print keeps the mount's height and takes
                    whatever width its own shape asks for, so a standing
                    photograph sits narrow on the sheet and a lying one runs
                    nearly across it — the mount does not change height as they
                    are changed. */}
                <div className="eventPrintMat" role="group" aria-label={label}>
                    <div
                        className="eventPrintPlate"
                        style={ratioStyle(plateRatio)}
                        /* Keyed by position, so React lays a new print rather
                           than repainting the old one — which is what lets it
                           come up rather than cut. */
                        key={shown}
                    >
                        <Figure
                            src={current.src}
                            alt={current.alt || ""}
                            kind="event"
                            ratio={plateRatio}
                            label="photoFrame"
                            /* The one picture on the page that must not wait
                               for its own trigger before it may paint. The rest
                               are fetched by the strip as they are scrolled to,
                               and a photograph can only be chosen from a small
                               print somebody can see — so by the time one is
                               asked for on the mount it is already in hand. */
                            priority
                            zoom={{
                                src: current.src,
                                alt: current.alt || "",
                            }}
                        />
                    </div>
                </div>

                {many && (
                    <div className="eventPrintLine">
                        {/* Numbered the way a plate is numbered in a book. The
                            photograph's own line used to sit here beside it and
                            was taken out; it is still read on the print itself,
                            under the picture, when one is opened. */}
                        <span className="eventPrintCount">
                            <span className="eventPrintCountNow">
                                {String(shown + 1).padStart(2, "0")}
                            </span>
                            <span aria-hidden="true"> / </span>
                            {String(count).padStart(2, "0")}
                        </span>
                    </div>
                )}
            </Reveal>

            {/* The rest of the envelope, and the way through it.

                The list carries the ref and the handlers rather than the Reveal
                around it: Reveal keeps its own ref for the observer and does not
                forward one, and it is not worth changing a component five pages
                share for this. */}
            {many && (
                <Reveal delay={90} className="eventStripTray">
                    <ul
                        className={`eventStrip ${spills ? "spills" : ""} ${
                            stripDragging ? "isDragging" : ""
                        }`}
                        ref={strip}
                        onPointerDown={onStripDown}
                        onPointerMove={onStripMove}
                        onPointerUp={onStripUp}
                        onPointerCancel={onStripUp}
                        onPointerLeave={onStripUp}
                    >
                        {frames.map((f, i) => (
                            <li key={i}>
                                <StripFrame
                                    frame={f}
                                    reserved={ratioOf(f)}
                                    isUp={i === shown}
                                    label={`Foto ${i + 1}`}
                                    onChoose={() => goToFrame(i)}
                                    hold={(el) => {
                                        thumbs.current[i] = el;
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                </Reveal>
            )}
        </section>
    );
}

/* An address that matches no encounter. A mistyped link is a way out, not a
   blank page — and this belongs with the routing rather than with the page,
   because it is about a bad address, not about an evening. */
function EventMissing({ labels = {} }) {
    const words = useWords();
    return (
        <section className="band eventMissing">
            <div className="bandInner">
                <span className="kicker">{words.missingKicker}</span>
                <h1 className="bandTitle">{words.eventMissing}</h1>
                <p className="bandLead">{words.missingText}</p>
                <Link className="btn btnSolid eventMissingCta" to="/eventos">
                    {labels.backLabel || "Todos los encuentros"}
                </Link>
            </div>
        </section>
    );
}

/* --- The page --------------------------------------------------------------
   Pure: it renders the encounter it is handed and looks nothing up. That is
   what lets the cover page pass its own copy of the next encounter, and what
   will let the editing app show an evening that is not on disk yet. */
export function EventoPage({ event, labels = {} }) {
    // The cover leads the envelope, then every frame she has written, whether or
    // not the picture has been uploaded yet. Empty ones are kept on purpose: a
    // reserved frame is how the rest of this site shows a picture that is coming,
    // and dropping them collapsed the gallery to a single image with no strip
    // and no count — so a page of four photographs-to-be looked like a page that
    // had no gallery at all, right up until the first file landed.
    // An encounter still to come calls its picture a poster and its heading a
    // role, because on the events page and the cover strip that is what they
    // are. Filed into the archive it has a photo and a category instead. The
    // page takes either rather than making her keep two names for one thing.
    const cover = event.photo || event.poster;
    const coverAlt = event.photoAlt || event.posterAlt || event.title || "";
    const heading = event.categoria || event.rol;

    const extra = hasItems(event.fotos) ? event.fotos : [];
    const frames = [
        { src: cover, alt: coverAlt },
        ...extra,
    ];

    const when = [event.date, event.year].filter(Boolean)[0] || "";
    const where = [event.venue, event.city].filter(Boolean).join(" · ");
    const paragraphs = toLines(event.body).filter((p) => p.trim() !== "");

    return (
        <article className="band eventDetail">
            <div className="bandInner">
                <Reveal>
                    <Link className="eventDetailBack" to="/eventos">
                        ← {labels.backLabel || "Todos los encuentros"}
                    </Link>
                </Reveal>

                {/* The name of the thing goes at the top, where a name goes:
                    a page that opens on photographs makes you look at them
                    before it says what you are looking at. Everything else waits
                    until after them. The date, the place and the account are all
                    captions to the pictures and read better once they have been
                    seen — and it is also the order she will have the material
                    in, since the photographs exist the same night and the
                    account gets written later or not at all. */}
                <Reveal className="eventDetailHead">
                    {hasText(heading) && (
                        <span className="kicker">{heading}</span>
                    )}
                    <h1 className="eventDetailTitle">{event.title}</h1>
                </Reveal>

                {/* Each photograph may carry its own shape; the encounter's is
                     the fallback for the ones that do not. The mount keeps one
                     height and lets the width follow, so it does not change
                     shape as the prints are changed. */}
                <Gallery
                    frames={frames}
                    shape={event.shape}
                    label={labels.galleryLabel || "Fotos del encuentro"}
                />

                {(when || where || paragraphs.length > 0) && (
                    <Reveal className="eventDetailWords">
                        {(when || where) && (
                            <p className="eventDetailWhen">
                                {[when, where].filter(Boolean).join(" · ")}
                            </p>
                        )}

                        {paragraphs.length > 0 && (
                            <div className="eventDetailBody">
                                {paragraphs.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        )}
                    </Reveal>
                )}
            </div>
        </article>
    );
}

/* --- The route -------------------------------------------------------------
   The only part that knows where a model comes from. A caller that already has
   the encounter hands it over; anyone arriving cold — a shared link, a
   bookmark, a new tab, where router state does not survive — is resolved from
   the address instead, so a link someone passed on never opens empty. */
function EventoDetalle({ eventos = {} }) {
    const { slug } = useParams();
    const { state } = useLocation();
    const labels = (eventos.past || {}).detalle || {};
    const event = state?.evento || findEvent(eventos, slug);

    if (!event) return <EventMissing labels={labels} />;

    return <EventoPage event={event} labels={labels} />;
}

export default EventoDetalle;
