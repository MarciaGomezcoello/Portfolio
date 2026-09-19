import { useLayoutEffect, useRef, useState } from "react";
import { useWords } from "../components/common/Words";
import { Link } from "react-router-dom";
import {
    hasItems, shapeRatio, bookSlug, bookCategories, partOn, sectionOn, isNewBook,
} from "../content/site";
import Figure from "../components/common/Figure";
import { ratioStyle, useNaturalRatio } from "../components/common/naturalRatio";
import Reveal from "../components/common/Reveal";
import PageHeader from "../components/common/PageHeader";
import Upcoming from "../components/common/Upcoming";
import "./Libros.css";

/* ============================================================================
   Libros — the shelf.

   A cover for each book, and a row of shelf tabs to narrow them down by kind.
   The tabs come from whatever `categoria` values are in the JSON, so adding a
   book in a new genre grows the row on its own. Pressing a cover opens that
   book's own page.
   ============================================================================ */

function BookCard({ book, priority = false }) {
    const words = useWords();
    // The cover's own proportion once the file is known; until then the shape it
    // was filed under reserves the slot.
    const ratio = useNaturalRatio(book.cover, shapeRatio(book.shape, "print"));

    return (
        <Link
            className="shelfCard"
            to={`/libros/${bookSlug(book)}`}
            state={{ book }}
        >
            {/* Height set, width from the cover itself — see the note on the
                cover page's row. */}
            <div className="shelfSlot" style={ratioStyle(ratio)}>
                <div className="shelfCover">
                    <Figure
                        src={book.cover}
                        alt={book.title}
                        kind="book"
                        priority={priority}
                        ratio={ratio}
                        label="coverFrame"
                    />
                    <span className="bookSpine" aria-hidden="true" />
                </div>
            </div>

            <div className="shelfMeta">
                {(book.categoria || isNewBook(book)) && (
                    <span className="bookTags">
                        {book.categoria && <span className="tag">{book.categoria}</span>}
                        {isNewBook(book) && <span className="tag tagNew">{words.newBook}</span>}
                    </span>
                )}
                <h2 className="shelfTitle">{book.title}</h2>
                {book.year && <span className="shelfYear">{book.year}</span>}
                {book.tagline && <p className="shelfTagline">{book.tagline}</p>}
                <span className="shelfCta">{words.seeBook}</span>
            </div>
        </Link>
    );
}

function Libros({ libros = {} }) {
    const words = useWords();
    const items = hasItems(libros.items) ? libros.items : [];
    const categories = bookCategories(items, libros.generos);
    const allLabel = words.all;
    const [active, setActive] = useState(null);

    const shown = active
        ? items.filter((b) => (b.categoria || "").trim() === active)
        : items;

    const countFor = (name) =>
        items.filter((b) => (b.categoria || "").trim() === name).length;

    // Changing genre leaves the reader where they are. What has to be held
    // still is the row of tabs — the thing under the cursor — not the scroll
    // position, because those are not the same thing here: a shorter shelf is a
    // shorter page, and when the page shortens the browser clamps the scroll
    // and drags the reader up part of the way on its own. Holding the number
    // still would therefore still move the tabs.
    //
    // So the tab row's distance from the top of the screen is measured before
    // the change and put back after it: whatever the shelf does behind them,
    // the tabs stay under the cursor and the next genre can be picked without
    // chasing them. If the new shelf is too short to scroll that far, the page
    // gets as close as it can, which is all anything could do.
    //
    // Picking the tab that is already open does nothing at all.
    const tabsRef = useRef(null);
    const anchorRef = useRef(null);

    const chooseTab = (name) => {
        if (name === active) return;
        anchorRef.current = tabsRef.current
            ? tabsRef.current.getBoundingClientRect().top
            : null;
        setActive(name);
    };

    // Before the browser paints, so the correction is never seen as a movement.
    useLayoutEffect(() => {
        const wanted = anchorRef.current;
        anchorRef.current = null;
        if (wanted == null || !tabsRef.current) return;

        const drift = tabsRef.current.getBoundingClientRect().top - wanted;
        if (drift) window.scrollBy({ top: drift, left: 0, behavior: "instant" });
    }, [active]);

    return (
        <>
            {partOn(libros, "headVisible") && (
                <PageHeader
                    kicker={libros.kicker}
                    title={libros.title || "Libros"}
                    lead={libros.lead}
                />
            )}

            {partOn(libros, "shelfVisible") && items.length > 0 && (
                <section className="band shelfBand">
                    <div className="bandInner">
                        {/* One tab is no choice at all — only worth showing
                            once there is more than one kind of book. */}
                        {categories.length > 1 && (
                          <div ref={tabsRef}>
                            <Reveal
                                className="shelfTabs"
                                role="tablist"
                                aria-label={words.filterBooks}
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={active === null}
                                    className={`shelfTab ${active === null ? "isActive" : ""}`}
                                    onClick={() => chooseTab(null)}
                                >
                                    {allLabel}
                                    <span className="shelfTabCount">{items.length}</span>
                                </button>

                                {categories.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        role="tab"
                                        aria-selected={active === name}
                                        className={`shelfTab ${active === name ? "isActive" : ""}`}
                                        onClick={() => chooseTab(name)}
                                    >
                                        {name}
                                        <span className="shelfTabCount">{countFor(name)}</span>
                                    </button>
                                ))}
                            </Reveal>
                          </div>
                        )}

                        {/* No key on the list itself: keying it on the filter
                            rebuilt every card on every press, which reads as
                            the page reloading under you. The cards are keyed
                            one by one, so the books that stay are left alone
                            and only the arriving ones fade in.

                            The stagger stops counting after the sixth book. It
                            is meant to be a ripple across the first row or two,
                            and multiplied out over a shelf of fourteen it left
                            the last ones waiting more than a second after they
                            had scrolled into view — which reads as the page
                            being slow rather than as an effect. */}
                        <ul className="shelfGrid">
                            {shown.map((book, i) => (
                                <Reveal as="li" key={`${bookSlug(book)}-${i}`} delay={Math.min(i, 5) * 70}>
                                    {/* The first two rows are fetched at
                                        once. The widest shelf fits four across,
                                        so this covers what is on screen and the
                                        row behind it — by the time either is
                                        scrolled to, the covers are already
                                        there. The rest stay lazy, which is what
                                        keeps the page cheap for somebody who
                                        never scrolls. */}
                                    <BookCard book={book} priority={i < 8} />
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {sectionOn(libros.upcoming) && <Upcoming block={libros.upcoming} />}
        </>
    );
}

export default Libros;
