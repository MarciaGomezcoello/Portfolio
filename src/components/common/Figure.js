import { useEffect, useRef, useState } from "react";
import { asset } from "../../content/site";
import Placeholder from "./Placeholder";
import { remember, useNaturalRatio } from "./naturalRatio";
import { useVisor } from "./Visor";
import "./Figure.css";

/* ============================================================================
   Figure — a picture, or the reserved frame that waits for one.

   Components never branch on whether an image exists; they render a Figure and
   pass the `kind` of picture that belongs there. A missing file name, a typo,
   or a photo that has not been uploaded yet all land on the same designed
   placeholder rather than a broken-image icon.

   A photo that exists but has not downloaded yet gets the same treatment: the
   image carries the reserved frame's woven ground as its own background until
   it has loaded, so a page of pictures fills with frames and then with photos,
   never with blank white boxes. The space was already reserved by the ratio, so
   nothing moves when the picture lands.

   Everything is lazy except what `priority` marks. Laziness is the right
   default for a shelf of fourteen covers, but it is the wrong answer for the
   ones already on screen when the page opens: a lazy image is not fetched until
   layout has been worked out and is then queued behind the rest of the page, so
   marking the first row lazy is what makes the first row slow. Pass `priority`
   for pictures that are visible without scrolling.

   Pass `zoom` — this picture's own `{ src, alt, caption, note }` — and pressing
   it opens the viewer on it. Each picture is independent: there is no band to
   step through. A reserved frame never takes it, because the early return below
   happens first, so a photograph that has not been uploaded yet is not
   pressable and no caller has to check.
   ============================================================================ */

function Figure({
    src, alt = "", kind = "portrait", ratio = "4 / 5", label, className = "",
    priority = false, zoom,
}) {
    const openVisor = useVisor();
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const ref = useRef(null);
    const resolved = asset(src);

    // `ratio` is what the frame reserves before the file is known. Once it is
    // known the frame takes the picture's own proportion, so nothing is left
    // holding a band of empty ground beside a photograph that turned out to be
    // a different shape from the word it was filed under.
    const shape = useNaturalRatio(src, ratio);

    // An image already in the browser's cache can finish before React has the
    // node, and its load event is then long gone — so its measurement would be
    // missed too.
    useEffect(() => {
        const el = ref.current;
        if (!el || !el.complete) return;
        setLoaded(true);
        remember(src, el.naturalWidth, el.naturalHeight);
    }, [src, resolved]);

    if (!resolved || failed) {
        return <Placeholder kind={kind} ratio={ratio} label={label} className={className} />;
    }

    // The picture is left an <img> rather than wrapped in a button: it sits
    // inside album corners, a clothesline and framed slots whose CSS reaches
    // for it directly, and an extra element between them would move all three.
    const canZoom = !!zoom;
    const open = () => openVisor(zoom);

    return (
        <img
            ref={ref}
            className={`figureImg ${loaded ? "" : `isLoading ph-${kind}`} ${
                canZoom ? "canZoom" : ""
            } ${className}`}
            role={canZoom ? "button" : undefined}
            tabIndex={canZoom ? 0 : undefined}
            onClick={canZoom ? open : undefined}
            onKeyDown={
                canZoom
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              open();
                          }
                      }
                    : undefined
            }
            style={{ aspectRatio: shape }}
            src={resolved}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={(e) => {
                setLoaded(true);
                remember(src, e.target.naturalWidth, e.target.naturalHeight);
            }}
            onError={() => setFailed(true)}
        />
    );
}

export default Figure;
