import { useEffect, useRef, useState } from "react";
import "./Reveal.css";

/* ============================================================================
   Reveal — fades a block up as it scrolls into view.

   One IntersectionObserver per block, disconnected as soon as it has fired, so
   nothing keeps observing after the animation is spent. Anyone who has asked
   their system for reduced motion is shown the content immediately.

   A card in a grid (`as="li"`) is quicker about it than a heading. A page of
   photographs is read by scrolling down it, and with the heading's timing each
   row of cards only began to appear as it reached the screen and then took
   over a second to arrive — the grid read as slow to load even when every
   photograph was already there. So a card starts well below the screen, before
   it is reached, and its fade is short and barely staggered.
   ============================================================================ */

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);
    const card = Tag === "li";

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
            setShown(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            // Fires as a block comes up on the fold rather than once it is
            // already well inside it. The old margin was negative — a block had
            // to be 60px past the bottom edge and an eighth visible before it
            // began — so on a long page of pictures the reader arrived before
            // the fade did, and the page read as slow when it was only late.
            { threshold: 0, rootMargin: card ? "0px 0px 60% 0px" : "0px 0px 14% 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [card]);

    return (
        <Tag
            ref={ref}
            className={`reveal ${card ? "isCard" : ""} ${shown ? "isShown" : ""} ${className}`}
            style={{ transitionDelay: `${card ? Math.min(delay / 2, 120) : delay}ms` }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

export default Reveal;
