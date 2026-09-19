import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PAGES } from "../schema/pages.js";
import { DraftContext, FieldList, Revert, isStaged, stagedHere } from "./fields.jsx";
import { getPreviewUrl, loadConfig } from "./config.js";
import EnglishTools from "./EnglishTools.jsx";
import Publisher from "./Publisher.jsx";
import Confirm from "./Confirm.jsx";

/* ============================================================================
   The editor.

   Her work lives here and is shown in the preview by posting it into the
   running site. The site's files are opened for writing exactly once, when she
   presses Aplicar.

   What she has not applied is the soft draft. A moment after each change it is
   kept on disk beside the site (see server.js), so closing the app loses
   nothing: reopening lays it back over the saved site, and every Cambiado and
   ↺ Deshacer mark returns, because the marks are only the difference between
   the two. Aplicar makes it the saved site and the marks go; Descartar throws
   it away. Photos she chooses wait with it and reach the site on Aplicar.
   ============================================================================ */

/* Inside the Mac app the window has no title bar of its own, so the bar below
   has to leave room for the three round buttons and be draggable itself. In a
   browser tab neither is true, and the same build serves both — so the app says
   which it is when it opens the page. */
const IN_APP = new URLSearchParams(window.location.search).has("app");

// How narrow and how wide the writing side may be dragged.
const MIN_FORM = 340;
const MAX_FORM = 860;
// The preview always keeps this much, so a wide form on a small window cannot
// squeeze it to a sliver with its buttons pushed out of sight.
const MIN_PREVIEW = 520;
const widestForm = () => Math.max(MIN_FORM, Math.min(MAX_FORM, window.innerWidth - MIN_PREVIEW));

const WIDTHS = [
    { label: "Teléfono", w: 390 },
    { label: "Tablet", w: 820 },
    { label: "Escritorio", w: 1280 },
];

function clone(v) {
    return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
}
function same(a, b) {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/* A section either owns a block of its file (`key`) or a handful of fields at
   the top of it. These read, write and restore just what the section owns, so
   undoing "Encabezado" never touches "Los libros" beside it in the same file. */
function sectionKeys(section) {
    const keys = section.keys || section.fields.flatMap((f) => (f.shape ? [f.name, f.shape] : [f.name]));
    return typeof section.toggle === "string" ? [...keys, section.toggle] : keys;
}

/* The on/off switch. A section with a block of its own keeps `visible` inside
   it (`toggle: true`); a section of top-level fields names its flag instead
   (`toggle: "headVisible"`). A section of top-level fields whose band is one
   of the file's blocks says which with `toggleIn`, and the switch is that
   block's `visible`. Absent means shown, on the site as here. */
function isOn(file, section) {
    if (!section.toggle) return true;
    const f = file || {};
    if (typeof section.toggle === "string") return f[section.toggle] !== false;
    return (f[section.key || section.toggleIn] || {}).visible !== false;
}
function flipped(file, section) {
    const on = isOn(file, section);
    if (typeof section.toggle === "string") return { ...file, [section.toggle]: !on };
    const block = section.key || section.toggleIn;
    return { ...file, [block]: { ...(file[block] || {}), visible: !on } };
}

/* The content file a section edits: its page's, unless the section names its
   own — "Nombre y redes" sits on the Portada page but edits site.json. */
function fileOf(form, section) {
    return section.file || form.file;
}

/* Whether a section differs from the site. The English section also owns the
   whole English copy, which lives beside the Spanish files rather than in one. */
function sectionChangedIn(draft, base, form, section) {
    const name = fileOf(form, section);
    if (!same(readSection(draft[name], section), readSection(base[name], section))) return true;
    return section.custom === "english" && !same(draft.en, base.en);
}
function readSection(file, section) {
    if (!file) return undefined;
    if (section.key) return file[section.key];
    const out = {};
    for (const k of sectionKeys(section)) if (k in file) out[k] = file[k];
    return out;
}
function patchSection(file, section, patch) {
    if (section.key) return { ...file, [section.key]: { ...(file[section.key] || {}), ...patch } };
    return { ...file, ...patch };
}
function restoreSection(file, baseFile, section) {
    if (section.key) return { ...file, [section.key]: clone(baseFile[section.key]) };
    const out = { ...file };
    for (const k of sectionKeys(section)) {
        if (k in baseFile) out[k] = clone(baseFile[k]);
        else delete out[k];
    }
    return out;
}

/* A section, said the way she would say it: "Libros · Encabezado". */
function sectionName(form, section) {
    return section.label === form.label ? section.label : `${form.label} · ${section.label}`;
}

/* What changed, section by section. */
function changedSections(draft, base) {
    if (!draft || !base) return [];
    return PAGES.flatMap(({ form }) =>
        form.sections
            .filter((s) => sectionChangedIn(draft, base, form, s))
            .map((s) => sectionName(form, s))
    );
}

/* --- Reopening on the soft draft -------------------------------------------
   A staged photo's address names the editor's port, which is new every time
   the app opens, so it is pointed at this one.

   When the saved site is still the one the soft draft was made against, it
   comes back whole. When the site's files changed in between — edited by hand,
   or brought from elsewhere — laying all of it back would quietly undo those
   changes at the next Aplicar, so only the sections she had changed come back,
   each laid over the new files. */
function rebaseStaged(node) {
    if (typeof node === "string") return isStaged(node) ? stagedHere(node) : node;
    if (Array.isArray(node)) return node.map(rebaseStaged);
    if (node && typeof node === "object") {
        return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, rebaseStaged(v)]));
    }
    return node;
}

function recoverDraft(soft, disk) {
    const draft = rebaseStaged(soft.draft);
    if (same(soft.base, disk)) return { draft: { ...clone(disk), ...draft }, carried: null };
    let out = clone(disk);
    const carried = [];
    for (const { form } of PAGES) {
        for (const s of form.sections) {
            if (!sectionChangedIn(draft, soft.base, form, s)) continue;
            const name = fileOf(form, s);
            out = { ...out, [name]: restoreSection(out[name] || {}, draft[name] || {}, s) };
            if (s.custom === "english") out.en = clone(draft.en || {});
            carried.push(sectionName(form, s));
        }
    }
    return { draft: out, carried };
}

/* How many pictures in the draft are new — chosen here and not yet on the site. */
function countNewImages(node) {
    if (typeof node === "string") return isStaged(node) ? 1 : 0;
    if (Array.isArray(node)) return node.reduce((n, v) => n + countNewImages(v), 0);
    if (node && typeof node === "object") {
        return Object.values(node).reduce((n, v) => n + countNewImages(v), 0);
    }
    return 0;
}

/* A short way to say what was saved, for the status in the top bar: the
   sections themselves when there are a few, the pages they are on when there
   are many. The confirmation before Aplicar still names every section. */
function briefly(names) {
    if (names.length <= 3) return list(names);
    const pages = [...new Set(names.map((n) => n.split(" · ")[0]))];
    return `${names.length} partes, en ${list(pages)}`;
}

function list(names) {
    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

export default function App() {
    const [base, setBase] = useState(null);      // the files as they are on disk
    const [draft, setDraft] = useState(null);    // her work, unsaved
    const [pageKey, setPageKey] = useState("home");
    const [activeByPage, setActiveByPage] = useState({}); // which section tab, per page
    const [width, setWidth] = useState(1280);
    const [previewLang, setPreviewLang] = useState("es");
    const [status, setStatus] = useState(null);
    const [busy, setBusy] = useState(false);
    const [asking, setAsking] = useState(null); // null, "aplicar" or "descartar"
    const frame = useRef(null);
    // A callback ref, not useRef: the preview does not exist on the first
    // render — the screen is still saying "Abriendo el sitio…" — so an effect
    // that reads a plain ref finds nothing and, with no dependency on the node,
    // never looks again. That left the preview unscaled and clipped, and the
    // dev server hid it because StrictMode remounts and runs the effect twice.
    const [stage, setStage] = useState(null);
    const [scale, setScale] = useState(1);

    /* How the window is split between the words and the page. Dragged by the
       handle between them and remembered, because it is a matter of what she is
       doing at the time — a long poem wants room to write, a new photograph
       wants room to look. */
    const [formWidth, setFormWidth] = useState(() => {
        try {
            const saved = Number(window.localStorage.getItem("marcia:formWidth"));
            if (saved >= MIN_FORM && saved <= MAX_FORM) return saved;
        } catch {
            /* A browser with storage switched off just gets the default. */
        }
        return 460;
    });
    // The width she chose is kept as it is; a smaller window only lends the
    // form less of it for now, and it comes back when the window grows.
    const [roomForForm, setRoomForForm] = useState(widestForm);
    useEffect(() => {
        const onResize = () => setRoomForForm(widestForm());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const dragging = useRef(false);
    const widthNow = useRef(formWidth);

    /* The preview is shown at its true width and then scaled down to whatever
       room is left, so "Escritorio" means a real 1280px page — the layout it
       reports is the layout a visitor gets — rather than a narrow pane
       pretending to be one. */
    useEffect(() => {
        if (!stage || typeof ResizeObserver === "undefined") return undefined;
        const fit = () => {
            const room = stage.clientWidth - 32;
            // Before the first layout the pane can measure zero, and a negative
            // scale turns the preview inside out rather than merely small.
            if (room > 0) setScale(Math.min(1, room / width));
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(stage);
        return () => ro.disconnect();
    }, [stage, width]);

    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current) return;
            e.preventDefault();
            const next = Math.min(widestForm(), Math.max(MIN_FORM, e.clientX));
            widthNow.current = next;
            setFormWidth(next);
        };
        const onUp = () => {
            if (!dragging.current) return;
            dragging.current = false;
            document.body.classList.remove("isDragging");
            try {
                window.localStorage.setItem("marcia:formWidth", String(widthNow.current));
            } catch {
                /* Not remembering is not worth failing over. */
            }
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    /* --- Load ------------------------------------------------------------- */
    // Whether a soft draft is on disk, so one is removed only when there is one.
    const stored = useRef(false);

    const load = useCallback(async ({ recover = true } = {}) => {
        await loadConfig();
        const res = await fetch("/api/content");
        const disk = await res.json();
        let next = clone(disk);
        let note = null;
        if (recover) {
            const soft = await fetch("/api/borrador")
                .then((r) => (r.ok ? r.json() : null))
                .catch(() => null);
            if (soft?.draft && soft?.base) {
                stored.current = true;
                const back = recoverDraft(soft, disk);
                next = back.draft;
                const kept = changedSections(next, disk);
                if (kept.length) {
                    note = back.carried
                        ? `Los archivos del sitio cambiaron desde la última vez, así que volvió solo lo que usted había cambiado: ${list(kept)}.`
                        : "Siguen aquí los cambios sin aplicar de la última vez.";
                }
            }
        }
        setBase(clone(disk));
        setDraft(next);
        if (note) setStatus({ kind: "ok", text: note });
    }, []);

    useEffect(() => { load(); }, [load]);

    /* --- Show it in the preview ------------------------------------------
       The site listens for this and re-renders from what it is handed. Posted
       on a short delay so a sentence being typed is one message, not thirty. */
    const post = useCallback((content) => {
        const win = frame.current?.contentWindow;
        if (win && content) win.postMessage({ type: "marcia:draft", content }, "*");
    }, []);

    useEffect(() => {
        if (!draft) return undefined;
        const t = setTimeout(() => post(draft), 140);
        return () => clearTimeout(t);
    }, [draft, post]);

    /* The preview follows the form: choosing a section scrolls the page to it,
       so what she is changing is what she is looking at. `find` in the schema
       names something inside that section. Asked again once a freshly loaded
       page has drawn, because a page that has just opened has nothing to find. */
    const findRef = useRef(null);
    const postFind = useCallback((delay = 0) => {
        const selector = findRef.current;
        if (!selector) return;
        setTimeout(() => {
            frame.current?.contentWindow?.postMessage({ type: "marcia:find", selector }, "*");
        }, delay);
    }, []);

    // The page says when it is ready — a reload of the preview asks again.
    useEffect(() => {
        const onMessage = (e) => {
            if (e.data?.type === "marcia:ready") {
                post(draft);
                // The page waits for the section itself; see findSection in
                // the site's App.js.
                postFind(0);
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [draft, post, postFind]);

    /* --- Editing ---------------------------------------------------------- */
    const page = PAGES.find((p) => p.key === pageKey) || PAGES[0];
    const { form } = page;
    const sectionIndex = Math.min(activeByPage[page.key] || 0, form.sections.length - 1);
    const section = form.sections[sectionIndex];

    useEffect(() => {
        findRef.current = section.find || null;
        postFind(60);
    }, [section, postFind]);

    const sectionFile = fileOf(form, section);

    const patch = useCallback((changes) => {
        setDraft((d) => ({ ...d, [sectionFile]: patchSection(d[sectionFile], section, changes) }));
    }, [sectionFile, section]);

    const toggleSection = () => {
        setDraft((d) => ({ ...d, [sectionFile]: flipped(d[sectionFile], section) }));
    };

    /* --- Aplicar and Descartar -------------------------------------------- */
    const changed = useMemo(() => changedSections(draft, base), [draft, base]);
    const dirty = changed.length > 0;

    /* --- The soft draft ----------------------------------------------------
       A moment after she stops, what is on screen is kept on disk; with
       nothing left unapplied, the kept copy is removed. The writes go through
       `chain` one after another, so an older one can never land after a newer
       one — nor after Aplicar or Descartar, which wait for it. */
    const chain = useRef(Promise.resolve());
    const timer = useRef(null);
    const latest = useRef(null);
    const failing = useRef(false);

    const enqueue = useCallback((task) => {
        chain.current = chain.current.then(task).catch(() => {});
        return chain.current;
    }, []);

    const keepSoftDraft = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = null;
        const now = latest.current;
        if (!now) return chain.current;
        if (!now.dirty) {
            if (!stored.current) return chain.current;
            stored.current = false;
            return enqueue(() => fetch("/api/borrador", { method: "DELETE" }));
        }
        stored.current = true;
        const body = JSON.stringify({ base: now.base, draft: now.draft });
        return enqueue(async () => {
            const ok = await fetch("/api/borrador", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body,
            }).then((r) => r.ok, () => false);
            // Said once, not on every keystroke, and only when it matters:
            // her work is on screen but would not survive closing.
            if (!ok && !failing.current) {
                setStatus({
                    kind: "bad",
                    text: "No se pudo guardar el borrador. Sus cambios siguen aquí: presione Aplicar para no perderlos.",
                });
            }
            failing.current = !ok;
        });
    }, [enqueue]);

    useEffect(() => {
        latest.current = draft && base ? { draft, base, dirty } : null;
        if (!latest.current) return;
        clearTimeout(timer.current);
        timer.current = setTimeout(keepSoftDraft, 300);
    }, [draft, base, dirty, keepSoftDraft]);

    // The app has it written at once before its window closes (see
    // electron/main.js); a browser tab does what it can as it goes.
    useEffect(() => {
        window.__editorFlush = keepSoftDraft;
        window.addEventListener("pagehide", keepSoftDraft);
        return () => window.removeEventListener("pagehide", keepSoftDraft);
    }, [keepSoftDraft]);

    async function aplicar() {
        setBusy(true);
        setStatus(null);
        // No write of the soft draft may land after this: Aplicar removes it.
        clearTimeout(timer.current);
        await chain.current;
        try {
            const res = await fetch("/api/aplicar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Everything is sent; the server rewrites only files that differ.
                body: JSON.stringify({ content: draft }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "No se pudo guardar.");

            const merged = { ...draft, ...data.content };
            stored.current = false;
            setBase(clone(merged));
            setDraft(clone(merged));
            setStatus({
                kind: "ok",
                text: data.saved.length
                    ? `Guardado: ${briefly(changed)}.` +
                      (data.images.length
                          ? data.images.length === 1
                              ? " Se guardó 1 foto."
                              : ` Se guardaron ${data.images.length} fotos.`
                          : "")
                    : "No había nada que guardar.",
            });
        } catch (err) {
            setStatus({ kind: "bad", text: String(err.message || err) });
            // Still unapplied, so still kept.
            keepSoftDraft();
        } finally {
            setBusy(false);
        }
    }

    async function descartar() {
        clearTimeout(timer.current);
        stored.current = false;
        await enqueue(() => fetch("/api/borrador", { method: "DELETE" }));
        await load({ recover: false });
        setStatus({ kind: "ok", text: "Se descartaron los cambios. Todo quedó como lo último aplicado." });
    }

    if (!draft) return <div className="loading">Abriendo el sitio…</div>;

    const pageUrl = `${getPreviewUrl()}${page.path}?lang=${previewLang}`;
    const newImages = countNewImages(draft);
    const file = draft[sectionFile] || {};
    const baseFile = base[sectionFile] || {};
    const obj = (section.key ? file[section.key] : file) || {};
    const baseObj = section.key ? baseFile[section.key] : baseFile;
    const sectionChanged = sectionChangedIn(draft, base, form, section);
    const sectionOn = isOn(file, section);

    return (
        <div className={`app ${IN_APP ? "inApp" : ""}`}>
            <header className="bar">
                <span className="barTitle">
                    El sitio de Marcia <span className="barPage">· {form.label}</span>
                </span>

                {status && (
                    <span className={`status ${status.kind}`} title={status.text}>{status.text}</span>
                )}

                <span className="barTools">
                    {/* Only that there are changes, not which: the dots on the tabs
                        show where, and the Aplicar dialog lists every one. */}
                    <span
                        className="dirty"
                        title={dirty ? "Quedan guardados como borrador hasta que los aplique." : undefined}
                    >
                        {dirty ? "Hay cambios sin aplicar" : "Todo aplicado"}
                    </span>
                    <button
                        type="button"
                        className="btn ghost"
                        onClick={() => setAsking("descartar")}
                        disabled={!dirty || busy}
                    >
                        Descartar
                    </button>
                    <button
                        type="button"
                        className="btn solid"
                        onClick={() => setAsking("aplicar")}
                        disabled={!dirty || busy}
                    >
                        {busy ? "Guardando…" : "Aplicar"}
                    </button>
                </span>
            </header>

            {/* The pages of the site. The franjas below belong to the page chosen here. */}
            <nav className="pageTabs" aria-label="Páginas del sitio">
                {PAGES.map((p) => {
                    const edited = p.form.sections.some((s) => sectionChangedIn(draft, base, p.form, s));
                    return (
                        <button
                            key={p.key}
                            type="button"
                            className={`pageTab ${p.key === page.key ? "isOn" : ""}`}
                            onClick={() => setPageKey(p.key)}
                            aria-current={p.key === page.key ? "page" : undefined}
                        >
                            {p.form.label}
                            {edited && <span className="dot" title="Sin aplicar" />}
                        </button>
                    );
                })}
            </nav>

            <nav className="tabs" aria-label={`Partes de ${form.label}`}>
                {form.sections.map((s, i) => {
                    const on = isOn(draft[fileOf(form, s)], s);
                    const edited = sectionChangedIn(draft, base, form, s);
                    return (
                        <button
                            key={s.label}
                            type="button"
                            className={`tab ${i === sectionIndex ? "isOn" : ""} ${on ? "" : "isOff"}`}
                            onClick={() => setActiveByPage((a) => ({ ...a, [page.key]: i }))}
                            aria-current={i === sectionIndex ? "page" : undefined}
                        >
                            {s.label}
                            {edited && <span className="dot" title="Sin aplicar" />}
                            {!on && <span className="tabOff" title="Apagada">⃠</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="body">
                <main className="form" style={{ flexBasis: Math.min(formWidth, roomForForm) }}>
                    <div className="formTitleRow">
                        <h1 className="formTitle">{section.label}</h1>
                        <Revert
                            show={sectionChanged}
                            onClick={() =>
                                setDraft((d) => ({
                                    ...d,
                                    [sectionFile]: restoreSection(d[sectionFile], baseFile, section),
                                    ...(section.custom === "english" ? { en: clone(base.en) } : {}),
                                }))
                            }
                        />
                        {section.toggle && (
                            <span className="switchPair">
                                <button
                                    type="button"
                                    className={`switch ${sectionOn ? "isOn" : ""}`}
                                    onClick={toggleSection}
                                    role="switch"
                                    aria-checked={sectionOn}
                                    aria-label={`${sectionOn ? "Apagar" : "Encender"} ${section.label}`}
                                    title={sectionOn ? "Apagar esta franja" : "Encender esta franja"}
                                >
                                    <span />
                                </button>
                                <span className="switchWord">
                                    {sectionOn ? "Se ve" : "Apagada"}
                                </span>
                            </span>
                        )}
                    </div>
                    {section.help && <p className="formHelp">{section.help}</p>}

                    {!sectionOn && (
                        <p className="offNote">
                            Esta franja está apagada: no sale en la página. Todo lo
                            que escriba aquí se guarda igual y vuelve a verse al
                            encenderla.
                        </p>
                    )}

                    {/* Keyed by page and section, so folds and half-typed
                        links do not carry over into a different form. */}
                    {section.custom === "publicar" ? (
                        <Publisher
                            base={base}
                            dirty={dirty}
                            changed={changed}
                            summarize={changedSections}
                            // An old version opens as a draft over the whole
                            // site: nothing is written until Aplicar.
                            onOpenVersion={(content) => setDraft(clone({ ...base, ...content }))}
                            // Publicar is only possible with nothing unapplied,
                            // so reading the files again loses nothing.
                            onReload={() => load({ recover: false })}
                        />
                    ) : section.custom === "english" ? (
                        <EnglishTools
                            draft={draft}
                            base={base}
                            setDraft={setDraft}
                            onSeeEnglish={() => setPreviewLang("en")}
                        />
                    ) : (
                        <DraftContext.Provider value={draft}>
                            <FieldList
                                key={`${page.key}:${sectionIndex}`}
                                fields={section.fields}
                                obj={obj}
                                base={baseObj}
                                onPatch={patch}
                            />
                        </DraftContext.Provider>
                    )}
                </main>

                {/* The handle between the two. */}
                <div
                    className="splitter"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Cambiar el ancho"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        dragging.current = true;
                        document.body.classList.add("isDragging");
                    }}
                    onDoubleClick={() => {
                        widthNow.current = 460;
                        setFormWidth(460);
                    }}
                    title="Arrastre para cambiar el ancho — doble clic para volver al normal"
                >
                    <span />
                </div>

                <aside className="preview">
                    <div className="previewBar">
                        {WIDTHS.map((w) => (
                            <button
                                key={w.w}
                                type="button"
                                className={`chipBtn ${width === w.w ? "isOn" : ""}`}
                                onClick={() => setWidth(w.w)}
                            >
                                {w.label}
                            </button>
                        ))}
                        {/* Which language the preview shows. The site reads ?lang=
                            from the address, so this is just a different page. */}
                        <span className="previewLang">
                            {[["es", "Español"], ["en", "English"]].map(([code, name]) => (
                                <button
                                    key={code}
                                    type="button"
                                    className={`chipBtn ${previewLang === code ? "isOn" : ""}`}
                                    onClick={() => setPreviewLang(code)}
                                >
                                    {name}
                                </button>
                            ))}
                        </span>
                        <button
                            type="button"
                            className="chipBtn chipBtnEnd"
                            onClick={() => {
                                // Setting src rather than reloading, so that
                                // following a link inside the preview and then
                                // pressing this comes back to the page chosen
                                // above instead of reloading wherever she ended up.
                                if (frame.current) frame.current.src = pageUrl;
                            }}
                            title="Vuelve a esta página si se fue a otra"
                        >
                            Volver a {form.label}
                        </button>
                    </div>
                    <div className="previewStage" ref={setStage}>
                        <div
                            className="previewFit"
                            style={{ width: Math.round(width * scale) }}
                        >
                            <iframe
                                ref={frame}
                                title="La página"
                                src={pageUrl}
                                style={{
                                    width,
                                    height: `${100 / scale}%`,
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                }}
                                onLoad={() => post(draft)}
                            />
                        </div>
                    </div>
                </aside>
            </div>

            {asking === "aplicar" && (
                <Confirm
                    title="¿Aplicar los cambios al sitio?"
                    yes="Sí, aplicar"
                    onNo={() => setAsking(null)}
                    onYes={() => {
                        setAsking(null);
                        aplicar();
                    }}
                >
                    <p>Pasa al sitio, en esta computadora, lo que cambió en:</p>
                    <ul>
                        {changed.map((name) => <li key={name}>{name}</li>)}
                    </ul>
                    {newImages > 0 && (
                        <p>
                            {newImages === 1
                                ? "Además se copia 1 foto nueva a la carpeta del sitio."
                                : `Además se copian ${newImages} fotos nuevas a la carpeta del sitio.`}
                        </p>
                    )}
                    <p>El sitio en internet no cambia hasta que publique, en Ajustes › Publicar.</p>
                </Confirm>
            )}
            {asking === "descartar" && (
                <Confirm
                    title="¿Descartar todos los cambios?"
                    yes="Sí, descartar"
                    danger
                    onNo={() => setAsking(null)}
                    onYes={() => {
                        setAsking(null);
                        descartar();
                    }}
                >
                    <p>Se pierde todo lo que cambió en:</p>
                    <ul>
                        {changed.map((name) => <li key={name}>{name}</li>)}
                    </ul>
                    <p>El editor vuelve a quedar igual que el sitio. Esto no se puede deshacer.</p>
                </Confirm>
            )}
        </div>
    );
}
