import { useState } from "react";
import { Link } from "react-router-dom";
import {
    hasItems, hasText, toLines, poemSlug, videoSource, shapeRatio, partOn, sectionOn,
} from "../content/site";
import { useWords } from "../components/common/Words";
import Figure from "../components/common/Figure";
import Reveal from "../components/common/Reveal";
import PageHeader from "../components/common/PageHeader";
import "./Arte.css";

/* ============================================================================
   Arte — the poems, and the songs underneath them.

   Two halves of the same habit: words written to be said out loud. The poems
   are set as the contents page of a book; the songs below them as a track
   listing, which is a different object and is drawn as one.

   The page carries no masthead of its own. Its two sections head themselves,
   which is why they are equals here rather than one page about poems with
   songs appended to it.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   The poems.

   Each poem is an entry — its illustration beside the title, the source, and
   the opening line or two — and the entries are set two to a row, divided by
   hairlines and numbered in order. Books are objects standing on a shelf and
   are laid out that way; a poem is a page in a sequence, so this reads as a
   contents page rather than a rack of covers.

   There is no cap and no filter: it simply grows as poems are added, wrapping
   to one column on a narrow screen, and the order of the JSON list is the
   order on the page and through the previous/next links.
   ---------------------------------------------------------------------------- */

// The opening couplet: the first line or two of the first stanza, whichever
// the poem has. Shown as an epigraph — the poem is never cut off mid-stanza,
// which is why this stops at the stanza break rather than after N lines.
function opening(body, max = 2) {
    const lines = [];
    for (const line of toLines(body)) {
        if (line.trim() === "") {
            if (lines.length > 0) break;
            continue;
        }
        lines.push(line);
        if (lines.length === max) break;
    }
    return lines;
}

function PoemEntry({ poem, index }) {
    const words = useWords();
    // Her own preview when she has written one; otherwise the opening lines.
    const lines = hasText(poem.preview)
        ? toLines(poem.preview).filter((line) => line.trim() !== "")
        : opening(poem.body);

    return (
        <Link
            className="poemEntry"
            to={`/arte/${poemSlug(poem)}`}
            state={{ poem }}
        >
            <div className="poemEntryArt">
                {/* Every illustration in this list stands, whatever shape the
                    poem carries: the entries are read as a column of pairs and
                    a lying picture among standing ones broke the line they sit
                    on. The poem's own `shape` still sets the picture on its own
                    page. */}
                <Figure
                    src={poem.photo}
                    alt={poem.photoAlt || poem.title || ""}
                    kind="poem"
                    ratio={shapeRatio("alto")}
                    label="illustration"
                />
            </div>

            <div className="poemEntryText">
                <span className="poemEntryNum" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                </span>

                {poem.title && <h3 className="poemEntryTitle">{poem.title}</h3>}

                {(poem.source || poem.year) && (
                    <span className="poemEntrySource">
                        {[poem.source, poem.year].filter(Boolean).join(" · ")}
                    </span>
                )}

                {lines.length > 0 && (
                    <div className="poemEntryOpening">
                        {lines.map((line, i) => (
                            <p className="poemEntryLine" key={i}>{line}</p>
                        ))}
                    </div>
                )}

                <span className="poemEntryCta">{words.readPoem}</span>
            </div>
        </Link>
    );
}

/* ----------------------------------------------------------------------------
   The songs.

   A wall of sleeves. Each song is a record sleeve — its picture matted in card
   paper behind a gold hairline, the title and the line about it set on the open
   band below — and pressing one plays it right there in the mat.

   The knitting videos on Tejidos work the same way, and deliberately so: it is
   the gesture that suits a page of videos, and a page of songs costs no players
   until one is asked for. But a sleeve is not a card. Those are closed boxes
   with the photograph bled to their edges and a rose badge stood on its corner;
   these are open — matted, gold-ruled, their words sitting on the band's own
   paper — and the mark over them is a record, not a diamond. Same mechanic,
   different object.

   The frame is 16:9, the shape a video actually is, so playing one fills the
   mat exactly. It was square once, which cost the picture more than it looked:
   a square that tiles five across is around 220px, and a wide video inside one
   came out roughly 210 by 118 — smaller than the player's own title, volume and
   captions marks, which are drawn at their usual size whatever the frame.

   It is auto-filled and uncapped, so four songs and forty lay out the same way,
   and one plays at a time.
   ---------------------------------------------------------------------------- */

// Play as soon as it is asked for — the press is the gesture that permits it,
// so nobody has to press play twice.
function withAutoplay(url) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

// Whatever the song turned out to be: an uploaded file gets the browser's own
// player, a link gets an embed frame. Nothing here assumes YouTube.
function SongPlayer({ song, source }) {
    if (source.kind === "file") {
        return (
            <video
                className="songVideo"
                src={source.src}
                title={song.title || "Canción"}
                controls
                autoPlay
                playsInline
            />
        );
    }

    return (
        <iframe
            className="songVideo"
            src={withAutoplay(source.src)}
            title={song.title || "Canción"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
}

function SongSleeve({ song, playing, onPlay }) {
    const source = videoSource(song.video);

    const sleeve = (
        <>
            <span className="songSleeveMedia">
                <Figure
                    src={song.photo}
                    alt={song.photoAlt || song.title || ""}
                    kind="music"
                    ratio="16 / 9"
                    label={song.title || "Canción"}
                />
            </span>

            {/* A record rather than the diamond the knitting cards use: a disc
                with its label ring and centre hole, and the triangle across it
                so it still reads as "press me". */}
            {source && (
                <span className="songSleevePlay" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <circle className="songSleeveDisc" cx="12" cy="12" r="11" />
                        <circle className="songSleeveGroove" cx="12" cy="12" r="7.4" />
                        <path className="songSleeveArrow" d="M10 8.4 15.4 12 10 15.6v-7.2Z" />
                    </svg>
                </span>
            )}
        </>
    );

    return (
        <div className={`songSleeve ${source ? "" : "isSilent"}`}>
            <div className="songSleeveMat">
                {playing && source ? (
                    <SongPlayer song={song} source={source} />
                ) : source ? (
                    <button
                        type="button"
                        className="songSleeveOpen"
                        onClick={onPlay}
                    >
                        {sleeve}
                        <span className="srOnly">
                            Escuchar «{song.title || "la canción"}»
                        </span>
                    </button>
                ) : (
                    /* A song with no recording yet keeps its sleeve and its
                       title, and simply does not offer to play — no promise it
                       cannot keep. It becomes playable the day a link goes in
                       its `video`, with no other change here. */
                    <span className="songSleeveOpen">{sleeve}</span>
                )}
            </div>

            <div className="songSleeveText">
                {hasText(song.title) && (
                    <h3 className="songSleeveTitle">{song.title}</h3>
                )}
                {hasText(song.year) && (
                    <span className="songSleeveYear">{song.year}</span>
                )}
                {hasText(song.note) && (
                    <p className="songSleeveNote">{song.note}</p>
                )}
            </div>
        </div>
    );
}

function Songs({ songs = {} }) {
    const items = hasItems(songs.items) ? songs.items : [];
    // One at a time: starting a song stops whatever was going, so the page
    // never has two of her voices at once.
    const [playing, setPlaying] = useState(null);

    if (!sectionOn(songs) || items.length === 0) return null;

    return (
        <section className="band songsBand">
            <div className="bandInner">
                <Reveal className="bandHead">
                    <div>
                        {hasText(songs.kicker) && (
                            <span className="kicker">{songs.kicker}</span>
                        )}
                        <h2 className="bandTitle">
                            {songs.title || "Canciones"}
                        </h2>
                        {hasText(songs.lead) && (
                            <p className="bandLead">{songs.lead}</p>
                        )}
                    </div>
                </Reveal>

                <ul className="songWall">
                    {items.map((song, i) => (
                        <Reveal as="li" key={i} delay={Math.min(i, 5) * 70}>
                            <SongSleeve
                                song={song}
                                playing={playing === i}
                                onPlay={() => setPlaying(i)}
                            />
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Arte({ arte = {} }) {
    const poems = arte.poems || {};
    const items = hasItems(poems.items) ? poems.items : [];

    return (
        <>
            {partOn(arte, "headVisible") && hasText(arte.title) && (
                <PageHeader kicker={arte.kicker} title={arte.title} lead={arte.lead} />
            )}

            {sectionOn(poems) && items.length > 0 && (
                <section className="band poemsBand">
                    <div className="bandInner">
                        <Reveal className="bandHead">
                            <div>
                                {hasText(poems.kicker) && (
                                    <span className="kicker">{poems.kicker}</span>
                                )}
                                <h2 className="bandTitle">
                                    {poems.title || "Poemas"}
                                </h2>
                                {hasText(poems.lead) && (
                                    <p className="bandLead">{poems.lead}</p>
                                )}
                            </div>
                        </Reveal>

                        <ul className="poemIndex">
                            {items.map((poem, i) => (
                                <Reveal
                                    as="li"
                                    className="poemIndexRow"
                                    key={`${poemSlug(poem)}-${i}`}
                                    delay={(i % 2) * 90}
                                >
                                    <PoemEntry poem={poem} index={i} />
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <Songs songs={arte.songs} />
        </>
    );
}

export default Arte;
