import { useEffect, useRef, useState } from "react";
import "./Reveal.css";

/* ============================================================================
   Reveal — fades a block up as it scrolls into view.

   One IntersectionObserver per block, disconnected as soon as it has fired, so
   nothing keeps observing after the animation is spent. Anyone who has asked
   their system for reduced motion is shown the content immediately.
   ============================================================================ */

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

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
            { threshold: 0, rootMargin: "0px 0px 14% 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`reveal ${shown ? "isShown" : ""} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

export default Reveal;
