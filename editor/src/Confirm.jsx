import { useEffect, useRef } from "react";

/* A question asked inside the window rather than by the system, so it can say
   exactly what is about to happen. Escape or a click outside is "no". */
export default function Confirm({ title, children, yes, danger, onYes, onNo }) {
    const yesRef = useRef(null);
    const noRef = useRef(onNo);
    noRef.current = onNo;
    useEffect(() => {
        yesRef.current?.focus();
        const onKey = (e) => {
            if (e.key === "Escape") noRef.current();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    return (
        <div className="modalBack" onMouseDown={(e) => e.target === e.currentTarget && onNo()}>
            <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="modalTitle">
                <h2 id="modalTitle" className="modalTitle">{title}</h2>
                <div className="modalBody">{children}</div>
                <div className="modalTools">
                    <button type="button" className="btn ghost" onClick={onNo}>Cancelar</button>
                    <button
                        type="button"
                        ref={yesRef}
                        className={`btn solid ${danger ? "danger" : ""}`}
                        onClick={onYes}
                    >
                        {yes}
                    </button>
                </div>
            </div>
        </div>
    );
}
