import { useEffect } from "react";

/* ============================================================================
   Hold the page still while something covers it.

   `overflow: hidden` on the body is enough on a desktop browser but iOS Safari
   scrolls straight through it, which slides the page behind whatever is over it
   and reads as the two overlapping. Pinning the body in place and restoring the
   offset afterwards is what actually holds there.

   Both the navigation drawer and the picture viewer need this, and they are the
   only two things on the site that cover the page. They can never be open at
   once — the drawer covers the viewer's trigger — so the lock is never nested.
   ============================================================================ */

export default function useBodyLock(active) {
    useEffect(() => {
        if (!active) return undefined;

        const { style } = document.body;
        const scrollY = window.scrollY;
        const previous = {
            position: style.position,
            top: style.top,
            left: style.left,
            right: style.right,
            overflow: style.overflow,
        };

        style.position = "fixed";
        style.top = `-${scrollY}px`;
        style.left = "0";
        style.right = "0";
        style.overflow = "hidden";

        return () => {
            style.position = previous.position;
            style.top = previous.top;
            style.left = previous.left;
            style.right = previous.right;
            style.overflow = previous.overflow;
            // The page must land back where it was without animating — the
            // document has smooth scrolling switched on globally.
            window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
        };
    }, [active]);
}
