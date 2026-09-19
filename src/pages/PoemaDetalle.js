import { Link, useLocation, useParams } from "react-router-dom";
import { useWords } from "../components/common/Words";
import {
    hasItems, toLines, poemSlug, shapeRatio,
} from "../content/site";
import Figure from "../components/common/Figure";
import Reveal from "../components/common/Reveal";
import "./PoemaDetalle.css";

/* ============================================================================
   One poem, on its own page.

   The verse is set centred as a capped block with its picture out to the side,
   the same arrangement as the poem band on the cover page but given a whole
   screen. Previous and next follow the order of the list, so a book of poems
   can be read straight through instead of returning to the index each time.

   An address that matches no poem falls back to a way out rather than a blank
   page — a mistyped link should not be a dead end.
   ============================================================================ */

/* An address that matches no poem. This belongs with the routing rather than
   with the page: it is about a bad link, not about a poem. */
function PoemMissing() {
    const words = useWords();
    return (
        <section className="band poemMissing">
            <div className="bandInner">
                <span className="kicker">{words.missingKicker}</span>
                <h1 className="bandTitle">{words.poemMissing}</h1>
                <p className="bandLead">{words.missingText}</p>
                <Link className="btn btnSolid poemMissingCta" to="/arte">
                    {words.allPoems}
                </Link>
            </div>
        </section>
    );
}

/* --- The page --------------------------------------------------------------
   Pure: it renders the poem it is handed, with whatever neighbours it is given
   for the way through. It looks nothing up. */
export function PoemaPage({ poem, previous, next, labels = {} }) {
    const words = useWords();
    const lines = toLines(poem.body);

    return (
        <article className="band poemPage">
            <div className="bandInner">
                <Reveal>
                    <Link className="poemPageBack" to="/arte">
                        ← {labels.backLabel || "Todos los poemas"}
                    </Link>
                </Reveal>

                <div className="poemPageGrid">
                    <Reveal className="poemPageMain">
                        <div className="poemPageText">
                            {(poem.source || poem.year) && (
                                <span className="kicker">
                                    {[poem.source, poem.year].filter(Boolean).join(" · ")}
                                </span>
                            )}

                            {poem.title && (
                                <h1 className="poemPageTitle">{poem.title}</h1>
                            )}

                            {lines.length > 0 && (
                                <div className="poemPageVerse">
                                    {lines.map((line, i) =>
                                        line.trim() === "" ? (
                                            <span
                                                className="poemPageGap"
                                                key={i}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <p className="poemPageLine" key={i}>
                                                {line}
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </Reveal>

                    <Reveal className="poemPageArt" delay={140}>
                        <Figure
                            src={poem.photo}
                            alt={poem.photoAlt || poem.title || ""}
                            kind="poem"
                            ratio={shapeRatio(poem.shape)}
                            label="illustration"
                            zoom={{
                                src: poem.photo,
                                alt: poem.photoAlt || poem.title || "",
                                caption: poem.title,
                            }}
                        />
                    </Reveal>
                </div>

                {/* Only worth a row once there is somewhere to go. */}
                {(previous || next) && (
                    <Reveal as="nav" className="poemPageNav" aria-label={words.morePoems}>
                        {previous ? (
                            <Link
                                className="poemPageStep isPrev"
                                to={`/arte/${poemSlug(previous)}`}
                                state={{ poem: previous }}
                            >
                                <span className="poemPageStepLabel">
                                    ← {labels.prevLabel || "Anterior"}
                                </span>
                                <span className="poemPageStepTitle">
                                    {previous.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}

                        {next && (
                            <Link
                                className="poemPageStep isNext"
                                to={`/arte/${poemSlug(next)}`}
                                state={{ poem: next }}
                            >
                                <span className="poemPageStepLabel">
                                    {labels.nextLabel || "Siguiente"} →
                                </span>
                                <span className="poemPageStepTitle">{next.title}</span>
                            </Link>
                        )}
                    </Reveal>
                )}
            </div>
        </article>
    );
}

/* --- The route -------------------------------------------------------------
   The only part that knows where a model comes from. A caller that already has
   the poem hands it over; anyone arriving cold — a shared link, a bookmark, a
   new tab, where router state does not survive — is resolved from the address
   instead. The neighbours are worked out here too, since they are a fact about
   the list rather than about the poem. */
function PoemaDetalle({ arte = {} }) {
    const { slug } = useParams();
    const { state } = useLocation();
    const poems = arte.poems || {};
    const items = hasItems(poems.items) ? poems.items : [];

    const index = items.findIndex((p) => poemSlug(p) === slug);
    const poem = state?.poem || (index >= 0 ? items[index] : null);

    if (!poem) return <PoemMissing />;

    return (
        <PoemaPage
            poem={poem}
            previous={index > 0 ? items[index - 1] : null}
            next={index >= 0 && index < items.length - 1 ? items[index + 1] : null}
            labels={poems.detail}
        />
    );
}

export default PoemaDetalle;
