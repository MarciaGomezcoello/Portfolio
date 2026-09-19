import { Link } from "react-router-dom";
import {
    hasItems, hasText, toLines, shapeRatio, sectionOn,
    bookSlug, eventSlug, videoSource, isNewBook,
} from "../../content/site";
import { useWords } from "../../components/common/Words";
import Figure from "../../components/common/Figure";
import { ratioStyle, useNaturalRatio } from "../../components/common/naturalRatio";
import Reveal from "../../components/common/Reveal";
import "./Sections.css";

/* ============================================================================
   The bands below the hero.

   The cover page samples each area rather than listing it — the navbar already
   handles navigation, so every band here ends in a way into its own tab. Each
   one returns null when its content is emptied out, so the page never shows a
   heading with nothing under it.
   ============================================================================ */

/* --- The next encounter --------------------------------------------------- */

/* Straight under the hero, because it is the only thing on this page with a
   date on it: everything below is work that will still be there next month, and
   this will not.

   The encounter is written here, in this band's own block. The cover page owns
   everything it shows, so changing a date here changes nothing on the events
   page and nothing there changes this. When the block is emptied the strip
   disappears on its own, which is the state it is in for most of any month.

   A preview, and drawn as less of the same object rather than as a different
   one. The events page gives the poster the whole left of a band, taped up and
   hanging out of true, with her part in it, the date, the title, where, and a
   paragraph about it. Here the poster is a handbill an inch or two across and
   the words are four short lines beside it — same flyer, glanced at rather than
   read, ending in the way through to the page that holds the rest. */
export function UpcomingPreview({ block = {} }) {
    if (!sectionOn(block)) return null;

    // The encounter is carried whole — the account and the photographs included,
    // even though this strip draws neither. What it draws is a summary; what it
    // hands to the encounter's own page when pressed is the entire thing, so
    // that page never has to go looking for the rest of it.
    const ev = block.evento || {};
    if (!hasText(ev.date) && !hasText(ev.title)) return null;

    const where = [ev.venue, ev.city].filter(Boolean).join(" · ");
    const when = [ev.date, ev.time].filter(Boolean).join(" · ");

    return (
        <section className="band homeNextBand">
            {hasText(block.title) && (
                <div className="bandInner">
                    <Reveal className="bandHead homeNextHead">
                        <div>
                            {hasText(block.kicker) && <span className="kicker">{block.kicker}</span>}
                            <h2 className="bandTitle">{block.title}</h2>
                        </div>
                        {/* The way through to the events page sits by the
                            heading, as "Todos los libros" does on the band below,
                            rather than out at the far end of the strip where it
                            left a hole in the middle. */}
                        {hasText(block.todosLabel) && (
                            <Link className="moreLink" to="/eventos">
                                {block.todosLabel}
                            </Link>
                        )}
                    </Reveal>
                </div>
            )}
            <Reveal className="bandInner homeNextStrip">
                <div className="homeNextHandbill">
                    <Figure
                        src={ev.poster}
                        alt={ev.posterAlt || ev.title || ""}
                        kind="event"
                        ratio={shapeRatio(ev.posterShape || ev.shape, "print")}
                        label="posterFrame"
                        zoom={{
                            src: ev.poster,
                            alt: ev.posterAlt || ev.title || "",
                            caption: ev.title,
                            note: when,
                        }}
                    />
                </div>

                <div className="homeNextWords">
                    {/* With a heading above, the kicker is already said there
                        and only her part in it is left for this line. */}
                    {hasText(block.title) ? (
                        hasText(ev.rol) && <span className="homeNextKicker">{ev.rol}</span>
                    ) : (
                        <span className="homeNextKicker">
                            {block.kicker || "Lo próximo"}
                            {hasText(ev.rol) && (
                                <span className="homeNextRole"> · {ev.rol}</span>
                            )}
                        </span>
                    )}

                    {hasText(when) && <span className="homeNextWhen">{when}</span>}

                    {hasText(ev.title) && (
                        <h2 className="homeNextTitle">{ev.title}</h2>
                    )}

                    {hasText(where) && <p className="homeNextWhere">{where}</p>}

                    {/* This encounter, in full. It belongs under its own words
                        rather than out at the end, because it is about the thing
                        those words name — and it only appears once there is a
                        page to open, so it can never lead somewhere empty. */}
                    {/* The way into this encounter's own page, over on the
                        events side. The address is worked out from the title
                        rather than typed, so there is no path to mistype; clear
                        the label and the link goes away, which is what to do for
                        an encounter that has no page of its own yet. */}
                    {hasText(block.detalleLabel) && hasText(ev.title) && (
                        <Link
                            className="moreLink homeNextDetail"
                            to={`/eventos/${eventSlug(ev)}`}
                            state={{ evento: ev }}
                        >
                            {block.detalleLabel}
                        </Link>
                    )}
                </div>

                {/* With no heading there is nowhere else for it, so it ends
                    the words instead. */}
                {!hasText(block.title) && hasText(block.todosLabel) && (
                    <Link className="moreLink homeNextLink" to="/eventos">
                        {block.todosLabel}
                    </Link>
                )}
            </Reveal>
        </section>
    );
}

/* --- Her own words ------------------------------------------------------- */

// The last word on the page. It used to sit directly under the hero; the next
// encounter has that place now, because it is the one thing here that expires.
// A line in her own voice is a better close than a way into another tab anyway
// — every band above ends in one of those.
export function QuoteBand({ quote = {} }) {
    if (!sectionOn(quote)) return null;
    if (!hasText(quote.text)) return null;

    return (
        <section className="band bandStrong quoteBand">
            {(hasText(quote.kicker) || hasText(quote.title)) && (
                <div className="bandInner">
                    <Reveal className="bandHead quoteHead">
                        <div>
                            {hasText(quote.kicker) && <span className="kicker">{quote.kicker}</span>}
                            {hasText(quote.title) && <h2 className="bandTitle">{quote.title}</h2>}
                        </div>
                    </Reveal>
                </div>
            )}
            <Reveal as="blockquote" className="bandInner quoteInner">
                <span className="quoteMark" aria-hidden="true">“</span>
                <p className="quoteText">{quote.text}</p>
                {quote.source && <cite className="quoteSource">— {quote.source}</cite>}
            </Reveal>
        </section>
    );
}

/* --- Books preview ------------------------------------------------------- */

// The cover page keeps its own short row of books rather than reading the top
// of the Libros list, so choosing what to put on the front is a decision made
// here and changing a book over there disturbs nothing. Each one still leads to
// its full page, by address — the cover page names where it is going without
// reaching into that file to find out.

/* The slot is given the height and takes its width from the cover, so a square
   cover comes out wider than a standing one and every book on the row is the
   same height. The width follows the cover's own proportion once the file is
   known, and until then the shape it was filed under. */
function BookSlot({ book }) {
    const ratio = useNaturalRatio(book.cover, shapeRatio(book.shape, "print"));

    return (
        <div className="bookCardSlot" style={ratioStyle(ratio)}>
            <div className="bookCardCover">
                <Figure
                    src={book.cover}
                    alt={book.title}
                    kind="book"
                    ratio={ratio}
                    label="coverFrame"
                />
                {/* A printed spine down the left edge. */}
                <span className="bookSpine" aria-hidden="true" />
            </div>
        </div>
    );
}

export function BooksPreview({ block = {} }) {
    const words = useWords();
    if (!sectionOn(block)) return null;

    const items = hasItems(block.items) ? block.items : [];
    if (!items.length) return null;

    return (
        <section className="band booksBand">
            <div className="bandInner">
                <Reveal className="bandHead">
                    <div>
                        {block.kicker && <span className="kicker">{block.kicker}</span>}
                        <h2 className="bandTitle">{block.title || "Libros"}</h2>
                        {block.lead && <p className="bandLead">{block.lead}</p>}
                    </div>
                    {hasText(block.linkLabel) && (
                        <Link className="moreLink" to="/libros">
                            {block.linkLabel}
                        </Link>
                    )}
                </Reveal>

                <ul className="bookRow">
                    {items.map((book, i) => (
                        <Reveal as="li" className="bookCard" key={i} delay={i * 110}>
                            <Link
                                className="bookCardLink"
                                to={`/libros/${bookSlug(book)}`}
                                state={{ book }}
                            >
                                <BookSlot book={book} />
                                <div className="bookCardMeta">
                                    {(book.categoria || isNewBook(book)) && (
                                        <span className="bookTags">
                                            {book.categoria && (
                                                <span className="tag">{book.categoria}</span>
                                            )}
                                            {isNewBook(book) && (
                                                <span className="tag tagNew">{words.newBook}</span>
                                            )}
                                        </span>
                                    )}
                                    <h3 className="bookCardTitle">{book.title}</h3>
                                    {book.year && <span className="bookCardYear">{book.year}</span>}
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* --- A poem, printed in full -------------------------------------------- */

export function PoemFeature({ poem = {} }) {
    if (!sectionOn(poem)) return null;
    if (!hasText(poem.body) && !hasText(poem.title)) return null;

    const lines = toLines(poem.body);

    return (
        <section className="band poemBand">
            {hasText(poem.heading) && (
                <div className="bandInner">
                    <Reveal className="bandHead">
                        <div>
                            {hasText(poem.kicker) && <span className="kicker">{poem.kicker}</span>}
                            <h2 className="bandTitle">{poem.heading}</h2>
                        </div>
                    </Reveal>
                </div>
            )}
            <div className="bandInner poemGrid">
                <Reveal className="poemText">
                    {poem.kicker && !hasText(poem.heading) && <span className="kicker">{poem.kicker}</span>}
                    {poem.title && <h2 className="poemTitle">{poem.title}</h2>}

                    {lines.length > 0 && (
                        <div className="poemBody">
                            {lines.map((line, i) =>
                                line.trim() === "" ? (
                                    <span className="poemGap" key={i} aria-hidden="true" />
                                ) : (
                                    <p className="poemLine" key={i}>{line}</p>
                                )
                            )}
                        </div>
                    )}

                    {poem.attribution && (
                        <p className="poemAttribution">{poem.attribution}</p>
                    )}
                    {hasText(poem.linkLabel) && (
                        <Link className="moreLink" to="/arte">
                            {poem.linkLabel}
                        </Link>
                    )}
                </Reveal>

                <Reveal className="poemPhoto" delay={140}>
                    <Figure
                        src={poem.photo}
                        alt={poem.photoAlt}
                        kind="poem"
                        ratio={shapeRatio(poem.photoShape, "print")}
                        label="photoFrame"
                        zoom={{ src: poem.photo, alt: poem.photoAlt }}
                    />
                </Reveal>
            </div>
        </section>
    );
}

/* --- The two channels ---------------------------------------------------- */

export function TejidosPreview({ block = {} }) {
    if (!sectionOn(block)) return null;

    const channels = hasItems(block.channels) ? block.channels : [];
    // Either a link to a player elsewhere or a file she dropped into
    // `public/content/` — the same contract every other video field keeps.
    const source = videoSource(block.video);
    if (!channels.length && !hasText(block.text)) return null;

    return (
        <section className="band tejidosBand">
            <div className="bandInner">
                <div className="tejidosGrid">
                    <Reveal className="tejidosText">
                        {block.kicker && <span className="kicker">{block.kicker}</span>}
                        <h2 className="bandTitle">{block.title || "Tejidos"}</h2>
                        {block.text && <p className="bandLead">{block.text}</p>}

                        {channels.length > 0 && (
                            <ul className="channelList">
                                {channels.map((ch, i) => (
                                    <li key={i}>
                                        <a
                                            className="channelCard"
                                            href={ch.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {hasText(ch.logo) ? (
                                                <span className="channelLogo">
                                                    <Figure
                                                        src={ch.logo}
                                                        alt={ch.logoAlt || ch.name || ""}
                                                        kind="yarn"
                                                        ratio="1 / 1"
                                                        label={ch.short}
                                                    />
                                                </span>
                                            ) : (
                                                <span className="channelPlay" aria-hidden="true">▶</span>
                                            )}
                                            <span className="channelBody">
                                                <span className="channelName">
                                                    {ch.short || ch.name}
                                                </span>
                                            </span>
                                            <span className="channelArrow" aria-hidden="true">→</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {hasText(block.linkLabel) && (
                            <Link className="moreLink tejidosMore" to="/tejidos">
                                {block.linkLabel}
                            </Link>
                        )}
                    </Reveal>

                    <Reveal className="tejidosMedia" delay={140}>
                        {source ? (
                            <div className="videoFrame">
                                {source.kind === "file" ? (
                                    <video src={source.src} controls playsInline />
                                ) : (
                                    <iframe
                                        src={source.src}
                                        title={block.videoLabel || "Video"}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                )}
                            </div>
                        ) : (
                            <Figure kind="video" ratio="16 / 10" label={block.videoLabel} />
                        )}
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

