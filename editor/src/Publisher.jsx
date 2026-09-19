import { useCallback, useEffect, useState } from "react";
import Confirm from "./Confirm.jsx";

/* ============================================================================
   Ajustes › Publicar.

   Aplicar is the save on this Mac. Publicar takes what is saved — Spanish and
   English together — keeps it as a version, and sends it to GitHub as a commit
   (see sendToInternet in server.js). Any version can be brought back: it opens
   in the editor like any other change, so she looks at it in the preview, and
   Aplicar and Publicar make it the site again. Descartar, before that, leaves
   things as they were. Going back never deletes a version; publishing the old
   one simply becomes the newest.

   A version kept but not uploaded — no internet, say — is `pending`, and the
   button offers to send it again.
   ============================================================================ */

const DATE = new Intl.DateTimeFormat("es", {
    day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit",
});

function when(iso) {
    try {
        return DATE.format(new Date(iso));
    } catch {
        return iso;
    }
}

function joined(names) {
    if (names.length <= 1) return names[0] || "";
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

export default function Publisher({ base, dirty, changed, summarize, onOpenVersion, onReload }) {
    const [data, setData] = useState(null); // { versions, kept, upToDate, uploads, pending }
    const [newest, setNewest] = useState(null); // the newest version's contents
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null); // { kind, text }
    const [asking, setAsking] = useState(null); // "publicar" or a version

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/versiones");
            const next = await res.json();
            if (!res.ok) throw new Error(next.error);
            setData(next);
            const top = next.versions[0];
            setNewest(top ? await (await fetch(`/api/versiones/${top.id}`)).json() : null);
        } catch (err) {
            setResult({ kind: "bad", text: `No se pudieron leer las versiones: ${err.message || err}` });
        }
    }, []);

    // Asked again whenever the saved site changes, which is what Aplicar does.
    useEffect(() => { refresh(); }, [refresh, base]);

    // What this publish carries, measured against the last one.
    const news = newest ? summarize(base, newest.content) : [];
    const first = data && data.versions.length === 0;
    const canPublish = data && !dirty && !busy && (!data.upToDate || data.pending);

    async function publish() {
        setBusy(true);
        setResult(null);
        try {
            const changes = first ? ["Primera versión"] : news.length ? news : ["Cambios pequeños"];
            const res = await fetch("/api/publicar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ changes, note }),
            });
            const out = await res.json();
            if (!res.ok) throw new Error(out.error || "No se pudo publicar.");
            setNote("");
            setResult(
                out.uploaded
                    ? { kind: "ok", text: "Publicado. Los cambios se subieron a internet." }
                    : out.problem
                        ? {
                            kind: "bad",
                            text: `La versión quedó guardada en esta computadora, pero no se pudo subir: ${out.problem}. Presione «Subir otra vez» para intentarlo de nuevo.`,
                        }
                        : { kind: "ok", text: "Versión guardada en esta computadora." }
            );
            // Other changes came down from GitHub with it: the editor reads
            // the files again, so the next Aplicar starts from them.
            if (out.pulled) await onReload();
            await refresh();
        } catch (err) {
            setResult({ kind: "bad", text: String(err.message || err) });
        } finally {
            setBusy(false);
        }
    }

    async function openVersion(version) {
        try {
            const res = await fetch(`/api/versiones/${version.id}`);
            const full = await res.json();
            if (!res.ok) throw new Error(full.error);
            onOpenVersion(full.content);
            setResult({
                kind: "ok",
                text: `La versión del ${when(version.date)} está en el editor. Mírela en la vista previa; presione Aplicar para guardarla o Descartar para dejarlo como estaba.`,
            });
        } catch (err) {
            setResult({ kind: "bad", text: `No se pudo abrir esa versión: ${err.message || err}` });
        }
    }

    if (!data) {
        return <p className="formHelp">{result ? result.text : "Buscando las versiones…"}</p>;
    }

    let status;
    if (dirty) {
        status = {
            kind: "isWarn",
            text: `Hay cambios sin aplicar: ${joined(changed)}. Se publica lo guardado, así que presione Aplicar primero.`,
        };
    } else if (data.pending) {
        status = {
            kind: "isWarn",
            text: "La última versión quedó guardada aquí, pero no llegó a internet. Presione «Subir otra vez».",
        };
    } else if (data.upToDate) {
        status = { kind: "isOk", text: "Lo guardado ya está publicado. No hay nada nuevo." };
    } else if (first) {
        status = { kind: "isWarn", text: "Todavía no se ha publicado ninguna versión." };
    } else {
        status = {
            kind: "isWarn",
            text: `Listo para publicar: ${news.length ? joined(news) : "cambios pequeños"}.`,
        };
    }

    return (
        <div className="publisher">
            <p className={`englishStatus ${status.kind}`}>{status.text}</p>

            <div className="publishBox">
                <label className="publishNote">
                    <span className="rowLabel">Una nota para acordarse</span>
                    <span className="rowHelp">
                        Opcional. Sale en la lista de versiones, por ejemplo «el encuentro de octubre».
                    </span>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={!canPublish}
                    />
                </label>
                <span className="englishTools">
                    <button
                        type="button"
                        className="btn solid"
                        disabled={!canPublish}
                        onClick={() => setAsking("publicar")}
                    >
                        {busy ? "Publicando…" : data.pending ? "Subir otra vez" : "Publicar el sitio"}
                    </button>
                </span>
                {!data.uploads && (
                    <span className="rowHelp">
                        Esta carpeta del sitio no está conectada a GitHub, así que publicar solo
                        guarda la versión en esta computadora.
                    </span>
                )}
                {result && <span className={`englishResult is-${result.kind}`}>{result.text}</span>}
            </div>

            <div className="versions">
                <span className="rowLabel">Versiones publicadas</span>
                <span className="rowHelp">
                    Se guardan las últimas {data.kept}, con el español y el inglés. Cualquiera se
                    puede volver a abrir.
                </span>
                {data.versions.length === 0 ? (
                    <p className="versionsEmpty">Aquí aparecerá cada publicación.</p>
                ) : (
                    <ol className="versionList">
                        {data.versions.map((v, i) => (
                            <li key={v.id} className="version">
                                <span className="versionText">
                                    <span className="versionDate">
                                        {when(v.date)}
                                        {i === 0 && (
                                            data.pending
                                                ? <span className="versionTag isPending">Sin subir</span>
                                                : <span className="versionTag">La publicada</span>
                                        )}
                                    </span>
                                    {v.note && <span className="versionNote">{v.note}</span>}
                                    {v.changes.length > 0 && (
                                        <span className="rowHelp">{joined(v.changes)}</span>
                                    )}
                                </span>
                                <button type="button" className="picBtn" onClick={() => setAsking(v)}>
                                    Volver a esta
                                </button>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            {asking === "publicar" && (
                <Confirm
                    title="¿Publicar el sitio?"
                    yes="Sí, publicar"
                    onNo={() => setAsking(null)}
                    onYes={() => {
                        setAsking(null);
                        publish();
                    }}
                >
                    <p>Se publica todo lo guardado, en español y en inglés.</p>
                    {!first && news.length > 0 && (
                        <ul>
                            {news.map((name) => <li key={name}>{name}</li>)}
                        </ul>
                    )}
                    <p>Queda guardado como una versión a la que siempre se puede volver.</p>
                </Confirm>
            )}
            {asking && asking !== "publicar" && (
                <Confirm
                    title="¿Volver a esta versión?"
                    yes="Sí, abrirla"
                    danger={dirty}
                    onNo={() => setAsking(null)}
                    onYes={() => {
                        const v = asking;
                        setAsking(null);
                        openVersion(v);
                    }}
                >
                    <p>
                        La versión del {when(asking.date)} se abre en el editor. Nada se guarda
                        todavía: mírela en la vista previa, y si es la que quiere, presione Aplicar
                        y después Publicar.
                    </p>
                    {dirty && (
                        <p>Lo que cambió sin aplicar ({joined(changed)}) se pierde.</p>
                    )}
                    <p>No se borra ninguna versión.</p>
                </Confirm>
            )}
        </div>
    );
}
