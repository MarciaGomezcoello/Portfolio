import { useEffect, useRef, useState } from "react";
import { useWords } from "./common/Words";
import { NavLink, useLocation } from "react-router-dom";
import { siteTabs } from "./tabs";
import useBodyLock from "./common/useBodyLock";
import "./Navbar.css";
import { Adorno } from "./common/Fiesta";

/* ============================================================================
   The top bar.

   Sits over the page and condenses once you scroll past the first screen, so
   the name stays reachable without eating the hero. The tabs are fixed, in
   tabs.js; below 900px they collapse into a full-screen drawer.

   The drawer is a sibling of the bar rather than a child of it. `.nav` carries
   a backdrop-filter, and a filtered element becomes the containing block for
   its fixed-position descendants — a drawer nested inside would be clipped to
   the height of the bar instead of covering the viewport.
   ============================================================================ */

function Navbar({ site, lang = "es", overHero = false }) {
    const words = useWords();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();

    // Condense the bar after the first scroll of any consequence, and draw the
    // thread across it as the page goes by.
    //
    // The thread is written straight onto the node rather than held in state:
    // it changes on every frame of a scroll, and a component that re-rendered
    // that often would re-render the whole bar with it. `setScrolled` is state
    // because it only ever flips twice, and React drops a set that changes
    // nothing. The measurement is taken inside a frame so a fast scroll costs
    // one read of the layout per frame rather than one per event.
    const thread = useRef(null);

    useEffect(() => {
        let frame = null;

        const draw = () => {
            frame = null;
            const el = thread.current;
            if (!el) return;
            const room =
                document.documentElement.scrollHeight - window.innerHeight;
            const through = room > 0 ? Math.min(1, window.scrollY / room) : 0;
            el.style.transform = `scaleX(${through})`;
        };

        const onScroll = () => {
            setScrolled(window.scrollY > 40);
            if (frame === null) frame = window.requestAnimationFrame(draw);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        // How much page there is changes with the width of the screen — and on
        // this site with which genre of book is being shown — so the thread is
        // redrawn when the window is resized as well as when it is scrolled.
        window.addEventListener("resize", onScroll);
        return () => {
            if (frame !== null) window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
        // A new page is a new length, and ScrollToTop lands at the top without
        // firing a scroll event when the reader was already there.
    }, [pathname]);

    // Backstop for navigation the drawer did not initiate — a browser back or
    // forward press while it is open. Presses inside the drawer close it
    // directly, since tapping the route you are already on changes no pathname.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // The page behind the drawer is held still while it is open.
    useBodyLock(menuOpen);

    // Escape closes the drawer, as it does for any overlay.
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const links = siteTabs(lang);

    // On the cover page the bar floats over the hero so the artwork reaches the
    // top of the screen; the hero's tall top padding is what sits behind it.
    // Every other page keeps the bar in flow above its own masthead — and so
    // does the cover page when its hero is switched off, or the next band
    // would start underneath the bar with nothing reserving that room.
    const isHome = pathname === "/" && overHero;

    // Pressing a link that points at the page you are already on navigates
    // nowhere, so ScrollToTop — which watches the pathname — never fires. Take
    // the reader back up here instead, which is what pressing the name or the
    // current tab is asking for.
    const goToTop = (to) => {
        setMenuOpen(false);
        if (pathname === to) {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    };

    return (
        <>
            <header
                className={`nav ${isHome ? "isHome" : ""} ${
                    scrolled ? "isScrolled" : ""
                } ${menuOpen ? "isMenuOpen" : ""}`}
            >
                {/* Drawn across the foot of the bar as the page is read. */}
                <span className="navThread" ref={thread} aria-hidden="true" />

                <div className="navInner">
                    <NavLink
                        to="/"
                        className="navBrand"
                        aria-label={words.home}
                        onClick={() => goToTop("/")}
                    >
                        <Adorno spot="brand" />
                        {site.honorific && (
                            <span className="navBrandHon">{site.honorific}</span>
                        )}
                        <span className="navBrandName">{site.name}</span>
                    </NavLink>

                    <nav className="navTabs" aria-label={words.sections}>
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `navTab ${isActive ? "isActive" : ""}`
                                }
                                onClick={() => goToTop(link.to)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <button
                        type="button"
                        className={`navBurger ${menuOpen ? "isOpen" : ""}`}
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-expanded={menuOpen}
                        aria-controls="navDrawer"
                        aria-label={menuOpen ? words.closeMenu : words.openMenu}
                    >
                        <span />
                        <span />
                    </button>
                </div>
            </header>

            <div
                id="navDrawer"
                className={`navDrawer ${menuOpen ? "isOpen" : ""}`}
                aria-hidden={!menuOpen}
            >
                {/* The sheet is the scroller, not the drawer: it starts below
                    the bar, so nothing can travel up behind the name or the
                    close button however long the list gets. */}
                <div className="navDrawerSheet">
                    <nav className="navDrawerLinks" aria-label={words.sections}>
                        {links.map((link, i) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `navDrawerLink ${isActive ? "isActive" : ""}`
                                }
                                onClick={() => goToTop(link.to)}
                            >
                                {/* The entrance moves this span, never the link
                                    itself. A transform on the <a> moves its hit box
                                    with it, so for as long as the stagger ran every
                                    row was sliding under the reader's finger and a
                                    press landed on its neighbour. The leaf is laid
                                    out and still from the moment it is touchable;
                                    only the ink arrives. */}
                                <span
                                    className="navDrawerLinkInk"
                                    style={{ transitionDelay: `${40 + i * 38}ms` }}
                                >
                                    {link.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                    {site.tagline && <p className="navDrawerTagline">{site.tagline}</p>}
                </div>
            </div>
        </>
    );
}

export default Navbar;
