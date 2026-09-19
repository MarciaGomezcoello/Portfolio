import { app, BrowserWindow, dialog, Menu, screen, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { start, isSite, tidyPhotos } from "../server.js";

/* ============================================================================
   The Mac app.

   It is a window and two local servers, nothing more. Everything that makes the
   editor work already existed before this file — this only removes the terminal
   from her day: she opens it from the Dock and it is there.
   ============================================================================ */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PACKED = app.isPackaged;

// Packaged, these sit inside the app bundle beside this file.
const UI_DIR = path.join(ROOT, "dist");
const PREVIEW_DIR = path.join(ROOT, "preview-site");

const SETTINGS = () => path.join(app.getPath("userData"), "ajustes.json");

/* The folder this app was built from, written in at packaging time. Only a
   starting guess — it is checked like any other before being used. */
function builtFrom() {
    try {
        return JSON.parse(
            fs.readFileSync(path.join(HERE, "default-site.json"), "utf8")
        ).site;
    } catch {
        return null;
    }
}

function readSettings() {
    try {
        return JSON.parse(fs.readFileSync(SETTINGS(), "utf8"));
    } catch {
        return {};
    }
}

function writeSettings(patch) {
    try {
        const current = readSettings();
        const merged = { ...current, ...patch };
        fs.mkdirSync(path.dirname(SETTINGS()), { recursive: true });
        fs.writeFileSync(SETTINGS(), JSON.stringify(merged, null, 2));
    } catch {
        /* Not being able to remember is not worth failing over; she will just
           be asked again next time. */
    }
}

function remembered() {
    return readSettings().site || null;
}

function remember(site) {
    writeSettings({ site });
}

/* Where the site lives. Unpacked it is the folder above this one. Packaged it
   could be anywhere, so the choice is asked for once and kept — and a folder
   that is not the site is refused rather than accepted and then failing
   halfway through. */
async function resolveSite() {
    const guesses = [remembered(), process.env.MARCIA_SITE, builtFrom()];
    if (!PACKED) guesses.push(path.resolve(ROOT, ".."));
    const found = guesses.find((dir) => isSite(dir));
    if (found) return found;

    for (;;) {
        const { response } = await dialog.showMessageBox({
            type: "question",
            buttons: ["Buscar la carpeta…", "Salir"],
            defaultId: 0,
            cancelId: 1,
            message: "¿Dónde está la carpeta del sitio?",
            detail:
                "Es la carpeta que contiene «src» y «public». " +
                "Solo hace falta indicarla una vez.",
        });
        if (response === 1) return null;

        const picked = await dialog.showOpenDialog({
            properties: ["openDirectory"],
            message: "Elija la carpeta del sitio",
        });
        const dir = picked.filePaths?.[0];
        if (!dir) continue;

        if (isSite(dir)) {
            remember(dir);
            return dir;
        }
        await dialog.showMessageBox({
            type: "warning",
            message: "Esa no parece ser la carpeta del sitio.",
            detail: "La carpeta correcta tiene dentro «src/content».",
        });
    }
}

async function main() {
    const site = await resolveSite();
    if (!site) {
        app.quit();
        return;
    }

    let info;
    try {
        info = await start({
            site,
            uiDir: fs.existsSync(UI_DIR) ? UI_DIR : null,
            previewDir: fs.existsSync(PREVIEW_DIR) ? PREVIEW_DIR : null,
            apiPort: 0,       // any free port — nothing else has to agree on it
            previewPort: 0,
        });
    } catch (err) {
        await dialog.showMessageBox({
            type: "error",
            message: "No se pudo abrir el sitio.",
            detail: String(err.message || err),
        });
        app.quit();
        return;
    }

    /* The window remembers where she left it — size and position — so it opens
       in the same place next time rather than always filling the screen. A
       position on a screen that is no longer plugged in is dropped, so the
       window never opens somewhere she cannot see it. */
    const saved = readSettings().window || {};
    const onScreen =
        Number.isFinite(saved.x) &&
        Number.isFinite(saved.y) &&
        screen.getAllDisplays().some(({ workArea: a }) =>
            saved.x < a.x + a.width - 100 &&
            saved.x + (saved.width || 0) > a.x + 100 &&
            saved.y >= a.y - 10 &&
            saved.y < a.y + a.height - 100
        );
    const win = new BrowserWindow({
        width: saved.width || 1440,
        height: saved.height || 900,
        ...(onScreen ? { x: saved.x, y: saved.y } : {}),
        minWidth: 1100,
        minHeight: 640,
        title: "El sitio de Marcia",
        backgroundColor: "#fdfaf6",
        titleBarStyle: "hiddenInset",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Save the window's size and position once a resize or move has finished
    // ("resized" and "moved" fire at the end of the drag, not during it), and
    // again on close. Minimised, full-screen and maximised states are skipped
    // so the size she chose by hand is the one kept.
    const saveBounds = () => {
        // A screenshot run (MARCIA_SHOT below) must not overwrite the size she chose.
        if (process.env.MARCIA_SHOT) return;
        if (win.isDestroyed() || win.isMinimized() || win.isFullScreen() || win.isMaximized()) return;
        writeSettings({ window: win.getBounds() });
    };
    win.on("resized", saveBounds);
    win.on("moved", saveBounds);

    /* Closing loses nothing: what is not applied stays as the soft draft and
       comes back when she reopens. The page writes it a moment after each
       change, so the first close is held back while the page writes it now,
       and the window closes once that is done — or after two seconds, so a
       page that has stopped answering can never hold the window open. */
    let closing = false;
    win.on("close", (event) => {
        saveBounds();
        if (closing || process.env.MARCIA_SHOT) return;
        event.preventDefault();
        const written = win.webContents
            .executeJavaScript("Promise.resolve(window.__editorFlush && window.__editorFlush()).then(() => true)")
            .catch(() => false);
        Promise.race([written, new Promise((done) => setTimeout(done, 2000))]).then(() => {
            closing = true;
            if (!win.isDestroyed()) win.close();
        });
    });

    // A window that fails to load is otherwise just a blank rectangle with no
    // explanation, which is the worst thing to hand someone who cannot read a
    // console. Say what happened, in the window itself.
    win.webContents.on("did-fail-load", (_e, code, description, url) => {
        console.error(`No cargó ${url}: ${description} (${code})`);
        dialog.showMessageBox(win, {
            type: "error",
            message: "No se pudo abrir el editor.",
            detail: `${description}\n\n${url}`,
        });
    });
    /* A way to see the window without granting anyone Screen Recording: set
       MARCIA_SHOT to a path and the app photographs itself once it has settled
       and quits. Only ever used while working on the editor. */
    if (process.env.MARCIA_SHOT) {
        win.webContents.on("did-finish-load", async () => {
            await new Promise((r) => setTimeout(r, 2500));
            // MARCIA_SHOT_JS runs first, so anything below the fold — or any
            // state that needs a click to reach — can still be photographed.
            if (process.env.MARCIA_SHOT_JS) {
                await win.webContents.executeJavaScript(process.env.MARCIA_SHOT_JS);
                await new Promise((r) => setTimeout(r, 900));
            }
            const image = await win.webContents.capturePage();
            fs.writeFileSync(process.env.MARCIA_SHOT, image.toPNG());
            console.log(`Captura → ${process.env.MARCIA_SHOT}`);
            app.quit();
        });
    }

    win.webContents.on("did-finish-load", () => {
        console.log(`Editor abierto — ${info.apiUrl}`);
        console.log(`Vista previa — ${info.previewUrl}`);
        console.log(`Sitio — ${info.site}`);
    });

    // `?app=1` tells the page it is in a window rather than a browser tab, so
    // it can leave room for the three round buttons and make its own top bar
    // draggable. Same build either way.
    win.loadURL(`${info.apiUrl}?app=1`);

    // Anything that is not this editor — a channel, an Amazon page — opens in
    // her real browser rather than replacing the editor's window.
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    installMenu();
}

/* The app's own menu. The standard Edit menu has to be listed again, or copy and paste stop
   working once a custom menu replaces the default one. */
function installMenu() {
    Menu.setApplicationMenu(
        Menu.buildFromTemplate([
            {
                label: app.name,
                submenu: [
                    { role: "about" },
                    { type: "separator" },
                    { role: "hide" },
                    { role: "hideOthers" },
                    { type: "separator" },
                    { role: "quit" },
                ],
            },
            { role: "editMenu" },
            { role: "windowMenu" },
        ])
    );
}

app.whenReady().then(main);

// Photos nothing uses any more do not outlive the app; the soft draft's stay.
app.on("will-quit", tidyPhotos);

app.on("window-all-closed", () => {
    // Standard Mac behaviour is to stay in the Dock, but this app is a tool she
    // opens to do a thing and closes when it is done. Closing the window ends it.
    app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) main();
});
