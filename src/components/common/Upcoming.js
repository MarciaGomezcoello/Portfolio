import { useState } from "react";
import { asset, hasText, shapeRatio, toLines, videoSource } from "../../content/site";
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

/* A short trailer for the book, played the way every video on the site is:
   its picture with the play mark over it, and pressing it starts the video
   right there, with sound — the press is what lets it play. Nothing is
   downloaded until then. Once started it keeps playing while she scrolls; the
   player's own controls pause it. A link to YouTube or Vimeo is shown in their
   player instead of the file's. */
function Trailer({ src, poster, title }) {
    const [playing, setPlaying] = useState(false);
    const source = videoSource(src);
    if (!source) return null;

    let player = null;
    if (playing && source.kind === "file") {
        player = (
            <video
                src={source.src}
                poster={asset(poster) || undefined}
                controls
                autoPlay
                playsInline
            />
        );
    } else if (playing) {
        const url = source.src.includes("?") ? `${source.src}&autoplay=1` : `${source.src}?autoplay=1`;
        player = (
            <iframe
                src={url}
                title={title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    }

    return (
        <div className="upcomingVideo">
            {player || (
                <button type="button" className="upcomingVideoOpen" onClick={() => setPlaying(true)}>
                    {hasText(poster) ? (
                        <Figure src={poster} alt="" kind="video" ratio="16 / 9" label="video" />
                    ) : null}
                    <span className="upcomingVideoPlay" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false">
                            <path d="M9 7.5 17 12l-8 4.5v-9Z" />
                        </svg>
                    </span>
                    <span className="srOnly">Ver el video de «{title || "el libro"}»</span>
                </button>
            )}
        </div>
    );
}

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

                    <Trailer src={block.video} poster={block.poster} title={block.title} />
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
