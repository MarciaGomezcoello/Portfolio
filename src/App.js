import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
    site, home, libros, arte, tejidos, eventos, biografia, english, sectionOn,
} from "./content/site";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/Footer/SiteFooter";
import { FiestaProvider } from "./components/common/Fiesta";
import ScrollToTop from "./components/common/ScrollToTop";
import { VisorProvider } from "./components/common/Visor";
import { WordsProvider } from "./components/common/Words";
import Home from "./pages/Home";
import Libros from "./pages/Libros";
import LibroDetalle from "./pages/LibroDetalle";
import Arte from "./pages/Arte";
import PoemaDetalle from "./pages/PoemaDetalle";
import Tejidos from "./pages/Tejidos";
import Eventos from "./pages/Eventos";
import EventoDetalle from "./pages/EventoDetalle";
import Biografia from "./pages/Biografia";
import NotFound from "./pages/NotFound";

// GitHub Pages serves the site from a repository subpath, so the router is
// told about it once here rather than in every link.
const basename = process.env.PUBLIC_URL || "";

/* ============================================================================
   The site.

   This is the ONE place that reads the content files. Every page below is a
   function of what it is handed and imports no content of its own, which is
   what keeps each tab's data its own — and what lets an editing tool render a
   real page from words that have not been saved to disk yet.

   Helpers are a different matter: `asset`, `hasText`, `shapeRatio` and the rest
   are pure functions with no data behind them, and components go on importing
   those directly.
   ============================================================================ */

// Spanish is the site; `en` holds the English copy of each file beside it.
const FILES = { site, home, libros, arte, tejidos, eventos, biografia, en: english };

/* Only a page served from this machine may post a draft in. `event.origin` is
   set by the browser and cannot be forged, so even if this code did reach the
   open web, a stranger framing the site could not drive it. This is the check
   that actually protects the page; the build-time one below is a second lock on
   the same door. */
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/* The editing app previews unsaved work by posting a draft in here, so she can
   see a change before it is written to any file.

   This must never reach the published site: a page on the open web that accepts
   content over postMessage can be made to show anything by whoever frames it.
   So the listener exists in exactly two builds and no others —

       npm start                    the dev server
       npm run build:preview        the copy bundled inside the editing app

   — and both set the flag below, which CRA substitutes at build time so the
   whole block is dropped from any other bundle. `npm run build`, the one that
   is deployed, has no listener in it at all. There is a check for this in
   §10 of docs/EDITOR-APP.md; keep running it. */
/* Bring the section the editor is on into view, and keep it there while the
   page settles. It used to scroll once, and that missed in two ways: asked
   straight after a change of page, the section did not exist yet (and the
   router's scroll-to-top then undid anything done early); and further down a
   page, pictures above it finished loading after the scroll and pushed it out
   from under the bar. So the request is held: it waits for the section to
   appear, jumps straight to it, then corrects for any drift for a couple of
   seconds — and lets go the moment the reader scrolls for themselves. It used
   to glide there; the user preferred a jump, which also lands before the page
   has had a chance to move under it. Preview only. */
let findRun = 0;
function findSection(selector) {
    const run = ++findRun;
    const started = Date.now();
    let userMoved = false;
    const stop = () => {
        userMoved = true;
    };
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchstart", stop, { once: true, passive: true });
    window.addEventListener("keydown", stop, { once: true });

    const target = () => {
        let el = null;
        try {
            el = document.querySelector(selector);
        } catch {
            return null;
        }
        const band = el?.closest("section, header, footer, nav") || el;
        if (!band) return null;
        // What opens a page — the bar, a masthead, the hero — is found by going
        // to the very top. Scrolling to its own edge put a masthead under the
        // sticky bar, which cut off its kicker and half its title.
        if (band.matches("nav, .pageHead, .hero")) return 0;
        const bar = document.querySelector(".nav")?.offsetHeight || 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return Math.max(0, Math.min(max, band.getBoundingClientRect().top + window.scrollY - bar));
    };

    const tick = () => {
        if (run !== findRun || userMoved) return;
        const elapsed = Date.now() - started;
        const top = target();
        if (top == null) {
            // Not drawn yet: a page still arriving. Give it three seconds.
            if (elapsed < 3000) setTimeout(tick, 120);
            return;
        }
        // "instant", not "auto": the site's own stylesheet may ask for smooth
        // scrolling, and "auto" would honour it.
        if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, left: 0, behavior: "instant" });
        if (elapsed < 2600) setTimeout(tick, 160);
    };
    tick();
}

function useContent() {
    const [content, setContent] = useState(FILES);

    useEffect(() => {
        // Written as one literal test on purpose. Both halves are replaced
        // with constants at build time, so a bundle that is neither the dev
        // server nor a preview build folds this to `return undefined` and the
        // minifier drops everything below it. Hoisting the test into a named
        // const defeats that and the listener ships — it was caught happening.
        if (
            process.env.NODE_ENV !== "development" &&
            process.env.REACT_APP_PREVIEW !== "1"
        ) {
            return undefined;
        }

        const onMessage = (event) => {
            if (!LOCAL_ORIGIN.test(event.origin)) return;
            const msg = event.data;
            // The editor names the section being edited; the preview brings
            // it into view, clear of the bar. See findSection below.
            if (msg?.type === "marcia:find" && typeof msg.selector === "string") {
                findSection(msg.selector);
                return;
            }
            if (!msg || msg.type !== "marcia:draft" || !msg.content) return;
            // Merged over the files on disk, so a draft carrying only the page
            // being edited still leaves every other page rendering normally.
            setContent({
                ...FILES,
                ...msg.content,
                en: { ...FILES.en, ...(msg.content.en || {}) },
            });
        };

        window.addEventListener("message", onMessage);
        // Tell the editor this frame is listening; it replies with the draft.
        if (window.parent !== window) {
            window.parent.postMessage({ type: "marcia:ready" }, "*");
        }
        return () => window.removeEventListener("message", onMessage);
    }, []);

    return content;
}

/* The visitor's language. Spanish unless they chose English — by the switch in
   the footer, remembered on this browser, or by a link ending in ?lang=en so a
   shared address opens in the language it was shared in. */
const LANG_KEY = "marcia:lang";

function initialLang() {
    try {
        const asked = new URLSearchParams(window.location.search).get("lang");
        if (asked === "en" || asked === "es") return asked;
        return window.localStorage.getItem(LANG_KEY) === "en" ? "en" : "es";
    } catch {
        return "es";
    }
}

function useLang() {
    const [lang, setLang] = useState(initialLang);
    const choose = (next) => {
        setLang(next);
        try {
            window.localStorage.setItem(LANG_KEY, next);
        } catch {
            /* Not remembering is fine: the switch still works for this visit. */
        }
    };
    return [lang, choose];
}

/* The page in the chosen language. Settings that are not words — the theme
   and the fonts — are the Spanish site file's alone, so there is one place to
   change them. A file with no English copy yet is shown in Spanish rather than
   not at all.

   The section switches are the Spanish file's too. The English copy is only
   rebuilt when a translation is pasted, so without this a section switched off
   afterwards would still show in English. */
const TOP_SWITCHES = ["headVisible", "shelfVisible", "channelsVisible", "bioVisible"];

function withSpanishSwitches(en, es) {
    const out = { ...en };
    for (const key of TOP_SWITCHES) {
        if (key in es) out[key] = es[key];
        else delete out[key];
    }
    for (const [key, block] of Object.entries(en)) {
        if (!block || typeof block !== "object" || Array.isArray(block)) continue;
        const spanish = es[key];
        if (spanish && typeof spanish === "object" && "visible" in spanish) {
            out[key] = { ...block, visible: spanish.visible };
        } else if ("visible" in block) {
            const { visible, ...rest } = block;
            out[key] = rest;
        }
    }
    return out;
}

function inLanguage(all, lang) {
    if (lang !== "en") return all;
    const out = { ...all };
    for (const name of ["site", "home", "libros", "arte", "tejidos", "eventos", "biografia"]) {
        if (all.en?.[name]) out[name] = withSpanishSwitches(all.en[name], all[name] || {});
    }
    return out;
}

function App() {
    const all = useContent();
    const [lang, setLang] = useLang();
    const c = inLanguage(all, lang);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    // The colour theme: one word in site.json, stamped on the root element
    // where tokens.css picks it up. An unknown word just leaves the default.
    const theme = all.site?.theme;
    useEffect(() => {
        const root = document.documentElement;
        if (theme && theme !== "papel") root.dataset.theme = theme;
        else delete root.dataset.theme;
    }, [theme]);

    // The two fonts, the same way: one word each, stamped on the root element.
    // Like the theme they are read from the Spanish site file only.
    const fontTitles = all.site?.fontTitles;
    const fontText = all.site?.fontText;
    useEffect(() => {
        const root = document.documentElement;
        if (fontTitles && fontTitles !== "fraunces") root.dataset.titles = fontTitles;
        else delete root.dataset.titles;
        if (fontText && fontText !== "inter") root.dataset.text = fontText;
        else delete root.dataset.text;
    }, [fontTitles, fontText]);

    return (
        <BrowserRouter basename={basename}>
            <WordsProvider words={c.site?.ui}>
            <FiestaProvider theme={theme} extras={all.site?.holidayExtras}>
            <VisorProvider>
                <ScrollToTop />
                <a className="skipLink" href="#main">{c.site?.ui?.skipLink || "Saltar al contenido"}</a>
                <Navbar site={c.site} lang={lang} overHero={sectionOn(c.home?.hero)} />
                <main id="main">
                    <Routes>
                        <Route path="/" element={<Home home={c.home} />} />
                        <Route path="/libros" element={<Libros libros={c.libros} />} />
                        <Route path="/libros/:slug" element={<LibroDetalle libros={c.libros} />} />
                        <Route path="/arte" element={<Arte arte={c.arte} />} />
                        <Route path="/arte/:slug" element={<PoemaDetalle arte={c.arte} />} />
                        <Route path="/tejidos" element={<Tejidos tejidos={c.tejidos} />} />
                        <Route path="/eventos" element={<Eventos eventos={c.eventos} />} />
                        <Route path="/eventos/:slug" element={<EventoDetalle eventos={c.eventos} />} />
                        <Route path="/biografia" element={<Biografia biografia={c.biografia} />} />
                        <Route path="*" element={<NotFound lang={lang} />} />
                    </Routes>
                </main>
                <SiteFooter site={c.site} lang={lang} onLang={setLang} />
            </VisorProvider>
            </FiestaProvider>
            </WordsProvider>
        </BrowserRouter>
    );
}

export default App;
