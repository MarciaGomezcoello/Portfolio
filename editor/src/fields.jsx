import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getPreviewUrl } from "./config.js";
import Confirm from "./Confirm.jsx";

/* ============================================================================
   One control per `kind` in the schema, and nothing else.

   Every field is handed the object it belongs to and a way to patch it, rather
   than just its own value — that is what lets a picture keep its shape beside
   it as one thing, instead of three unrelated rows.
   ============================================================================ */

export const SHAPES = [
    { value: "cuadrado", label: "Cuadrada", w: 26, h: 26 },
    { value: "alto", label: "Alta", w: 22, h: 30 },
    { value: "ancho", label: "Ancha", w: 32, h: 21 },
];

/* The whole draft, for the few controls that look beyond their own section —
   a list that copies entries in from another page. Provided by App.jsx. */
export const DraftContext = createContext(null);

function same(a, b) {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/* A photo she has chosen but not yet applied lives in the editor's staging
   folder, and the draft holds its address there. The staged name keeps the
   original after "__". */
const STAGED = /\/api\/staging\/([^/?#]+)$/;
export function isStaged(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value) && STAGED.test(value);
}
function stagedName(value) {
    const name = decodeURIComponent(value.match(STAGED)[1]);
    return name.split("__").slice(1).join("__") || name;
}

/* The same staged photo, at this editor's address. The address names a port
   that is new every time the app opens, so a soft draft kept by an earlier
   session is pointed here when it comes back. */
export function stagedHere(value) {
    return `${window.location.origin}/api/staging/${value.match(STAGED)[1]}`;
}

/* Every staged photo anywhere in the draft, once each. */
function stagedIn(node, found = new Set()) {
    if (isStaged(node)) found.add(node);
    else if (Array.isArray(node)) node.forEach((v) => stagedIn(v, found));
    else if (node && typeof node === "object") Object.values(node).forEach((v) => stagedIn(v, found));
    return found;
}

/* The source for a picture in the preview: a file already on the site, or any
   address — a link, or a staged photo. */
export function imageSrc(value) {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `${getPreviewUrl()}/content/${value}`;
}

/* The mark beside anything that differs from the site as it is: a word saying
   so, and a way to put back just that one thing without touching the rest.
   `tag` is "Nuevo" for an entry that did not exist on the site at all. */
export function Revert({ show, onClick, tag = "Cambiado" }) {
    if (!show) return null;
    return (
        <span className="changed">
            <span className="changedTag">{tag}</span>
            <button
                type="button"
                className="revert"
                onClick={(e) => {
                    // Inside a <label>, a click would otherwise also land in its input.
                    e.preventDefault();
                    e.stopPropagation();
                    onClick();
                }}
                title="Volver a como está en el sitio"
            >
                ↺ Deshacer
            </button>
        </span>
    );
}

/* A field with one input is a <label>, so a click anywhere on it lands in the
   input. One with many inputs passes `as="div"`, or every click would jump to
   the first of them.

   Deshacer sits OUTSIDE the label, laid over its corner. A label hands a click
   anywhere inside it to its first button or input — and when Deshacer was
   inside, that was Deshacer, so a click on the white space beside a field put
   the field back. */
function Row({ as: Tag = "label", field, changed, onRevert, className = "", children }) {
    return (
        <div className={`row ${changed ? "isChanged" : ""} ${className}`}>
            <Tag className="rowBody">
                <span className="rowHead">
                    <span className="rowLabel">{field.label}</span>
                </span>
                {children}
                {field.help && <span className="rowHelp">{field.help}</span>}
            </Tag>
            <Revert show={changed} onClick={onRevert} />
        </div>
    );
}

/* --- Pictures ------------------------------------------------------------- */

/* Every string in the draft, to tell which photos it uses. */
function stringsIn(node, found = new Set()) {
    if (typeof node === "string") found.add(node);
    else if (Array.isArray(node)) node.forEach((v) => stringsIn(v, found));
    else if (node && typeof node === "object") Object.values(node).forEach((v) => stringsIn(v, found));
    return found;
}

/* The gallery: every picture already on the site, newest first, and before
   them the new ones chosen in this draft — so a photo used once can be used
   anywhere else without finding the file again, which only ever made a
   numbered copy of it. Choosing one puts its name in the field; nothing is
   copied.

   Any photo on the site can be deleted from here. The server says which ones
   the saved site, the soft draft or a kept version use, and what is on screen
   counts too; deleting one of those warns that its places will show an empty
   frame, which is what the site draws for a missing picture. */
function PhotoLibrary({ current, onPick, onClose }) {
    const draft = useContext(DraftContext);
    const [photos, setPhotos] = useState(null);
    const [failed, setFailed] = useState(false);
    const [query, setQuery] = useState("");
    const [deleting, setDeleting] = useState(null); // the photo being asked about
    const [problem, setProblem] = useState("");

    const refresh = () =>
        fetch("/api/images")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((list) => setPhotos(Array.isArray(list) ? list : []))
            .catch(() => setFailed(true));

    useEffect(() => {
        refresh();
    }, []);

    const onScreen = stringsIn(draft);
    const all = [
        ...[...stagedIn(draft)].map((value) => ({ value, name: stagedName(value), isNew: true })),
        ...(photos || []).map((p) => ({
            value: p.name,
            name: p.name,
            used: p.used === "sitio" || onScreen.has(p.name) ? "sitio" : p.used,
        })),
    ];
    const plain = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const shown = query.trim() ? all.filter((p) => plain(p.name).includes(plain(query.trim()))) : all;

    const remove = async (photo) => {
        setDeleting(null);
        setProblem("");
        try {
            const res = await fetch(`/api/images/${encodeURIComponent(photo.value)}`, { method: "DELETE" });
            const out = await res.json();
            if (!res.ok) throw new Error(out.error);
        } catch (err) {
            setProblem(err.message || "No se pudo borrar esa foto.");
        }
        refresh();
    };

    return (
        <div className="picker library" role="dialog" aria-label="Galería de fotos">
            <div className="pickerHead">
                <span>Toque una foto para usarla aquí, o la × para borrarla.</span>
                <button type="button" className="pickerClose" onClick={onClose} aria-label="Cerrar">×</button>
            </div>
            {all.length > 12 && (
                <input
                    type="search"
                    className="librarySearch"
                    value={query}
                    placeholder="Buscar por nombre…"
                    onChange={(e) => setQuery(e.target.value)}
                />
            )}
            {failed ? (
                <p className="empty">No se pudieron leer las fotos del sitio.</p>
            ) : !photos ? (
                <p className="empty">Buscando las fotos…</p>
            ) : shown.length === 0 ? (
                <p className="empty">{all.length ? "Ninguna foto se llama así." : "El sitio todavía no tiene fotos."}</p>
            ) : (
                <ul className="libraryGrid">
                    {shown.map((p) => {
                        const isOn = p.value === current;
                        return (
                            <li key={p.value}>
                                <button
                                    type="button"
                                    className={`libraryItem ${isOn ? "isOn" : ""}`}
                                    aria-pressed={isOn}
                                    title={p.name}
                                    onClick={() => onPick(p.value)}
                                >
                                    <span className="libraryThumb">
                                        <img src={imageSrc(p.value)} alt="" loading="lazy" />
                                    </span>
                                    <span className="libraryName">{p.name}</span>
                                    {isOn ? (
                                        <span className="libraryTag">Está aquí</span>
                                    ) : (
                                        p.isNew && <span className="libraryTag isNew">Nueva</span>
                                    )}
                                </button>
                                {!p.isNew && (
                                    <button
                                        type="button"
                                        className="libraryDelete"
                                        aria-label={`Borrar ${p.name}`}
                                        title="Borrar esta foto"
                                        onClick={() => setDeleting(p)}
                                    >
                                        ×
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {problem && <p className="empty picMetaBad">{problem}</p>}
            {deleting && (
                <Confirm
                    title="¿Borrar esta foto?"
                    yes="Sí, borrar"
                    danger
                    onNo={() => setDeleting(null)}
                    onYes={() => remove(deleting)}
                >
                    <p>«{deleting.name}» se quita de la galería.</p>
                    {deleting.used === "sitio" ? (
                        <p>
                            <strong>Esta foto se usa en el sitio.</strong> Donde aparece quedará un
                            espacio vacío hasta que elija otra foto.
                        </p>
                    ) : deleting.used === "version" ? (
                        <p>Una versión publicada anterior la usa: si vuelve a esa versión, ese espacio saldrá vacío.</p>
                    ) : (
                        <p>Ninguna página la usa.</p>
                    )}
                    <p>No se puede deshacer.</p>
                </Confirm>
            )}
        </div>
    );
}

function ShapeButtons({ value, onChange }) {
    return (
        <span className="shapes">
            {SHAPES.map((s) => (
                <button
                    key={s.value}
                    type="button"
                    className={`shapeBtn ${value === s.value ? "isOn" : ""}`}
                    onClick={() => onChange(s.value)}
                >
                    <span className="shapeBox" style={{ width: s.w, height: s.h }} />
                    {s.label}
                </button>
            ))}
        </span>
    );
}

function PicGlyph() {
    return (
        <svg className="picGlyph" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="9" cy="10" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4 17l5-4.5 3.5 3 3-2.5L20 17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
    );
}

/* Where a web address is pasted. Nothing reaches the draft until it is used,
   so a half-typed address never sends the preview looking for it. */
function LinkInput({ initial = "", autoFocus = false, onUse, onCancel }) {
    const [text, setText] = useState(initial);
    const [error, setError] = useState("");
    const use = () => {
        const url = text.trim();
        if (!url) return;
        if (!IS_LINK.test(url)) {
            setError("El enlace tiene que empezar con https://");
            return;
        }
        setError("");
        onUse(url);
        setText("");
    };
    return (
        <div className="picLink">
            <span className="picLinkRow">
                <input
                    type="text"
                    value={text}
                    autoFocus={autoFocus}
                    placeholder="https://…"
                    onChange={(e) => {
                        setText(e.target.value);
                        setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            use();
                        } else if (e.key === "Escape" && onCancel) {
                            onCancel();
                        }
                    }}
                />
                <button type="button" className="picBtn" onClick={use} disabled={!text.trim()}>
                    Usar
                </button>
            </span>
            {error && <span className="picMeta picMetaBad">{error}</span>}
        </div>
    );
}

const IS_LINK = /^https?:\/\/\S+$/i;

/* A web address, shortened to something that reads: the site and the file. */
function linkName(url) {
    try {
        const u = new URL(url);
        const file = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || "");
        return file ? `${u.hostname} · ${file}` : u.hostname;
    } catch {
        return url;
    }
}

function ImageField({ field, obj, base, onPatch }) {
    const input = useRef(null);
    const [over, setOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [linkOpen, setLinkOpen] = useState(false);
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [broken, setBroken] = useState(false);
    const value = obj[field.name] || "";
    const src = imageSrc(value);
    const isNew = isStaged(value);
    const isLink = !isNew && IS_LINK.test(value);

    // A new picture gets a fresh chance to load.
    useEffect(() => setBroken(false), [value]);
    const changed =
        !same(value, base?.[field.name]) ||
        (field.shape && !same(obj[field.shape], base?.[field.shape]));

    // Copy the file into the soft draft's photo folder straight away, so it is
    // safe even if she moves or deletes the original. The site itself is not
    // touched until Aplicar; Descartar throws it away.
    const take = async (file) => {
        if (!file) return;
        // HEIC (an iPhone photo) can arrive with no type at all; the server
        // turns it into a JPEG. Anything else that is not a picture is said so
        // rather than ignored, which looked like the drop had not worked.
        if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
            setUploadError("Eso no es una foto. Elija un archivo de imagen, como JPG o PNG.");
            return;
        }
        setUploading(true);
        setUploadError("");
        try {
            const res = await fetch(`/api/staging?name=${encodeURIComponent(file.name)}`, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const data = await res.json();
            if (!res.ok) {
                // The server's own words, in Spanish, when it has any.
                setUploadError(data.error || "No se pudo copiar esa foto. Pruebe otra vez.");
                return;
            }
            onPatch({ [field.name]: `${window.location.origin}${data.path}` });
        } catch {
            setUploadError("No se pudo copiar esa foto. Pruebe otra vez.");
        } finally {
            setUploading(false);
        }
    };
    const choose = () => input.current?.click();
    const useLink = (url) => {
        onPatch({ [field.name]: url });
        setLinkOpen(false);
    };

    const revert = () => {
        const patch = { [field.name]: base?.[field.name] ?? "" };
        if (field.shape) patch[field.shape] = base?.[field.shape] ?? "";
        onPatch(patch);
    };

    // The whole card takes a dropped photo, not just the thumbnail. Crossing
    // into a child fires dragleave too, so only leaving the card counts.
    const drop = {
        onDragOver: (e) => {
            if (e.dataTransfer.types.includes(ORDER_TYPE)) return; // a line being reordered
            e.preventDefault();
            setOver(true);
        },
        onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); },
        onDrop: (e) => {
            e.preventDefault();
            setOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) return take(file);
            // A picture dragged out of a web page arrives as its address.
            const url = (e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain"))
                .split("\n").map((l) => l.trim()).find((l) => IS_LINK.test(l));
            if (url) useLink(url);
        },
    };

    const name = isNew ? stagedName(value) : isLink ? linkName(value) : value.split("/").pop();

    return (
        <div className={`row imageRow ${changed ? "isChanged" : ""}`}>
            <span className="rowHead">
                <span className="rowLabel">{field.label}</span>
                <Revert show={changed} onClick={revert} />
            </span>

            {src ? (
                <div className={`pic ${over ? "isOver" : ""}`} {...drop}>
                    <button type="button" className="picThumb" onClick={choose} title="Cambiar foto">
                        {broken ? <PicGlyph /> : <img src={src} alt="" onError={() => setBroken(true)} />}
                    </button>
                    <div className="picInfo">
                        <span className="picName" title={name}>{name}</span>
                        {uploading ? (
                            <span className="picMeta">Copiando la foto…</span>
                        ) : uploadError ? (
                            <span className="picMeta picMetaBad">{uploadError}</span>
                        ) : broken ? (
                            <span className="picMeta picMetaBad">
                                {isLink ? "No se pudo abrir la imagen de ese enlace." : "No se encuentra ese archivo."}
                            </span>
                        ) : isNew ? (
                            <span className="picMeta picMetaNew">Foto nueva · se guarda al Aplicar</span>
                        ) : isLink ? (
                            <span className="picMeta">Desde un enlace de internet.</span>
                        ) : (
                            <span className="picMeta">Sale entera, sin recortar.</span>
                        )}
                        <span className="picTools">
                            <button type="button" className="picBtn" onClick={choose}>
                                Cambiar foto
                            </button>
                            <button
                                type="button"
                                className={`picBtn ${libraryOpen ? "isOn" : ""}`}
                                onClick={() => setLibraryOpen((v) => !v)}
                            >
                                Galería
                            </button>
                            <button
                                type="button"
                                className={`picBtn ${linkOpen ? "isOn" : ""}`}
                                onClick={() => setLinkOpen((v) => !v)}
                            >
                                Enlace
                            </button>
                            <button
                                type="button"
                                className="picBtn quiet"
                                onClick={() => onPatch({ [field.name]: "" })}
                            >
                                Quitar
                            </button>
                        </span>
                    </div>
                    {linkOpen && (
                        <LinkInput
                            initial={isLink ? value : ""}
                            autoFocus
                            onUse={useLink}
                            onCancel={() => setLinkOpen(false)}
                        />
                    )}
                    {over && <span className="picDropNote">Suelte la foto para cambiarla</span>}
                </div>
            ) : (
                <div className={`pic isEmpty ${over ? "isOver" : ""}`} {...drop}>
                    <button type="button" className="picEmpty" onClick={choose}>
                        <PicGlyph />
                        <span className="picEmptyTitle">
                            {uploading ? "Copiando la foto…" : over ? "Suelte la foto aquí" : "Arrastre una foto aquí"}
                        </span>
                        <span className={`picEmptyHint ${uploadError ? "picMetaBad" : ""}`}>
                            {uploadError || "o toque para elegirla"}
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`picBtn picLibraryBtn ${libraryOpen ? "isOn" : ""}`}
                        onClick={() => setLibraryOpen((v) => !v)}
                    >
                        Elegir una foto de la galería
                    </button>
                    <div className="picOr"><span>o use el enlace de una imagen</span></div>
                    <LinkInput onUse={useLink} />
                    {/* The shape only reserves the space. Once a photo is there
                        the site measures it and the frame closes around it, so
                        the choice is offered only while the slot is empty — and
                        the stored word is kept, because the reserved frame uses
                        it again if the photo is taken away. */}
                    {field.shape && (
                        <div className="picShape">
                            <span className="picShapeLabel">Mientras no haya foto, el espacio es:</span>
                            <ShapeButtons
                                value={obj[field.shape]}
                                onChange={(v) => onPatch({ [field.shape]: v })}
                            />
                        </div>
                    )}
                </div>
            )}

            {libraryOpen && (
                <PhotoLibrary
                    current={value}
                    onClose={() => setLibraryOpen(false)}
                    onPick={(picked) => {
                        onPatch({ [field.name]: picked });
                        setLibraryOpen(false);
                    }}
                />
            )}

            <input
                ref={input}
                type="file"
                accept="image/*,.heic,.heif"
                hidden
                onChange={(e) => {
                    take(e.target.files?.[0]);
                    e.target.value = ""; // choosing the same file again still counts
                }}
            />
            {field.help && <span className="rowHelp">{field.help}</span>}
        </div>
    );
}

/* --- Short lists of words ------------------------------------------------- */

/* --- Reordering by dragging ----------------------------------------------

   Every list in the editor is put in order the same way: a grip of dots at the
   left of each line, dragged to where the line should go, with a rose line
   showing the gap it will land in. Arrows asked for one click per place moved,
   and a book going from last to first was a dozen of them.

   `lineClass` names the list's own lines. Only direct children count, so a
   list inside an open card is never mistaken for the card's own list. The drag
   carries a type of its own, so a photo slot inside an open card does not take
   the line for a dropped picture. */
const ORDER_TYPE = "application/x-marcia-order";

function useDragOrder({ count, lineClass, onMove }) {
    const [dragFrom, setDragFrom] = useState(-1);
    const [gap, setGap] = useState(-1); // 0…count: the space the line would drop into
    const listRef = useRef(null);

    // The gap nearest the pointer: above a line's middle is before it, below is after.
    const gapAt = (clientY) => {
        const lines = [...listRef.current.children].filter((el) => el.classList.contains(lineClass));
        const i = lines.findIndex((el) => {
            const r = el.getBoundingClientRect();
            return clientY < r.top + r.height / 2;
        });
        return i < 0 ? lines.length : i;
    };

    const endDrag = () => {
        setDragFrom(-1);
        setGap(-1);
    };

    const listProps = {
        ref: listRef,
        onDragOver: (e) => {
            if (dragFrom < 0) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
            setGap(gapAt(e.clientY));
        },
        onDrop: (e) => {
            if (dragFrom < 0) return;
            e.preventDefault();
            e.stopPropagation();
            let to = gapAt(e.clientY);
            if (to > dragFrom) to -= 1; // the line leaves its own place first
            if (to !== dragFrom) onMove(dragFrom, to);
            endDrag();
        },
    };

    const gripProps = (i, label) => ({
        draggable: true,
        title: "Arrastre para mover",
        "aria-hidden": true,
        onDragStart: (e) => {
            e.stopPropagation();
            const line = e.currentTarget.closest(`.${lineClass}`);
            const r = line.getBoundingClientRect();
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData(ORDER_TYPE, String(label ?? i));
            e.dataTransfer.setDragImage(line, e.clientX - r.left, e.clientY - r.top);
            setDragFrom(i);
        },
        onDragEnd: endDrag,
    });

    // A drop that would leave the line where it is shows no gap.
    const showGap = dragFrom >= 0 && gap !== dragFrom && gap !== dragFrom + 1;
    const dragClass = (i) =>
        (dragFrom === i ? " isDragging" : "") +
        (showGap && gap === i ? " dropBefore" : "") +
        (showGap && gap === count && i === count - 1 ? " dropAfter" : "");

    return { listProps, gripProps, dragClass };
}

/* Moves one entry of an array to a new place. */
function moved(list, from, to) {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

/* One word per line, in the order the site uses them. A column rather than a
   wrapping row of pills, because in a row that wraps "before" and "after" jump
   between lines and a drop lands somewhere other than where it looked. Each
   line can be dragged by its grip or retyped in place. */
function WordsField({ field, obj, base, onPatch }) {
    const [text, setText] = useState("");
    const words = Array.isArray(obj[field.name]) ? obj[field.name] : [];
    const changed = !same(words, base?.[field.name]);
    const set = (next) => onPatch({ [field.name]: next });
    const { listProps, gripProps, dragClass } = useDragOrder({
        count: words.length,
        lineClass: "wordLine",
        onMove: (from, to) => set(moved(words, from, to)),
    });

    const add = () => {
        if (!text.trim()) return;
        set([...words, text.trim()]);
        setText("");
    };

    return (
        <Row as="div" field={field} changed={changed} onRevert={() => set(base?.[field.name] ?? [])}>
            <ol className="words" {...listProps}>
                {words.map((w, i) => (
                    <li key={i} className={"wordLine" + dragClass(i)}>
                        <span className="wordGrip" {...gripProps(i, w)} />
                        <span className="wordNum">{i + 1}</span>
                        <input
                            type="text"
                            className="wordText"
                            value={w}
                            aria-label={`Palabra ${i + 1}`}
                            onChange={(e) => set(words.map((x, j) => (j === i ? e.target.value : x)))}
                            onBlur={() => {
                                // A line emptied by hand is a word taken away.
                                if (!w.trim()) set(words.filter((_, j) => j !== i));
                                else if (w !== w.trim()) set(words.map((x, j) => (j === i ? x.trim() : x)));
                            }}
                        />
                        <span className="cardTools">
                            <button
                                type="button"
                                className="danger"
                                onClick={() => set(words.filter((_, j) => j !== i))}
                                aria-label={`Quitar ${w}`}
                            >
                                ×
                            </button>
                        </span>
                    </li>
                ))}
                {words.length === 0 && <li className="wordsEmpty">Todavía no hay ninguna.</li>}
            </ol>
            <span className="wordAdd">
                <input
                    type="text"
                    value={text}
                    placeholder="Escriba una palabra nueva"
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        add();
                    }}
                />
                <button type="button" className="addBtn" onClick={add} disabled={!text.trim()}>
                    + Añadir
                </button>
            </span>
        </Row>
    );
}

/* --- Lists of things ------------------------------------------------------ */

/* --- Copying entries in from another page ---------------------------------

   Each page owns its own copy of what it shows, so the cover page's three
   books are not read from the Libros page. Typing a book in twice is what that
   would cost, and this is what saves it: a list whose schema names a `source`
   offers the entries already written on that page, and choosing one copies the
   whole entry in, every field of it. From then on the two copies are separate,
   exactly as if it had been typed. */
function sameEntry(a, b, key) {
    const norm = (v) => String(v || "").trim().toLowerCase();
    return norm(a?.[key]) !== "" && norm(a?.[key]) === norm(b?.[key]);
}

function SourcePicker({ field, items, onPick, onClose }) {
    const draft = useContext(DraftContext);
    const { file, key, label } = field.source;
    const offered = Array.isArray(draft?.[file]?.[key]) ? draft[file][key] : [];
    const title = field.itemTitle;

    return (
        <div className="picker" role="dialog" aria-label={`Elegir de ${label}`}>
            <div className="pickerHead">
                <span>Toque uno para copiarlo aquí, entero.</span>
                <button type="button" className="pickerClose" onClick={onClose} aria-label="Cerrar">×</button>
            </div>
            {offered.length === 0 && <p className="empty">La página de {label} todavía no tiene ninguno.</p>}
            <ul className="pickerList">
                {offered.map((entry, i) => {
                    const already = items.some((it) => sameEntry(it, entry, title));
                    const src = field.source.image ? imageSrc(entry[field.source.image]) : null;
                    return (
                        <li key={i}>
                            <button
                                type="button"
                                className="pickerItem"
                                disabled={already}
                                onClick={() => onPick(entry)}
                            >
                                {field.source.image && (
                                    <span className="pickerThumb">
                                        {src ? <img src={src} alt="" loading="lazy" /> : <PicGlyph />}
                                    </span>
                                )}
                                <span className="pickerText">
                                    <span className="pickerTitle">{String(entry[title] || "").trim() || "Sin título"}</span>
                                    {already
                                        ? <span className="pickerNote">Ya está aquí</span>
                                        : field.source.detail && entry[field.source.detail] && (
                                            <span className="pickerNote">{entry[field.source.detail]}</span>
                                        )}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function ListField({ field, obj, base, onPatch }) {
    // Everything starts folded: a page of fourteen books is fourteen lines.
    const [open, setOpen] = useState(-1);
    const [picking, setPicking] = useState(false);
    const items = Array.isArray(obj[field.name]) ? obj[field.name] : [];
    const baseItems = Array.isArray(base?.[field.name]) ? base[field.name] : [];
    const set = (next) => onPatch({ [field.name]: next });

    const patchItem = (i, patch) => {
        set(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
    };

    // The open card is remembered by its place, so taking an entry out moves
    // it with the entries after it — or closes it, if it was the one removed.
    // Without this, deleting a line above the open card opened its neighbour.
    const remove = (i) => {
        set(items.filter((_, j) => j !== i));
        setOpen((o) => (o === i ? -1 : o > i ? o - 1 : o));
    };

    // The open card travels with its entry, and the ones it passed shift by one.
    const { listProps, gripProps, dragClass } = useDragOrder({
        count: items.length,
        lineClass: "card",
        onMove: (from, to) => {
            set(moved(items, from, to));
            setOpen((o) => {
                if (o === from) return to;
                if (from < o && o <= to) return o - 1;
                if (to <= o && o < from) return o + 1;
                return o;
            });
        },
    });

    // A new entry starts with every key of this type, so a copy is never a
    // partial one — the model must be complete wherever it lives.
    const blank = () => {
        const out = {};
        const walk = (fs) => fs.forEach((f) => {
            if (f.kind === "list" || f.kind === "words") out[f.name] = [];
            else if (f.kind === "group") {
                out[f.name] = {};
            } else {
                out[f.name] = "";
                if (f.shape) out[f.shape] = "alto";
            }
        });
        walk(field.fields);
        if (baseItems[0]) for (const k of Object.keys(baseItems[0])) {
            if (!(k in out)) out[k] = Array.isArray(baseItems[0][k]) ? [] : "";
        }
        return out;
    };

    return (
        <div className={`listField ${same(items, baseItems) ? "" : "isChanged"}`}>
            <div className="listHead">
                <span className="rowLabel">{field.label}</span>
                <Revert show={!same(items, baseItems)} onClick={() => set(baseItems)} />
            </div>
            {field.help && <span className="rowHelp listHelp">{field.help}</span>}

            {items.length === 0 && <p className="empty">Todavía no hay ninguno.</p>}

            <div className="cards" {...listProps}>
            {items.map((item, i) => {
                const title = String(item[field.itemTitle] || "").trim();
                const isOpen = open === i;
                const itemChanged = !same(item, baseItems[i]);
                const isNew = i >= baseItems.length;
                return (
                    <div className={`card ${isOpen ? "isOpen" : ""} ${itemChanged ? "isChanged" : ""}${dragClass(i)}`} key={i}>
                        <div className="cardHead">
                            {items.length > 1 && <span className="wordGrip cardGrip" {...gripProps(i, title)} />}
                            <button
                                type="button"
                                className="cardTitle"
                                onClick={() => setOpen(isOpen ? -1 : i)}
                            >
                                <span className="caret">{isOpen ? "▾" : "▸"}</span>
                                {title || (field.itemNumbered ? `${field.itemNumbered} ${i + 1}` : `Sin título (${i + 1})`)}
                            </button>
                            <Revert
                                show={itemChanged}
                                tag={isNew ? "Nuevo" : "Cambiado"}
                                onClick={() => {
                                    if (isNew) remove(i);
                                    else set(items.map((it, j) => (j === i ? baseItems[i] : it)));
                                }}
                            />
                            <span className="cardTools">
                                <button
                                    type="button"
                                    className="danger"
                                    aria-label="Quitar"
                                    onClick={() => {
                                        if (!window.confirm(`¿Quitar «${title || "este"}»? Se puede deshacer con Descartar.`)) return;
                                        remove(i);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        </div>
                        {isOpen && (
                            <div className="cardBody">
                                <FieldList
                                    fields={field.fields}
                                    obj={item}
                                    base={baseItems[i]}
                                    onPatch={(patch) => patchItem(i, patch)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            </div>

            {/* Under the list, where the new entry will appear — and clear of
                the undo beside the list's name, which it used to crowd. */}
            {picking && (
                <SourcePicker
                    field={field}
                    items={items}
                    onClose={() => setPicking(false)}
                    onPick={(entry) => {
                        // A copy with every key of the type, even ones the
                        // entry on the other page happens to be missing.
                        set([...items, { ...blank(), ...JSON.parse(JSON.stringify(entry)) }]);
                        setPicking(false);
                    }}
                />
            )}

            <div className="listAdds">
                {field.source && !picking && (
                    <button type="button" className="addBtn listAdd" onClick={() => setPicking(true)}>
                        + Elegir {field.itemNoun ? `un ${field.itemNoun}` : "uno"} de {field.source.label}
                    </button>
                )}
                <button
                    type="button"
                    className={`addBtn listAdd ${field.source ? "isQuiet" : ""}`}
                    onClick={() => {
                        set([...items, blank()]);
                        setOpen(items.length);
                        setPicking(false);
                    }}
                >
                    {field.source ? "+ Escribir uno nuevo" : `+ Añadir ${field.itemNoun || "uno"}`}
                </button>
            </div>
        </div>
    );
}

/* --- The dispatcher ------------------------------------------------------- */

/* A group folds shut like a list item. It starts closed unless the schema says
   `open`, which is for a group that is the whole point of its section. */
function GroupField({ field, obj, base, onPatch }) {
    const [open, setOpen] = useState(!!field.open);
    const changed = !same(obj[field.name], base?.[field.name]);
    const patchInside = (patch) => onPatch({ [field.name]: { ...(obj[field.name] || {}), ...patch } });
    // `flat`: the fields sit in the list with everything else, with no card
    // to open. Only where they live in the file is grouped.
    if (field.flat) {
        return (
            <FieldList
                fields={field.fields}
                obj={obj[field.name] || {}}
                base={base?.[field.name]}
                onPatch={patchInside}
            />
        );
    }
    return (
        <div className={`card group ${open ? "isOpen" : ""} ${changed ? "isChanged" : ""}`}>
            <div className="cardHead">
                <button type="button" className="cardTitle" onClick={() => setOpen(!open)}>
                    <span className="caret">{open ? "▾" : "▸"}</span>
                    {field.label}
                </button>
                <Revert
                    show={changed}
                    onClick={() => onPatch({ [field.name]: base?.[field.name] ?? {} })}
                />
            </div>
            {open && (
                <div className="cardBody">
                    {field.help && <span className="rowHelp groupHelp">{field.help}</span>}
                    <FieldList
                        fields={field.fields}
                        obj={obj[field.name] || {}}
                        base={base?.[field.name]}
                        onPatch={patchInside}
                    />
                </div>
            )}
        </div>
    );
}

/* A word chosen from a list rather than typed, so a class or a genre is always
   spelled the same way — the site groups by the exact word. The words on offer
   come from the list that owns them ({ file, path, field }; no `field` when the
   list holds plain words), so removing one there removes it here. An entry
   still carrying a removed word keeps it, marked, until another is chosen. */
function gather(draft, sources) {
    const seen = new Map();
    for (const { file, path, field } of sources) {
        let list = draft?.[file];
        for (const step of path.split(".")) list = list?.[step];
        if (!Array.isArray(list)) continue;
        for (const entry of list) {
            const word = String((field ? entry?.[field] : entry) || "").trim();
            if (word && !seen.has(word.toLowerCase())) seen.set(word.toLowerCase(), word);
        }
    }
    return [...seen.values()];
}

function CategoryField({ field, value, changed, onRevert, set }) {
    const draft = useContext(DraftContext);
    const options = gather(draft, field.optionsFrom);
    const current = String(value || "").trim();
    const listed = current === "" || options.includes(current);

    return (
        <Row field={field} changed={changed} onRevert={onRevert}>
            <select className="choice" value={current} onChange={(e) => set(e.target.value)}>
                <option value="">{field.emptyLabel || "— Ninguno —"}</option>
                {!listed && <option value={current}>{current} (ya no está en la lista)</option>}
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </Row>
    );
}

function Field({ field, obj, base, onPatch }) {
    const value = obj?.[field.name] ?? "";
    const baseValue = base?.[field.name] ?? "";
    const changed = !same(value, baseValue);
    const revert = () => onPatch({ [field.name]: baseValue });
    const set = (v) => onPatch({ [field.name]: v });

    if (field.kind === "image") {
        return <ImageField field={field} obj={obj} base={base} onPatch={onPatch} />;
    }
    if (field.kind === "words") {
        return <WordsField field={field} obj={obj} base={base} onPatch={onPatch} />;
    }
    if (field.kind === "list") {
        return <ListField field={field} obj={obj} base={base} onPatch={onPatch} />;
    }
    if (field.kind === "group") {
        return <GroupField field={field} obj={obj} base={base} onPatch={onPatch} />;
    }

    // The site's colours: one card per theme, with a strip of its colours.
    if (field.kind === "theme") {
        const current = value || "papel";
        // Everyday themes first, then each `group` ("Fiestas") under its name.
        const groups = [];
        for (const t of field.options) {
            const name = t.group || "";
            let g = groups.find((x) => x.name === name);
            if (!g) groups.push((g = { name, items: [] }));
            g.items.push(t);
        }
        return (
            <Row as="div" field={field} changed={changed} onRevert={revert} className="isChooser">
                {groups.map((g) => (
                    <div className="themeGroup" key={g.name || "base"}>
                        {g.name && <span className="themeGroupName">{g.name}</span>}
                        <span className="themes">
                            {g.items.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    className={`themeCard ${current === t.value ? "isOn" : ""}`}
                                    onClick={() => set(t.value)}
                                    aria-pressed={current === t.value}
                                >
                                    <span
                                        className="themeSwatches"
                                        style={{ borderRadius: t.radius }}
                                        aria-hidden="true"
                                    >
                                        {t.colors.map((c, i) => <span key={i} style={{ background: c }} />)}
                                    </span>
                                    <span className="themeName">{t.label}</span>
                                    <span className="themeNote">{t.note}</span>
                                </button>
                            ))}
                        </span>
                    </div>
                ))}
            </Row>
        );
    }

    // Yes or no, as a switch with its word beside it. A missing value is the
    // field's default, so a site file written before the field existed behaves.
    if (field.kind === "onoff") {
        const raw = obj?.[field.name];
        const on = raw === undefined || raw === "" ? field.default !== false : raw !== false;
        return (
            <Row as="div" field={field} changed={changed} onRevert={revert}>
                <span className="onoff">
                    <button
                        type="button"
                        className={`switch ${on ? "isOn" : ""}`}
                        onClick={() => set(!on)}
                        role="switch"
                        aria-checked={on}
                        aria-label={field.label}
                    >
                        <span />
                    </button>
                    <span className="switchWord">{on ? "Encendido" : "Apagado"}</span>
                </span>
            </Row>
        );
    }

    // A font: one card per face, each writing its sample in that face, so she
    // chooses by looking rather than by name.
    if (field.kind === "font") {
        const current = value || field.defaultValue || field.options[0].value;
        // Grouped like the theme cards: Clásicas, Modernas, Manuscritas.
        const groups = [];
        for (const o of field.options) {
            let g = groups.find((x) => x.name === (o.group || ""));
            if (!g) groups.push((g = { name: o.group || "", items: [] }));
            g.items.push(o);
        }
        return (
            <Row as="div" field={field} changed={changed} onRevert={revert} className="isChooser">
                {groups.map((g) => (
                    <div className="themeGroup" key={g.name || "all"}>
                        {g.name && <span className="themeGroupName">{g.name}</span>}
                        <span className={`fonts ${field.small ? "isSmall" : ""}`}>
                            {g.items.map((o) => (
                                <button
                                    key={o.value}
                                    type="button"
                                    className={`fontCard ${current === o.value ? "isOn" : ""}`}
                                    onClick={() => set(o.value)}
                                    aria-pressed={current === o.value}
                                >
                                    <span
                                        className="fontSample"
                                        style={{
                                            fontFamily: o.family,
                                            fontWeight: field.small ? 400 : o.weight ?? 600,
                                        }}
                                    >
                                        {field.sample}
                                    </span>
                                    <span className="themeName">{o.label}</span>
                                    <span className="themeNote">{o.note}</span>
                                </button>
                            ))}
                        </span>
                    </div>
                ))}
            </Row>
        );
    }

    // A fixed set of words the site understands, shown by their names. A value
    // the list does not know is kept and shown as it is, never silently lost.
    if (field.kind === "category") {
        return <CategoryField field={field} value={value} changed={changed} onRevert={revert} set={set} />;
    }

    if (field.kind === "choice") {
        const known = field.options.some((o) => o.value === value);
        return (
            <Row field={field} changed={changed} onRevert={revert}>
                <select className="choice" value={value} onChange={(e) => set(e.target.value)}>
                    {!known && <option value={value}>{value || "—"}</option>}
                    {field.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </Row>
        );
    }

    if (field.kind === "prose" || field.kind === "poem") {
        return (
            <Row field={field} changed={changed} onRevert={revert}>
                <textarea
                    className={field.kind === "poem" ? "poem" : ""}
                    rows={field.rows || (field.kind === "poem" ? 10 : 4)}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                />
                {!field.help && (
                    <span className="rowHelp">
                        {field.kind === "poem"
                            ? "Cada salto de línea se respeta. Una línea en blanco abre una estrofa."
                            : "Una línea en blanco separa un párrafo del siguiente."}
                    </span>
                )}
            </Row>
        );
    }

    if (field.kind === "video") {
        const kind = !value.trim()
            ? "Vacío — queda el marco de reserva."
            : /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i.test(value.trim())
                ? "Se leyó como un archivo de video de public/content/."
                : "Se leyó como un enlace a un video de internet.";
        return (
            <Row field={field} changed={changed} onRevert={revert}>
                <input type="text" value={value} onChange={(e) => set(e.target.value)} />
                <span className="rowHelp">{kind}</span>
            </Row>
        );
    }

    if (field.kind === "url") {
        return (
            <Row field={field} changed={changed} onRevert={revert}>
                <span className="urlRow">
                    <input type="text" value={value} onChange={(e) => set(e.target.value)} />
                    {value.trim() && (
                        <a href={value} target="_blank" rel="noreferrer" className="linkBtn">probar ↗</a>
                    )}
                </span>
            </Row>
        );
    }

    return (
        <Row field={field} changed={changed} onRevert={revert}>
            <input type="text" value={value} onChange={(e) => set(e.target.value)} />
        </Row>
    );
}

export function FieldList({ fields, obj, base, onPatch }) {
    return fields.map((f) => (
        <Field key={f.name} field={f} obj={obj || {}} base={base} onPatch={onPatch} />
    ));
}
