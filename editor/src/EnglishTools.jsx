import { useState } from "react";
import { englishFromTranslation, englishIsBehind, spanishForTranslation } from "./english.js";

/* ============================================================================
   Ajustes › Inglés.

   Three steps, written the way she would do them: copy the Spanish, get it
   translated anywhere, paste the answer back. The English is built from the
   paste over the current Spanish (see english.js) and, like every other
   change, reaches the site only when she presses Aplicar.
   ============================================================================ */

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Older route, for a window where the clipboard API is not allowed.
        const area = document.createElement("textarea");
        area.value = text;
        area.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
    }
}

export default function EnglishTools({ draft, base, setDraft, onSeeEnglish }) {
    const [copied, setCopied] = useState("");
    const [pasted, setPasted] = useState("");
    const [result, setResult] = useState(null); // { kind: "ok" | "bad", text }

    const hasEnglish = Object.keys(draft.en || {}).length > 0;
    const behind = hasEnglish && englishIsBehind(draft, draft.en);

    const copy = async () => {
        const text = spanishForTranslation(draft);
        const ok = await copyText(text);
        setCopied(ok ? "Copiado. Ahora péguelo en el traductor." : "No se pudo copiar. Pruebe otra vez.");
    };

    const use = () => {
        try {
            const { en, total, done } = englishFromTranslation(draft, pasted);
            setDraft((d) => ({ ...d, en }));
            setPasted("");
            setResult({
                kind: done === total ? "ok" : "warn",
                text:
                    done === total
                        ? `Listo: los ${total} textos están en inglés. Revise la vista previa y presione Aplicar.`
                        : `Se tradujeron ${done} de ${total} textos; los demás quedan en español. Presione Aplicar para guardarlo así, o pida la traducción otra vez.`,
            });
        } catch (err) {
            setResult({ kind: "bad", text: err.message });
        }
    };

    return (
        <div className="english">
            <p className={`englishStatus ${!hasEnglish || behind ? "isWarn" : "isOk"}`}>
                {!hasEnglish
                    ? "Todavía no hay versión en inglés."
                    : behind
                        ? "El español cambió desde la última traducción (un libro, una foto, una sección). Conviene traducir otra vez: hasta entonces, la versión en inglés no muestra esos cambios."
                        : !same(draft.en, base.en)
                            ? "Hay una traducción nueva sin guardar."
                            : "El inglés está al día con el español."}
            </p>

            <ol className="englishSteps">
                <li className="englishStep">
                    <span className="englishStepTitle">Copie el español</span>
                    <span className="rowHelp">
                        Copia todos los textos del sitio, ordenados, con las instrucciones
                        para quien traduce ya puestas arriba.
                    </span>
                    <span className="englishTools">
                        <button type="button" className="picBtn" onClick={copy}>
                            Copiar el español
                        </button>
                        {copied && <span className="picMeta">{copied}</span>}
                    </span>
                </li>
                <li className="englishStep">
                    <span className="englishStepTitle">Tradúzcalo</span>
                    <span className="rowHelp">
                        Péguelo en ChatGPT, Claude, Gemini o el traductor que prefiera, y
                        copie la respuesta completa.
                    </span>
                </li>
                <li className="englishStep">
                    <span className="englishStepTitle">Pegue la traducción aquí</span>
                    <textarea
                        className="englishPaste"
                        rows={6}
                        value={pasted}
                        placeholder="Pegue aquí la respuesta del traductor…"
                        onChange={(e) => {
                            setPasted(e.target.value);
                            setResult(null);
                        }}
                    />
                    <span className="englishTools">
                        <button type="button" className="picBtn" onClick={use} disabled={!pasted.trim()}>
                            Usar esta traducción
                        </button>
                        {hasEnglish && (
                            <button type="button" className="picBtn quiet" onClick={onSeeEnglish}>
                                Ver en inglés
                            </button>
                        )}
                    </span>
                    {result && <span className={`englishResult is-${result.kind}`}>{result.text}</span>}
                </li>
            </ol>
        </div>
    );
}

function same(a, b) {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
