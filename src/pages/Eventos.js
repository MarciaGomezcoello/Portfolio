import { useState } from "react";
import { useWords } from "../components/common/Words";
import { Link } from "react-router-dom";
import {
    hasItems, hasText, eventCategories, eventSlug, eventHasPage,
    shapeRatio, partOn, sectionOn,
} from "../content/site";
import Figure from "../components/common/Figure";
import Reveal from "../components/common/Reveal";
import PageHeader from "../components/common/PageHeader";
import "./Eventos.css";

/* ============================================================================
   Eventos.

   Not a page about TARLITEART. She runs that series, but she is also invited to
   other people's evenings and presents at them, so the page is about encounters
   in general and TARLITEART is simply most of what the archive holds.

   Two things, in this order: the next one, and everything before it. The page
   still survives having no next date — that band disappears whole rather than
   sitting there empty, which is the state it is in most of the month, and the
   archive carries the page on its own.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   The next one.

   An event announces itself with a poster, so the poster is the object: taped up
   at its corners and hanging very slightly out of true, the way a flyer does on
   a library noticeboard. It straightens when pointed at.

   The poster is never cropped. A flyer is mostly type, and a frame that fills
   itself by cropping would cut the date off the bottom of one and the title off
   the top of another — so whatever shape she uploads is fitted inside the
   reserved frame rather than made to fill it. Letterboxing beats losing the
   words, the same choice the video players on this site already make.

   Beside it the details are set as type on the page, not in a panel: her part in
   it, the date, the title, where, and a line about it. `rol` is whatever she
   writes — "Organiza" for her own evenings, "Invitada" for somebody else's —
   which is the one thing this page could not work out for itself.
   ---------------------------------------------------------------------------- */

function UpcomingEvent({ event, labels, kicker, title }) {
    const where = [event.venue, event.city].filter(Boolean).join(" · ");
    const when = [event.date, event.time].filter(Boolean).join(" · ");

    return (
        <section className="band nextBand">
            {(hasText(kicker) || hasText(title)) && (
                <div className="bandInner">
                    <Reveal className="bandHead">
                        <div>
                            {hasText(kicker) && <span className="kicker">{kicker}</span>}
                            {hasText(title) && <h2 className="bandTitle">{title}</h2>}
                        </div>
                    </Reveal>
                </div>
            )}
            <div className="bandInner nextInner">
                <Reveal className="nextPoster">
                    <div className="nextPosterSheet">
                        <span className="nextTape nextTapeLeft" aria-hidden="true" />
                        <span className="nextTape nextTapeRight" aria-hidden="true" />
                        <Figure
                            src={event.poster}
                            alt={event.posterAlt || event.title || ""}
                            kind="event"
                            ratio={shapeRatio(event.posterShape || event.shape, "print")}
                            label="posterFrame"
                            priority
                            zoom={{
                                src: event.poster,
                                alt: event.posterAlt || event.title || "",
                                caption: event.title,
                                note: [when, where].filter(Boolean).join(" · "),
                            }}
                        />
                    </div>
                </Reveal>

                <Reveal className="nextDetails" delay={110}>
                    {hasText(event.rol) && (
                        <span className="nextRole">{event.rol}</span>
                    )}

                    {hasText(when) && <span className="nextWhen">{when}</span>}

                    {hasText(event.title) && (
                        <h2 className="nextTitle">{event.title}</h2>
                    )}

                    {hasText(where) && <p className="nextWhere">{where}</p>}

                    {hasText(event.note) && (
                        <p className="nextNote">{event.note}</p>
                    )}

                    <div className="nextActions">
                        {/* The way into this encounter's own page. It was
                            reachable from the cover strip but not from here,
                            which left the page carrying the fullest version of
                            an encounter as the one place with no way to open
                            it. Shown only once there is a page to open. */}
                        {eventHasPage(event) && (
                            <Link
                                className="btn btnSolid nextCta"
                                to={`/eventos/${eventSlug(event)}`}
                                state={{ evento: event }}
                            >
                                {labels.detalleLabel || "Ver el encuentro"}
                            </Link>
                        )}

                        {/* Her own link, if she has added one — a ticket page,
                            the library's listing, wherever she wants to send
                            people. */}
                        {hasText(event.linkUrl) && hasText(event.linkLabel) && (
                            <a
                                className="moreLink nextMore"
                                href={event.linkUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {event.linkLabel}
                            </a>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ----------------------------------------------------------------------------
   The archive, and the hand that sorts it.

   TARLITEART has run at the Corona Library every month since 2019, so the
   archive is the largest thing on the page and the only one that needs sorting.
   An earlier version gave it filing-cabinet tabs over a panel; card stock, tabs
   and a boxed drawer add up to a spreadsheet however they are drawn, and a
   spreadsheet is the wrong object for a literary afternoon.

   So there is no control here at all — only writing. The kinds of encounter are
   set as a line of words in the display face, each with its count raised beside
   it like a footnote marker, divided by thread-gold hairlines. The one being
   read is underlined in rose ink, and the line is a drawn stroke rather than a
   border: it wavers the way a pen does, and it draws itself across the word when
   the word is chosen. Nothing is boxed, nothing is shaded, and there is no panel
   underneath — the entries simply sit on the page, as they did before.

   That also settles the other half of the problem. The books page filters with
   pills, and pills are chrome; this is type, marked in ink. There is no risk of
   reading the two as the same control because this one does not look like a
   control.

   The words come from the data. Whatever `categoria` values she writes across the
   archive become the line, in the order they first appear, so a new kind of
   encounter files itself. Below two kinds there is nothing to sort, so the line
   does not appear at all.
   ---------------------------------------------------------------------------- */

/* One wavering stroke, stretched to whatever word it sits under. The viewBox is
   ignored horizontally (`preserveAspectRatio="none"`), so a short word and a
   long one get the same drawn line rather than the same line squeezed. */
function InkRule() {
    return (
        <svg
            className="indexInk"
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M1.5 4.3 C 20 1.9, 33 5.4, 51 3.3 S 82 1.7, 98.5 3.9" />
        </svg>
    );
}

function ArchiveEntry({ ev }) {
    // An encounter with a page of its own is a doorway and stays one: the
    // photograph goes to that page, where the whole gallery is. One that has no
    // page has nowhere to send anybody, so there its photograph opens instead
    // of doing nothing at all.
    const linked = eventHasPage(ev);

    const inside = (
        <>
            <div className="archiveImg">
                {/* The gentle set, not the print set. A photograph in the
                     archive sits in a line beside two others in different
                     shapes, and at 3:2 against 2:3 one card came out well over
                     twice the height of its neighbour — the same complaint the
                     knitting gallery settled long ago. These three are within
                     about a fifth of each other. */}
                <Figure
                    src={ev.photo}
                    alt={ev.photoAlt || ev.title || ""}
                    kind="event"
                    ratio={shapeRatio(ev.shape)}
                    label="photoFrame"
                    zoom={linked ? undefined : {
                        src: ev.photo,
                        alt: ev.photoAlt || ev.title || "",
                        caption: ev.title,
                        note: [ev.year, ev.venue, ev.city].filter(Boolean).join(" · "),
                    }}
                />
            </div>
            <div className="archiveMeta">
                {ev.year && <span className="archiveYear">{ev.year}</span>}
                {ev.title && <h3 className="archiveTitle">{ev.title}</h3>}
                <span className="archiveWhere">
                    {[ev.venue, ev.city].filter(Boolean).join(" · ")}
                </span>
            </div>
        </>
    );

    if (!linked) return <div className="archiveEntry">{inside}</div>;

    return (
        <Link
            className="archiveEntry hasPage"
            to={`/eventos/${eventSlug(ev)}`}
            state={{ evento: ev }}
        >
            {inside}
        </Link>
    );
}

function ArchiveIndex({ past, items }) {
    const words = useWords();
    const categories = eventCategories(items, past.categorias);
    const allLabel = words.all;
    const [active, setActive] = useState(null);

    const shown = active
        ? items.filter((ev) => (ev.categoria || "").trim() === active)
        : items;

    const countFor = (name) =>
        items.filter((ev) => (ev.categoria || "").trim() === name).length;

    // Her own line for whichever word is being read. The list is optional and
    // may name only some of the classes, or none: a class she has not written
    // about simply shows no line. Matched on the written name rather than on
    // position, so reordering the encounters cannot shuffle the wrong text
    // under the wrong word.
    const noteFor = (name) => {
        if (name === null) return past.lead;
        const written = hasItems(past.categorias) ? past.categorias : [];
        const found = written.find(
            (c) => (c.nombre || "").trim() === name
        );
        return found ? found.texto : "";
    };

    // The years the shown encounters span, which needs nothing written and
    // cannot go stale. Numerals only — there is no word here to translate and
    // nothing to pluralise, and the tally is already raised beside the word.
    const spanOf = (list) => {
        const years = list
            .map((ev) => parseInt(String(ev.year || "").trim(), 10))
            .filter((y) => !Number.isNaN(y));
        if (years.length === 0) return "";
        const first = Math.min(...years);
        const last = Math.max(...years);
        return first === last ? String(first) : `${first} — ${last}`;
    };

    const note = noteFor(active);
    const span = spanOf(shown);

    const word = (name, label, count) => (
        <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active === name}
            className={`indexWord ${active === name ? "isRead" : ""}`}
            onClick={() => setActive(name)}
        >
            <span className="indexWordText">{label}</span>
            <sup className="indexWordCount">{count}</sup>
            <InkRule />
        </button>
    );

    return (
        <section className="band archiveBand">
            <div className="bandInner">
                <Reveal className="bandHead">
                    <div>
                        {hasText(past.kicker) && <span className="kicker">{past.kicker}</span>}
                        <h2 className="bandTitle">{past.title || "Del archivo"}</h2>
                    </div>
                </Reveal>

                {/* One kind of encounter is nothing to sort. */}
                {categories.length > 1 && (
                    <Reveal
                        className="indexLine"
                        role="tablist"
                        aria-label={words.filterEvents}
                    >
                        {word(null, allLabel, items.length)}
                        {categories.map((name) => word(name, name, countFor(name)))}
                    </Reveal>
                )}

                {/* What the chosen word is about. Set as a standfirst — the
                    span of years in small caps over a line of her prose — so
                    picking a word answers with something to read rather than
                    only re-dealing the pictures. Both halves are optional and
                    the block disappears when there is neither. */}
                {(hasText(note) || span !== "") && (
                    <Reveal className="archiveNote" key={active || "todos"}>
                        {span !== "" && (
                            <span className="archiveNoteSpan">{span}</span>
                        )}
                        {hasText(note) && (
                            <p className="archiveNoteText">{note}</p>
                        )}
                    </Reveal>
                )}

                {/* No key on the list: rebuilding every card on every press reads
                    as the page reloading, so the entries that stay are left alone
                    and only the arriving ones fade in. */}
                <ul className="archiveGrid">
                    {shown.map((ev, i) => (
                        <Reveal
                            as="li"
                            className="archiveCard"
                            key={`${ev.title || "ficha"}-${ev.year || ""}`}
                            delay={Math.min(i, 5) * 80}
                        >
                            {/* An encounter with an account or photographs of
                                its own opens; one with neither stays a card, so
                                a link never leads to its own title repeated. */}
                            <ArchiveEntry ev={ev} />
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Eventos({ eventos = {} }) {
    const upcoming = eventos.upcoming || {};
    const showUpcoming = sectionOn(upcoming) && (hasText(upcoming.date) || hasText(upcoming.title));
    const past = eventos.past || {};
    const pastItems = hasItems(past.items) ? past.items : [];

    return (
        <>
            {partOn(eventos, "headVisible") && (
                <PageHeader
                    kicker={eventos.kicker}
                    title={eventos.title || "Eventos"}
                    subtitle={eventos.subtitle}
                    lead={eventos.lead}
                />
            )}

            {showUpcoming && (
                <UpcomingEvent
                    event={upcoming}
                    labels={past.detalle || {}}
                    kicker={eventos.upcomingKicker}
                    title={eventos.upcomingTitle}
                />
            )}

            {sectionOn(past) && pastItems.length > 0 && (
                <ArchiveIndex past={past} items={pastItems} />
            )}
        </>
    );
}

export default Eventos;
