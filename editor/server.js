import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

/* ============================================================================
   The editor's file side — and the ONLY part of this app that touches the site.

   Nothing here writes to the site while she types. The screen holds her words
   and shows them in the preview by posting them into the page; the site's
   files are opened for writing exactly once, when she presses Aplicar.

   What she has not applied is still kept, as the soft draft: the screen sends
   it here after every change and it is written to `.borrador/`, beside the
   site's files but not among them. Closing the app, a crash or the Mac
   restarting loses nothing, and reopening lays it back over the saved site
   with every Cambiado and ↺ Deshacer mark where it was. Aplicar and Descartar
   are what end it.

   A photo she chooses is copied at once into `.borrador/fotos/` — safe from her
   moving or deleting the original. Aplicar copies it into the site; Descartar
   throws it away.
   ============================================================================ */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = ["site", "home", "libros", "arte", "tejidos", "eventos", "biografia"];

/* Where the site is. Unpacked, the editor sits inside it; packaged into a Mac
   app it does not, and the app hands the folder in. A path only counts if it
   actually holds the content files, so a wrong one is refused rather than
   half-working. */
export function isSite(dir) {
    if (!dir) return false;
    try {
        fsSync.accessSync(path.join(dir, "src", "content", "home.json"));
        return true;
    } catch {
        return false;
    }
}

export function findSite(preferred) {
    const tries = [preferred, process.env.MARCIA_SITE, path.resolve(HERE, "..")];
    return tries.find((dir) => isSite(dir)) || null;
}

/* The folder in use. Set once when the servers start. */
let SITE = null;
const contentDir = () => path.join(SITE, "src", "content");
const imagesDir = () => path.join(SITE, "public", "content");

/* --- Reading and writing the content files -------------------------------- */

/* The English copy of each file lives in content/en/ under the same name. It
   is optional: a file with no English copy is simply absent from `en`. */
const enDir = () => path.join(contentDir(), "en");

async function readAll() {
    const out = { en: {} };
    for (const name of FILES) {
        const raw = await fs.readFile(path.join(contentDir(), `${name}.json`), "utf8");
        out[name] = JSON.parse(raw);
        try {
            out.en[name] = JSON.parse(await fs.readFile(path.join(enDir(), `${name}.json`), "utf8"));
        } catch {
            /* No English for this file yet. */
        }
    }
    return out;
}

/* The house style: four spaces, and a blank line between the top-level
   sections. She and the site's author both read these files by hand, so the
   shape they are in matters — a file this app rewrites should be
   indistinguishable from one written by a person. */
export function formatJson(value) {
    const parts = Object.entries(value).map(([key, section]) => {
        const body = JSON.stringify(section, null, 4)
            .split("\n")
            .map((line, i) => (i === 0 ? line : `    ${line}`))
            .join("\n");
        return `    ${JSON.stringify(key)}: ${body}`;
    });
    return `{\n${parts.join(",\n\n")}\n}\n`;
}

/* --- Pictures -------------------------------------------------------------
   A chosen photo is written to the soft draft's photo folder under a unique
   name that keeps the original one after "__", and the draft points at it by
   address (http://…/api/staging/<name>). The site renders any http address
   directly, so the preview shows it straight away. Aplicar is where it becomes
   a real file in public/content/ and the draft's address is replaced by that
   file's name.

   The unique name starts with the id of the editor that took it, so an editor
   tidying up never removes a photo another editor, still open on the same
   site, is using.
   -------------------------------------------------------------------------- */

const HEIC = /^\.(heic|heif)$/;
const run = promisify(execFile);
const PICTURE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

const draftDir = () => path.join(SITE, ".borrador");
const draftFile = () => path.join(draftDir(), "borrador.json");
const photosDir = () => path.join(draftDir(), "fotos");
const STAGED = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/api\/staging\/([^/?#]+)$/;

function slugify(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function isAlive(pid) {
    if (!Number.isInteger(pid) || pid <= 0) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch (err) {
        return err.code === "EPERM";
    }
}

/* The staged photos a piece of content points at, by their names. */
function stagedNamesIn(node, found = new Set()) {
    if (typeof node === "string") {
        const match = node.match(STAGED);
        if (match) found.add(path.basename(decodeURIComponent(match[1])));
    } else if (Array.isArray(node)) {
        node.forEach((item) => stagedNamesIn(item, found));
    } else if (node && typeof node === "object") {
        Object.values(node).forEach((item) => stagedNamesIn(item, found));
    }
    return found;
}

function readDraftSync() {
    try {
        return JSON.parse(fsSync.readFileSync(draftFile(), "utf8"));
    } catch {
        return null;
    }
}

/* A photo is kept while the soft draft on disk still points at it, or while
   the editor that took it is still open somewhere else. Everything else — a
   photo chosen and then replaced, applied, or discarded, or one left by an
   editor that crashed — is removed. Synchronous, so it can run as the process
   exits. */
export function tidyPhotos() {
    if (!SITE) return;
    let names = [];
    try {
        names = fsSync.readdirSync(photosDir());
    } catch {
        return;
    }
    const wanted = stagedNamesIn(readDraftSync()?.draft);
    for (const name of names) {
        if (wanted.has(name)) continue;
        const owner = Number.parseInt(name, 10);
        if (owner !== process.pid && isAlive(owner)) continue;
        fsSync.rmSync(path.join(photosDir(), name), { force: true });
    }
}

async function freeName(filename) {
    const ext = path.extname(filename).toLowerCase() || ".jpg";
    const base = slugify(path.basename(filename, path.extname(filename))) || "imagen";
    let candidate = `${base}${ext}`;
    let n = 2;
    // Never overwrite a picture already on the site: a new file with a name
    // that is taken gets a number, rather than quietly replacing something.
    for (;;) {
        try {
            await fs.access(path.join(imagesDir(), candidate));
            candidate = `${base}-${n++}${ext}`;
        } catch {
            return candidate;
        }
    }
}

/* Every staged address in the content becomes a file on the site. The same
   photo used in two places is copied once. */
async function materialise(node, written) {
    if (typeof node === "string") {
        const match = node.match(STAGED);
        if (!match) return node;
        const staged = path.basename(decodeURIComponent(match[1]));
        if (written.has(staged)) return written.get(staged);

        const filename = await freeName(staged.split("__").slice(1).join("__") || "imagen.jpg");
        await fs.mkdir(imagesDir(), { recursive: true });
        await fs.copyFile(path.join(photosDir(), staged), path.join(imagesDir(), filename));
        written.set(staged, filename);
        return filename;
    }
    if (Array.isArray(node)) {
        const out = [];
        for (const item of node) out.push(await materialise(item, written));
        return out;
    }
    if (node && typeof node === "object") {
        const out = {};
        for (const [k, v] of Object.entries(node)) out[k] = await materialise(v, written);
        return out;
    }
    return node;
}

/* --- Published versions ---------------------------------------------------
   Aplicar is the local save. Publicar takes what is saved — every Spanish file
   and every English one — and keeps it as a version she can go back to.

   A version is only the content files. Pictures need no copy: Aplicar never
   overwrites one (a taken name gets a number), so an old version's photos are
   still in public/content/ unless she deleted one from the gallery, which
   warns her first; going back then shows an empty frame there. That keeps a
   version at the size of the JSON, under 200KB, which is why fifty are kept
   rather than ten.

   The versions live in the site folder, in `.versiones/` — ignored by git — so
   they belong to the site rather than to whichever copy of the editor is open.
   One file per version, named by the moment it was published, so the names
   sort in order and cannot collide.

   A version is kept before anything goes to the internet, so a failed upload
   loses nothing: it stays marked as not uploaded, and the next Publicar tries
   that same version again rather than keeping a second copy of it.
   -------------------------------------------------------------------------- */

export const VERSIONS_KEPT = 50;
const versionsDir = () => path.join(SITE, ".versiones");
const VERSION_ID = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/;

async function versionIds() {
    try {
        const names = await fs.readdir(versionsDir());
        return names
            .map((n) => n.replace(/\.json$/, ""))
            .filter((id) => VERSION_ID.test(id))
            .sort()
            .reverse(); // newest first
    } catch {
        return [];
    }
}

async function writeVersion(version) {
    await fs.mkdir(versionsDir(), { recursive: true });
    await fs.writeFile(path.join(versionsDir(), `${version.id}.json`), JSON.stringify(version), "utf8");
}

async function readVersion(id) {
    if (!VERSION_ID.test(id)) return null;
    try {
        return JSON.parse(await fs.readFile(path.join(versionsDir(), `${id}.json`), "utf8"));
    } catch {
        return null;
    }
}

/* Every string in a piece of content, for asking whether a photo's name is
   among them. */
function stringsIn(node, found) {
    if (typeof node === "string") found.add(node);
    else if (Array.isArray(node)) node.forEach((v) => stringsIn(v, found));
    else if (node && typeof node === "object") Object.values(node).forEach((v) => stringsIn(v, found));
    return found;
}

/* What still names each photo, so deleting one can warn first: `site` is the
   saved site in both languages and the soft draft, `versions` every kept
   version. */
async function photosInUse() {
    const site = new Set();
    stringsIn(await readAll(), site);
    stringsIn(readDraftSync()?.draft, site);
    const versions = new Set();
    for (const id of await versionIds()) stringsIn((await readVersion(id))?.content, versions);
    return { site, versions };
}

/* Two copies of the site are the same when every file formats the same. */
function sameContent(a, b) {
    if (!a || !b) return false;
    return FILES.every(
        (name) =>
            formatJson(a[name] || {}) === formatJson(b[name] || {}) &&
            formatJson(a.en?.[name] || {}) === formatJson(b.en?.[name] || {})
    );
}

/* --- Uploading: a git commit and a push -----------------------------------
   The content files and the photos — and only those — are committed and pushed
   to `main` on GitHub. Anything else in the folder, such as unfinished work on
   the site's code, is never swept into her commit.

   Git runs with no terminal to ask for a password in, so a missing login fails
   at once with a message instead of waiting for an answer that never comes.
   The login is the Mac's own, kept by git's osxkeychain helper.

   When GitHub has commits this Mac does not (the site's code changed, say),
   the push is refused; hers is replayed on top of them and pushed again. When
   the two changed the same lines, nothing is forced: the replay is undone, the
   version stays on this Mac marked as not uploaded, and she is told.

   Then `npm run deploy` builds the site and puts it live (see deploy below).
   A failed build also leaves the version not uploaded, so «Subir otra vez»
   retries it.
   -------------------------------------------------------------------------- */

const PUBLISH_BRANCH = "main";
const PUBLISHED = ["src/content", "public/content"];
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: "0" };

class UploadProblem extends Error {}

async function git(args, timeout = 60000) {
    const { stdout } = await run("git", args, {
        cwd: SITE,
        env: GIT_ENV,
        timeout,
        maxBuffer: 16 * 1024 * 1024,
    });
    return stdout.trim();
}

/* Whether this folder can go to the internet at all: a git checkout with a
   remote to push to. */
async function canUpload() {
    try {
        return Boolean(await git(["remote", "get-url", "origin"], 10000));
    } catch {
        return false;
    }
}

/* What went wrong, in her words. */
function uploadProblem(err) {
    if (err instanceof UploadProblem) return err.message;
    const text = `${err.stderr || ""}\n${err.message || ""}`;
    if (err.code === "ENOENT" || /xcrun|command line tools/i.test(text)) return "falta git en esta computadora";
    if (err.killed) return "internet tardó demasiado en responder";
    if (/could not resolve host|unable to access|failed to connect|timed out|network is unreachable/i.test(text)) {
        return "no hay conexión a internet";
    }
    if (/authentication failed|could not read username|permission denied|403|terminal prompts disabled/i.test(text)) {
        return "GitHub no aceptó el acceso guardado en esta computadora";
    }
    return `git respondió: ${text.split("\n").map((l) => l.trim()).find(Boolean) || "sin detalles"}`;
}

/* The commit reads like the version list: what changed, and her note. */
function commitMessage(version) {
    const changes = version.changes.length ? version.changes : ["Cambios pequeños"];
    let title = `Sitio: ${changes.join(", ")}`;
    if (title.length > 72) title = `Sitio: ${changes.length} cambios`;
    const body = changes.map((c) => `- ${c}`);
    if (version.note) body.push("", `Nota: ${version.note}`);
    return `${title}\n\n${body.join("\n")}\n`;
}

async function push() {
    await git(["push", "-q", "origin", `HEAD:${PUBLISH_BRANCH}`], 120000);
}

async function sendToInternet(version) {
    const branch = await git(["symbolic-ref", "--short", "HEAD"], 10000).catch(() => "");
    if (branch !== PUBLISH_BRANCH) {
        throw new UploadProblem(`la carpeta del sitio no está en la rama ${PUBLISH_BRANCH}`);
    }

    await git(["add", "-A", "--", ...PUBLISHED]);
    if (await git(["diff", "--cached", "--name-only", "--", ...PUBLISHED])) {
        // A Mac that has never been told who is committing gets her name.
        const known = await git(["config", "user.email"]).catch(() => "");
        const who = known ? [] : ["-c", "user.name=Marcia Gomezcoello", "-c", "user.email=editor@marcia.local"];
        await git([...who, "commit", "-q", "-m", commitMessage(version), "--", ...PUBLISHED]);
    }

    let pulled = false;
    try {
        await push();
    } catch (err) {
        if (!/rejected|non-fast-forward|fetch first/i.test(`${err.stderr}`)) throw err;
        try {
            await git(["pull", "-q", "--rebase", "--autostash", "origin", PUBLISH_BRANCH], 120000);
        } catch (pullErr) {
            await git(["rebase", "--abort"]).catch(() => {});
            if (/conflict|could not apply/i.test(`${pullErr.stdout}${pullErr.stderr}`)) {
                throw new UploadProblem("en internet hay cambios en las mismas partes, y no se mezclaron solos");
            }
            throw pullErr;
        }
        pulled = true;
        await push();
    }
    await deploy();
    return { commit: await git(["rev-parse", "--short", "HEAD"]), pulled };
}

/* Where Node may be installed. An app opened from the Dock gets a bare PATH and
   never reads the shell profile, so installs made through nvm, Volta, fnm or
   asdf — which live under the home folder — have to be looked up by hand. For
   nvm the newest version comes first. */
function nodePaths() {
    const home = process.env.HOME || "";
    const nvm = path.join(process.env.NVM_DIR || path.join(home, ".nvm"), "versions", "node");
    let nvmBins = [];
    try {
        nvmBins = fsSync
            .readdirSync(nvm)
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
            .map((v) => path.join(nvm, v, "bin"));
    } catch {
        // no nvm here
    }
    return [
        ...nvmBins,
        path.join(home, ".volta", "bin"),
        path.join(home, ".local", "share", "fnm", "aliases", "default", "bin"),
        path.join(home, ".asdf", "shims"),
        "/opt/homebrew/bin",
        "/usr/local/bin",
    ].filter((dir) => fsSync.existsSync(dir));
}

/* Makes the site live: `npm run deploy` builds it and pushes the result to the
   `gh-pages` branch, which GitHub Pages serves. */
async function deploy() {
    if (!fsSync.existsSync(path.join(SITE, "node_modules"))) {
        throw new UploadProblem("falta preparar el sitio en esta computadora (npm install)");
    }
    const PATH = [...nodePaths(), process.env.PATH].filter(Boolean).join(":");
    try {
        await run("npm", ["run", "deploy"], {
            cwd: SITE,
            env: { ...GIT_ENV, PATH },
            timeout: 600000,
            maxBuffer: 64 * 1024 * 1024,
        });
    } catch (err) {
        if (err.code === "ENOENT") throw new UploadProblem("falta instalar Node en esta computadora");
        if (err.killed) throw new UploadProblem("el sitio tardó demasiado en prepararse");
        const text = `${err.stderr || ""}\n${err.stdout || ""}`;
        const line = text.split("\n").map((l) => l.trim()).find((l) => /error|failed/i.test(l));
        throw new UploadProblem(`el sitio no se pudo publicar: ${line || "sin detalles"}`);
    }
}

/* --- The servers ----------------------------------------------------------
   Two of them, on purpose. The editor and the preview stay on separate ports so
   the preview is a genuinely separate origin — the same arrangement as when the
   site's own dev server is used, so one code path covers both and the draft
   always travels the same way, by postMessage.
   -------------------------------------------------------------------------- */

function makeApi({ uiDir, previewUrl }) {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: "16mb" }));

    app.get("/api/config", (_req, res) => {
        res.json({ previewUrl, site: SITE });
    });

    app.get("/api/content", async (_req, res) => {
        try {
            res.json(await readAll());
        } catch (err) {
            res.status(500).json({ error: String(err.message || err) });
        }
    });

    /* The gallery: every picture already on the site, newest first, each saying
       whether anything still uses it. */
    app.get("/api/images", async (_req, res) => {
        try {
            const names = (await fs.readdir(imagesDir())).filter((n) => !n.startsWith(".") && PICTURE.test(n));
            const { site, versions } = await photosInUse();
            const photos = [];
            for (const name of names) {
                const { mtimeMs } = await fs.stat(path.join(imagesDir(), name));
                const used = site.has(name) ? "sitio" : versions.has(name) ? "version" : false;
                photos.push({ name, time: mtimeMs, used });
            }
            photos.sort((a, b) => b.time - a.time || a.name.localeCompare(b.name));
            res.json(photos);
        } catch (err) {
            if (err.code === "ENOENT") return res.json([]);
            res.status(500).json({ error: String(err.message || err) });
        }
    });

    /* Deleting a photo from the gallery. Any photo can go; the screen warns
       first when a page or a kept version still uses it, since those then
       show an empty frame, which the site draws for a missing picture. */
    app.delete("/api/images/:name", async (req, res) => {
        try {
            const name = path.basename(String(req.params.name));
            if (!PICTURE.test(name) || name.startsWith(".")) return res.status(400).json({ error: "Eso no es una foto." });
            const file = path.join(imagesDir(), name);
            if (!fsSync.existsSync(file)) return res.status(404).json({ error: "Esa foto ya no está." });
            await fs.rm(file);
            res.json({ ok: true });
        } catch (err) {
            res.status(500).json({ error: String(err.message || err) });
        }
    });

    /* The soft draft. The screen sends what it holds after every change — the
       whole draft, and the saved site it was made against, so a draft made
       against files that have since changed can be told apart on reopening.
       Written to a temporary name and then renamed, so a crash mid-write
       leaves the last good copy rather than half of a new one. */
    app.get("/api/borrador", (_req, res) => {
        res.json(readDraftSync());
    });

    app.put("/api/borrador", async (req, res) => {
        try {
            const { base, draft } = req.body || {};
            if (!base || !draft) return res.status(400).json({ error: "Falta el borrador." });
            await fs.mkdir(draftDir(), { recursive: true });
            const tmp = `${draftFile()}.${process.pid}.tmp`;
            await fs.writeFile(tmp, JSON.stringify({ date: new Date().toISOString(), base, draft }), "utf8");
            await fs.rename(tmp, draftFile());
            res.json({ ok: true });
        } catch (err) {
            res.status(500).json({ error: String(err.message || err) });
        }
    });

    // Descartar, or nothing left unapplied: the soft draft and its photos go.
    app.delete("/api/borrador", async (_req, res) => {
        await fs.rm(draftFile(), { force: true });
        tidyPhotos();
        res.json({ ok: true });
    });

    /* A chosen photo, copied into staging the moment she picks it. The body is
       the file itself; its original name comes in the query. */
    app.post(
        "/api/staging",
        express.raw({ type: () => true, limit: "128mb" }),
        async (req, res) => {
            try {
                const original = path.basename(String(req.query.name || "imagen.jpg"));
                let ext = path.extname(original).toLowerCase() || ".jpg";
                const base = slugify(path.basename(original, path.extname(original))) || "imagen";
                const id = `${process.pid}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
                const dir = photosDir();
                await fs.mkdir(dir, { recursive: true });

                /* An iPhone photo is usually HEIC, which no browser can show — not
                   the preview, and not a visitor's browser either. The Mac turns
                   it into a JPEG here with its own `sips`, so the photo works
                   everywhere and she never needs to know the format existed. */
                if (HEIC.test(ext)) {
                    const raw = path.join(dir, `${id}__raw${ext}`);
                    await fs.writeFile(raw, req.body);
                    ext = ".jpg";
                    try {
                        await run("sips", ["-s", "format", "jpeg", raw, "--out", path.join(dir, `${id}__${base}${ext}`)]);
                    } catch {
                        return res.status(415).json({ error: "No se pudo leer esa foto. Pruebe a exportarla como JPEG." });
                    } finally {
                        await fs.rm(raw, { force: true });
                    }
                } else {
                    await fs.writeFile(path.join(dir, `${id}__${base}${ext}`), req.body);
                }
                res.json({ path: `/api/staging/${id}__${base}${ext}` });
            } catch (err) {
                res.status(500).json({ error: String(err.message || err) });
            }
        }
    );
    app.use("/api/staging", express.static(photosDir()));

    /* Aplicar. Staged photos become files, then any content file whose contents
       have actually changed is rewritten — untouched files are left alone so a
       session that edited one page is not seven changed files. */
    app.post("/api/aplicar", async (req, res) => {
        try {
            const { content } = req.body || {};
            if (!content) return res.status(400).json({ error: "Falta el contenido." });

            const written = new Map();
            const clean = await materialise(content, written);

            const onDisk = await readAll();
            const saved = [];
            for (const name of FILES) {
                if (clean[name]) {
                    const next = formatJson(clean[name]);
                    if (next !== formatJson(onDisk[name])) {
                        await fs.writeFile(path.join(contentDir(), `${name}.json`), next, "utf8");
                        saved.push(`${name}.json`);
                    }
                }
                const en = clean.en?.[name];
                if (en) {
                    const next = formatJson(en);
                    if (!onDisk.en[name] || next !== formatJson(onDisk.en[name])) {
                        await fs.mkdir(enDir(), { recursive: true });
                        await fs.writeFile(path.join(enDir(), `${name}.json`), next, "utf8");
                        saved.push(`en/${name}.json`);
                    }
                }
            }

            // Applied, so there is nothing left for the soft draft to keep —
            // and every staged photo it used is now on the site.
            await fs.rm(draftFile(), { force: true });
            tidyPhotos();
            res.json({ content: clean, saved, images: [...written.values()] });
        } catch (err) {
            res.status(500).json({ error: String(err.message || err) });
        }
    });

    /* The published versions, newest first, without their contents. `upToDate`
       says whether what is saved now is already the newest version, and
       `pending` that the newest was kept but never reached the internet. */
    app.get("/api/versiones", async (_req, res) => {
        try {
            const ids = await versionIds();
            const list = [];
            let newest = null;
            for (const id of ids) {
                const v = await readVersion(id);
                if (!v) continue;
                if (!newest) newest = v;
                list.push({ id: v.id, date: v.date, changes: v.changes || [], note: v.note || "" });
            }
            const saved = await readAll();
            const uploads = await canUpload();
            const upToDate = sameContent(saved, newest?.content);
            res.json({
                versions: list,
                kept: VERSIONS_KEPT,
                upToDate,
                uploads,
                pending: uploads && upToDate && newest.uploaded !== true,
            });
        } catch (err) {
            res.status(500).json({ error: String(err.message || err) });
        }
    });

    // One version's contents, Spanish and English, in the shape /api/content has.
    app.get("/api/versiones/:id", async (req, res) => {
        const v = await readVersion(req.params.id);
        if (!v) return res.status(404).json({ error: "No se encontró esa versión." });
        res.json(v);
    });

    /* Publicar. What is SAVED is published, read from disk, never the draft on
       screen — so a change she has not applied cannot slip out. The version is
       kept first; then it goes to the internet. `pulled` says that other
       commits came down with it, so the screen reads the files again. */
    let publishing = false;
    app.post("/api/publicar", async (req, res) => {
        if (publishing) return res.status(409).json({ error: "Ya se está publicando." });
        publishing = true;
        try {
            const { changes = [], note = "" } = req.body || {};
            const content = await readAll();

            const [newestId] = await versionIds();
            const newest = newestId ? await readVersion(newestId) : null;
            let version;
            if (newest && newest.uploaded !== true && sameContent(content, newest.content)) {
                // Kept last time but never uploaded: the same version, again.
                version = newest;
                if (String(note).trim()) version.note = String(note).trim();
            } else {
                const date = new Date();
                version = {
                    id: date.toISOString().replace(/[:.]/g, "-"),
                    date: date.toISOString(),
                    changes: Array.isArray(changes) ? changes.map(String) : [],
                    note: String(note).trim(),
                    content,
                    uploaded: false,
                };
            }
            await writeVersion(version);

            // Only the newest are kept.
            const ids = await versionIds();
            for (const old of ids.slice(VERSIONS_KEPT)) {
                await fs.rm(path.join(versionsDir(), `${old}.json`), { force: true });
            }

            if (!(await canUpload())) return res.json({ id: version.id, uploaded: false });
            try {
                const sent = await sendToInternet(version);
                version.uploaded = true;
                version.commit = sent.commit;
                // What is on GitHub now includes what came down with it.
                if (sent.pulled) version.content = await readAll();
                await writeVersion(version);
                res.json({ id: version.id, uploaded: true, pulled: sent.pulled });
            } catch (err) {
                res.json({ id: version.id, uploaded: false, problem: uploadProblem(err) });
            }
        } catch (err) {
            res.status(500).json({ error: String(err.message || err) });
        } finally {
            publishing = false;
        }
    });

    if (uiDir) {
        app.use(express.static(uiDir));
        app.get("*", (_req, res) => res.sendFile(path.join(uiDir, "index.html")));
    }
    return app;
}

/* The site, as she will see it. Pictures are served from the live folder rather
   than from the copy inside this build, so a photograph saved a moment ago
   appears without the app having to be rebuilt. */
function makePreview(previewDir) {
    const app = express();
    // Only the live folder: the build carries its own old copy of every photo,
    // and falling through to it would keep showing one she has deleted.
    app.use("/content", express.static(imagesDir(), { fallthrough: false }));
    app.use(express.static(previewDir));
    app.get("*", (_req, res) => res.sendFile(path.join(previewDir, "index.html")));
    return app;
}

function listen(app, port) {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, "127.0.0.1", () => {
            resolve(server.address().port);
        });
        server.on("error", reject);
    });
}

export async function start({ site, uiDir = null, previewDir = null, apiPort = 5175, previewPort = 0 }) {
    SITE = site;
    if (!isSite(SITE)) throw new Error(`No encuentro el sitio en: ${SITE}`);

    // Photos left behind by an editor that crashed, and not in the soft draft.
    tidyPhotos();
    // However this process ends — the window closed, Ctrl+C in a terminal —
    // it tidies after itself, keeping what the soft draft still uses.
    process.on("exit", tidyPhotos);
    for (const signal of ["SIGINT", "SIGTERM"]) {
        process.on(signal, () => process.exit(0));
    }

    // Without a bundled copy of the site, fall back to the developer's own dev
    // server — which is how this runs during `npm start`.
    let previewUrl = "http://localhost:3000";
    if (previewDir) {
        const port = await listen(makePreview(previewDir), previewPort);
        previewUrl = `http://127.0.0.1:${port}`;
    }

    const port = await listen(makeApi({ uiDir, previewUrl }), apiPort);
    return { apiUrl: `http://127.0.0.1:${port}`, previewUrl, site: SITE };
}

// Run directly (`node server.js`) during development: API only, and the preview
// is the site's own dev server on :3000.
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
    const site = findSite();
    if (!site) {
        console.error("No encuentro la carpeta del sitio.");
        process.exit(1);
    }
    const info = await start({ site });
    console.log(`Editor de Marcia — sitio en ${info.site}`);
    console.log(`API en ${info.apiUrl}, vista previa en ${info.previewUrl}`);
}
