/* ============================================================================
   A video link, as copied from the site it lives on, made into a player.

   YouTube and Vimeo will only play inside another site from their "embed"
   address. The link anyone copies — from the address bar, or the Share button
   — is the watch page, which they refuse to show in a frame, so pasting it
   gave a broken player with no warning. The video's ID is right there in the
   link, though, so the embed address is worked out from the text alone:
   nothing is fetched and nothing is asked of YouTube.

   Used in two places, so it has no imports: by the site, which plays whatever
   is written in the JSON, and by the editor, which turns a pasted link into
   the embed address the moment it is pasted.
   ============================================================================ */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// "1h2m3s", "90s", "90" → seconds. YouTube writes a start time several ways.
function seconds(value) {
    if (!value) return 0;
    if (/^\d+$/.test(value)) return Number(value);
    const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
    if (!m) return 0;
    return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
}

function youtubeEmbed(id, start) {
    return `https://www.youtube.com/embed/${id}${start > 0 ? `?start=${start}` : ""}`;
}

/* The embed address for a YouTube or Vimeo link, or null when the text is not
   one of those — a video file, or a link from somewhere else, which is used
   exactly as written. */
export function videoEmbed(text) {
    if (typeof text !== "string") return null;
    let url;
    try {
        url = new URL(text.trim());
    } catch {
        return null;
    }
    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
    const parts = url.pathname.split("/").filter(Boolean);
    const start = seconds(url.searchParams.get("t") || url.searchParams.get("start"));

    if (host === "youtu.be") {
        return YOUTUBE_ID.test(parts[0] || "") ? youtubeEmbed(parts[0], start) : null;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
        if (parts[0] === "watch") {
            const id = url.searchParams.get("v") || "";
            return YOUTUBE_ID.test(id) ? youtubeEmbed(id, start) : null;
        }
        if (["embed", "shorts", "live", "v"].includes(parts[0])) {
            return YOUTUBE_ID.test(parts[1] || "") ? youtubeEmbed(parts[1], start) : null;
        }
        return null;
    }
    if (host === "vimeo.com" && /^\d+$/.test(parts[0] || "")) {
        return `https://player.vimeo.com/video/${parts[0]}`;
    }
    if (host === "player.vimeo.com" && parts[0] === "video" && /^\d+$/.test(parts[1] || "")) {
        return `https://player.vimeo.com/video/${parts[1]}`;
    }
    return null;
}
