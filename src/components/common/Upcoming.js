import { hasText, shapeRatio, toLines } from "../../content/site";
import Figure from "./Figure";
import Reveal from "./Reveal";
import "./Upcoming.css";

/* ============================================================================
   Lo que viene — the books that are written but not out yet.

   Built like the poem band on the cover page: one piece of text with a picture
   beside it, at a smaller scale. It was a section heading followed by a card
   that repeated the same shape, which read as two headings for one idea; the
   text is one block now, under the kicker and title every band carries at its
   top left.
   ============================================================================ */

function Upcoming({ block = {} }) {
    if (!hasText(block.body) && !hasText(block.title)) return null;

    const paras = toLines(block.body).filter((p) => p.trim() !== "");

    return (
        <section className="band bandStrong upcomingBand">
            {hasText(block.title) && (
                <div className="bandInner">
                    <Reveal className="bandHead">
                        <div>
                            {hasText(block.kicker) && <span className="kicker">{block.kicker}</span>}
                            <h2 className="bandTitle">{block.title}</h2>
                        </div>
                    </Reveal>
                </div>
            )}
            <div className="bandInner upcomingGrid">
                <Reveal className="upcomingText">
                    {block.kicker && !hasText(block.title) && <span className="kicker">{block.kicker}</span>}

                    {paras.length > 0 && (
                        <div className="upcomingBody">
                            {paras.map((para, i) => (
                                <p className="upcomingPara" key={i}>{para}</p>
                            ))}
                        </div>
                    )}
                </Reveal>

                <Reveal className="upcomingPhoto" delay={130}>
                    <div className="upcomingCover">
                        <Figure
                            src={block.cover}
                            alt={block.photoAlt}
                            kind="book"
                            ratio={shapeRatio(block.shape, "print")}
                            label="coverFrame"
                            zoom={{
                                src: block.cover,
                                alt: block.photoAlt,
                                caption: block.title,
                            }}
                        />
                        <span className="bookSpine" aria-hidden="true" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export default Upcoming;
