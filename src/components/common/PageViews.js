import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/* Visit counting, through GoatCounter — no cookies, so no consent banner.
   The numbers are private: they show on her GoatCounter dashboard, never on
   the site.

   The site changes pages without reloading, so GoatCounter is told not to
   count on its own and each route change is counted here instead. Only the
   published build counts: the dev server and the copy inside the editing app
   would otherwise add her own visits. */
const GOATCOUNTER = "marciagomezcoello";

const COUNTS =
    Boolean(GOATCOUNTER) &&
    process.env.NODE_ENV === "production" &&
    process.env.REACT_APP_PREVIEW !== "1";

let loading = null;

function loadGoatCounter() {
    if (!loading) {
        loading = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.async = true;
            script.src = "https://gc.zgo.at/count.js";
            script.dataset.goatcounter = `https://${GOATCOUNTER}.goatcounter.com/count`;
            script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
            script.onload = () => resolve(window.goatcounter);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    return loading;
}

function PageViews() {
    const { pathname } = useLocation();
    const last = useRef(null);

    useEffect(() => {
        if (!COUNTS || last.current === pathname) return;
        last.current = pathname;
        loadGoatCounter()
            .then((gc) => gc?.count?.({ path: pathname }))
            .catch(() => {
                // Blocked by an ad blocker or offline: the page is unaffected.
            });
    }, [pathname]);

    return null;
}

export default PageViews;
