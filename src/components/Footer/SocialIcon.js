/* ============================================================================
   The little marks beside the accounts in the footer.

   Drawn in the same hand as the placeholder glyphs — thin line, no fill,
   round caps, inheriting the colour of the link they sit beside — rather than
   the flat brand logos, which would be the only pieces of somebody else's
   design language on the page. They are stylised, not reproductions: enough to
   sort a list of seven at a glance, which is all a footer icon is for.

   The name is a value in the JSON, so a new account picks its own mark from a
   short list of words. Anything unrecognised, or missing, gets the globe — an
   account still reads correctly with a generic mark, and no editor can produce
   a broken one.
   ============================================================================ */

const GLYPHS = {
    // A screen and a play triangle.
    youtube: (
        <>
            <rect x="2.5" y="5.5" width="19" height="13" rx="4.5" />
            <path d="M10.6 9.6l5.2 2.9-5.2 2.9z" />
        </>
    ),

    // An f, in the rounded square the others share.
    facebook: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <path d="M14.3 8.4h-1.1c-1 0-1.6.6-1.6 1.6v5.6M10.1 11.9h3.6" />
        </>
    ),

    // Lens and flash.
    instagram: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="3.3" />
            <circle cx="16.4" cy="7.7" r="0.6" />
        </>
    ),

    // The cross.
    x: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <path d="M9 9l6 6M15 9l-6 6" />
        </>
    ),

    // i and n.
    linkedin: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="8.7" cy="8.6" r="0.6" />
            <path d="M8.7 11.2v5.1M12.6 16.3v-5.1M12.6 13.1c0-1.1.8-1.9 1.8-1.9s1.8.8 1.8 1.9v3.2" />
        </>
    ),

    // The bookshop: a book standing open.
    amazon: (
        <>
            <path d="M12 7.4c-1.7-1.1-3.6-1.5-5.8-1.4v10.6c2.2-.1 4.1.3 5.8 1.4 1.7-1.1 3.6-1.5 5.8-1.4V6c-2.2-.1-4.1.3-5.8 1.4z" />
            <path d="M12 7.4V18" />
        </>
    ),

    // Anything else.
    globe: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M3.6 12h16.8" />
            <path d="M12 3.5c2.1 2.3 3.3 5.3 3.3 8.5S14.1 18.2 12 20.5c-2.1-2.3-3.3-5.3-3.3-8.5S9.9 5.8 12 3.5z" />
        </>
    ),
};

function SocialIcon({ name }) {
    const key = String(name || "").trim().toLowerCase();
    const glyph = GLYPHS[key] || GLYPHS.globe;

    return (
        <svg
            className="siteFooterIcon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
        >
            {glyph}
        </svg>
    );
}

export default SocialIcon;
