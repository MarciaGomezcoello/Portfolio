import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Moving between tabs should land at the top of the new page, the way a fresh
// page load would — React Router keeps the scroll position by default.
function ScrollToTop() {
    const { pathname } = useLocation();

    // Going back is the case that needs this. The browser saves a scroll
    // position for every history entry and puts it back on its own, after the
    // jump below has already run — and because this site sets `scroll-behavior:
    // smooth`, it puts it back by animating there, which is the slide you see
    // returning from a book to the shelf. Told to restore nothing, the browser
    // leaves the position alone and the jump stands.
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}

export default ScrollToTop;
