import "./Placeholder.css";
import { useWords } from "./Words";

/* ============================================================================
   Placeholder — the empty box that stands in for a photo.

   Every image on the site is optional. Until Marcia drops a real file into
   `public/content/`, this renders instead: a soft paper panel with a woven
   thread texture and a thin-line glyph that says what *kind* of picture
   belongs there. It is meant to look deliberate — a reserved frame — rather
   than a broken image.

   `kind` picks the glyph; `ratio` reserves the shape so nothing reflows when
   a real photo eventually replaces it.
   ============================================================================ */

const GLYPHS = {
    // An open book.
    book: (
        <g>
            <path d="M4 8c5-3 11-3 16 0v26c-5-3-11-3-16 0V8Z" />
            <path d="M44 8c-5-3-11-3-16 0v26c5-3 11-3 16 0V8Z" />
            <path d="M24 8v26" />
        </g>
    ),
    // A portrait bust.
    portrait: (
        <g>
            <circle cx="24" cy="17" r="8" />
            <path d="M9 40c1.5-8 7.5-12 15-12s13.5 4 15 12" />
        </g>
    ),
    // Quote marks for a poem.
    poem: (
        <g>
            <path d="M10 28c-3 0-5-2-5-5s2-5 5-5 5 2 5 5c0 6-3 10-8 13" />
            <path d="M32 28c-3 0-5-2-5-5s2-5 5-5 5 2 5 5c0 6-3 10-8 13" />
        </g>
    ),
    // A play triangle in a frame.
    video: (
        <g>
            <rect x="5" y="11" width="38" height="26" rx="4" />
            <path d="M20 19.5 30 24l-10 4.5V19.5Z" />
        </g>
    ),
    // A microphone for an event / recital.
    event: (
        <g>
            <rect x="19" y="7" width="10" height="18" rx="5" />
            <path d="M13 22a11 11 0 0 0 22 0" />
            <path d="M24 33v8M18 41h12" />
        </g>
    ),
    // A ball of yarn with a trailing thread.
    yarn: (
        <g>
            <circle cx="21" cy="22" r="13" />
            <path d="M12 13c6 4 11 10 13 18M30 13c-6 4-11 10-13 18M8.5 25c8-1 15-5 19-11" />
            <path d="M32 31c5 2 7 5 8 10" />
        </g>
    ),
    // A medal on its ribbons.
    award: (
        <g>
            <circle cx="24" cy="18" r="10" />
            <path d="M17 26 12 43l12-5.5L36 43l-5-17" />
        </g>
    ),
    // A musical note.
    music: (
        <g>
            <path d="M19 33V11l19-4v22" />
            <circle cx="14" cy="34" r="5" />
            <circle cx="33" cy="30" r="5" />
        </g>
    ),
};

function Placeholder({ kind = "portrait", ratio = "4 / 5", label, className = "" }) {
    const glyph = GLYPHS[kind] || GLYPHS.portrait;
    // `label` names a word in the site's "ui" block ("poster", "cover"…); any
    // other text is shown as it is.
    const words = useWords();
    const text = label ? words[label] ?? label : "";

    return (
        <div
            className={`ph ph-${kind} ${className}`}
            style={{ aspectRatio: ratio }}
            role="img"
            aria-label={text || words.reserved}
        >
            <svg className="phGlyph" viewBox="0 0 48 48" aria-hidden="true">
                {glyph}
            </svg>
            {text && <span className="phLabel">{text}</span>}
        </div>
    );
}

export default Placeholder;
