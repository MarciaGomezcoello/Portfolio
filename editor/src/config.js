/* Where the preview lives.

   Running from a terminal it is the site's own dev server on :3000. Inside the
   Mac app it is a bundled copy of the site on whatever port was free. The
   screen asks rather than assumes, so the same build works either way. */

let previewUrl = "http://localhost:3000";

export function getPreviewUrl() {
    return previewUrl;
}

export async function loadConfig() {
    try {
        const res = await fetch("/api/config");
        if (res.ok) {
            const data = await res.json();
            if (data.previewUrl) previewUrl = data.previewUrl;
            return data;
        }
    } catch {
        /* Falls back to the dev server, which is the right guess when the API
           is being reached through Vite's proxy. */
    }
    return { previewUrl };
}
