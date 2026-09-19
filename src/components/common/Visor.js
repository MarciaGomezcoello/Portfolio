import {
    createContext, useCallback, useContext, useEffect, useRef, useState,
} from "react";
import { useWords } from "./Words";
import { asset } from "../../content/site";
import useBodyLock from "./useBodyLock";
import "./Visor.css";

/* ============================================================================
   Visor — a picture, looked at properly.

   Pressing a photograph opens it here: the page dims and the print is laid out
   large on a paper mat, with its caption underneath.

   One picture at a time. It used to carry the whole band it came from and let
   you swipe between them behind a `‹ 3 / 8 ›` counter; the user asked for that
   to go — "each image should be independent in zoom". So there is nothing to
   step through, nothing to drag, and no counter: you open a picture, you look
   at it, you close it. That also means the viewer never has to be told where a
   picture sits in a list, which is why `zoom` is now one object rather than an
   array and an index.

   Why this may cover the page when a video may not. A video is set going and
   then left running while the reader carries on down the page, so a layer over
   the page destroys the thing — that is why the players on Tejidos and Arte
   open inside their own cards and always will. A photograph has no duration:
   looking at it *is* the whole interaction and it ends when the reader is
   finished.

   Nothing here reads the JSON. Each band hands over the picture it is already
   showing, in its own words, which keeps the content schema untouched — there
   is no "zoom" field for anybody to fill in or get wrong.
   ============================================================================ */

const VisorContext = createContext(null);

/* `openVisor(item)` — one `{ src, alt, caption, note }`. A band may hand over a
   picture that has not been uploaded yet; it is refused here, so a caller never
   has to check first. */
export function useVisor() {
    return useContext(VisorContext) || noop;
}

function noop() {}

export function VisorProvider({ children }) {
    const [shown, setShown] = useState(null);

    const openVisor = useCallback((item) => {
        if (!item || !asset(item.src)) return;
        setShown(item);
    }, []);

    const close = useCallback(() => setShown(null), []);

    return (
        <VisorContext.Provider value={openVisor}>
            {children}
            {shown && <Visor item={shown} onClose={close} />}
        </VisorContext.Provider>
    );
}

function Visor({ item, onClose }) {
    const words = useWords();
    const dialog = useRef(null);

    useBodyLock(true);

    // The bar steps out of the way. It paints itself from its own dusty rose
    // and carries a backdrop-filter, so under the scrim it stayed a legible
    // stripe across the top of the photograph — and a menu is not what anyone
    // opened this to look at.
    useEffect(() => {
        document.body.classList.add("hasVisor");
        return () => document.body.classList.remove("hasVisor");
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // The viewer takes focus when it opens and gives it back to whatever was
    // pressed when it closes, so a reader working by keyboard is not dropped at
    // the top of the document.
    useEffect(() => {
        const before = document.activeElement;
        if (dialog.current) dialog.current.focus();
        return () => {
            if (before && before.focus) before.focus();
        };
    }, []);

    return (
        <div
            className="visor"
            role="dialog"
            aria-modal="true"
            aria-label={item.caption || item.alt || words.photoFrame}
            tabIndex={-1}
            ref={dialog}
            /* Pressing the dark closes it, pressing the picture does not. */
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <button
                type="button"
                className="visorClose"
                onClick={onClose}
                aria-label={words.close}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </button>

            <figure className="visorFigure">
                {/* The print is mounted rather than floated on the dark: a
                    slip of paper around it, the way a photograph is matted, so
                    the viewer belongs to this site rather than being the black
                    void every gallery uses. */}
                <div className="visorMat">
                    <img
                        className="visorPrint"
                        src={asset(item.src)}
                        alt={item.alt || ""}
                        draggable="false"
                    />
                </div>

                {(item.caption || item.note) && (
                    <figcaption className="visorSay">
                        {item.caption && (
                            <span className="visorCaption">{item.caption}</span>
                        )}
                        {item.note && <span className="visorNote">{item.note}</span>}
                    </figcaption>
                )}
            </figure>
        </div>
    );
}

export default Visor;
