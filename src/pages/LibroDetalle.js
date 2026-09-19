import { Link, useLocation, useParams } from "react-router-dom";
import { useWords } from "../components/common/Words";
import {
    findBook, shapeRatio, hasText, toLines, isNewBook,
} from "../content/site";
import Figure from "../components/common/Figure";
import Reveal from "../components/common/Reveal";
import Upcoming from "../components/common/Upcoming";
import "./LibroDetalle.css";

/* ============================================================================
   One book, on its own page.

   The cover stays beside the text while it scrolls, since the synopsis can run
   long. An address that matches no book falls back to a way out rather than a
   blank page — a mistyped link should not be a dead end.
   ============================================================================ */

/* An address that matches no book. This belongs with the routing rather than
   with the page: it is about a bad link, not about a book. */
function BookMissing() {
    const words = useWords();
    return (
        <section className="band bookMissing">
            <div className="bandInner">
                <span className="kicker">{words.missingKicker}</span>
                <h1 className="bandTitle">{words.bookMissing}</h1>
                <p className="bandLead">{words.missingText}</p>
                <Link className="btn btnSolid bookMissingCta" to="/libros">
                    {words.allBooks}
                </Link>
            </div>
        </section>
    );
}

/* --- The page --------------------------------------------------------------
   Pure: it renders the book it is handed and looks nothing up. That is what
   lets a caller pass its own copy of a book, and what will let the editing app
   show a book that has not been saved to disk yet. */
export function LibroPage({ book, labels = {}, upcoming }) {
    const words = useWords();
    const synopsis = toLines(book.synopsis).filter((p) => p.trim() !== "");

    return (
        <>
            <article className="band bookDetail">
                <div className="bandInner">
                    <Reveal>
                        <Link className="bookDetailBack" to="/libros">
                            ← {labels.backLabel || "Todos los libros"}
                        </Link>
                    </Reveal>

                    <div className="bookDetailGrid">
                        <Reveal className="bookDetailAside">
                            <div className="bookDetailCover">
                                <Figure
                                    src={book.cover}
                                    alt={book.title}
                                    kind="book"
                                    ratio={shapeRatio(book.shape, "print")}
                                    label="coverFrame"
                                    zoom={{
                                        src: book.cover,
                                        alt: book.title,
                                        caption: book.title,
                                        note: book.year,
                                    }}
                                />
                                <span className="bookSpine" aria-hidden="true" />
                            </div>

                            {hasText(book.buyUrl) && (
                                <a
                                    className="btn btnSolid bookDetailBuy"
                                    href={book.buyUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {book.buyLabel || "Comprar"}{" "}
                                    <span aria-hidden="true">↗</span>
                                </a>
                            )}
                        </Reveal>

                        <Reveal className="bookDetailBody" delay={110}>
                            <div className="bookDetailTags">
                                {book.categoria && <span className="tag">{book.categoria}</span>}
                                {isNewBook(book) && <span className="tag tagNew">{words.newBook}</span>}
                                {book.year && <span className="bookDetailYear">{book.year}</span>}
                                {book.pages && (
                                    <span className="bookDetailYear">{book.pages}</span>
                                )}
                            </div>

                            <h1 className="bookDetailTitle">{book.title}</h1>

                            {book.tagline && (
                                <p className="bookDetailTagline">{book.tagline}</p>
                            )}

                            {synopsis.length > 0 && (
                                <div className="bookDetailSection">
                                    <h2 className="bookDetailLabel">
                                        {labels.synopsisLabel || "Sinopsis"}
                                    </h2>
                                    {synopsis.map((para, i) => (
                                        <p className="bookDetailPara" key={i}>{para}</p>
                                    ))}
                                </div>
                            )}

                            {hasText(book.excerpt) && (
                                <div className="bookDetailSection">
                                    <h2 className="bookDetailLabel">
                                        {labels.excerptLabel || "Un fragmento"}
                                    </h2>
                                    <blockquote className="bookDetailExcerpt">
                                        {toLines(book.excerpt)
                                            .filter((l) => l.trim() !== "")
                                            .map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                    </blockquote>
                                </div>
                            )}
                        </Reveal>
                    </div>
                </div>
            </article>

            <Upcoming block={upcoming} />
        </>
    );
}

/* --- The route -------------------------------------------------------------
   The only part that knows where a model comes from. A caller that already has
   the book hands it over; anyone arriving cold — a shared link, a bookmark, a
   new tab, where router state does not survive — is resolved from the address
   instead, so a link someone passed on never opens an empty page. */
function LibroDetalle({ libros = {} }) {
    const { slug } = useParams();
    const { state } = useLocation();
    const book = state?.book || findBook(libros.items, slug);

    if (!book) return <BookMissing />;

    return (
        <LibroPage
            book={book}
            labels={libros.detail}
            upcoming={libros.upcoming}
        />
    );
}

export default LibroDetalle;
