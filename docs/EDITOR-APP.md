# The Marcia editor — build plan and handoff

**Read this whole file before writing code.** It is written so that anyone —
a person or an AI with no memory of the conversation that produced it — can pick
the work up mid-stream and continue without re-deciding anything.

---

## 1. What is being built, and why

`marciacreations` is the website of **Dra. Marcia Gomezcoello** — a doctor from
Azogues, Ecuador, now in Queens, New York, who is also a novelist, poet,
composer and teacher of crochet and knitting. The site is in Spanish. It is a
Create React App project deployed to GitHub Pages.

**The goal: Marcia must be able to change everything on the site without
touching code** — every word, every photo, the colours, and which sections
appear on each page. She is not technical. The tool being built is a friendly
**Mac app** that edits the site's content files, shows her the real site as she
works, and eventually publishes with one button.

The owner of the project (referred to below as "the user") is a developer and
Marcia's son. He builds and maintains this; she uses it.

### Decisions already made — do not reopen these

| Decision | Why |
|---|---|
| **A Mac app**, not a website, not iOS | An iPhone/iPad can't hold a git clone or build the site, so iOS would need a paid hosted backend and still couldn't show the real page. The user raised and rejected iOS himself. |
| **The app lives OUTSIDE the site repo** — in `editor/`, listed in `.gitignore`, with its own `git init` | Keeps the public site repo free of editor code and build output. The nested `.git` also protects the folder from `git clean -fdx`, which skips directories containing a `.git` unless forced twice with `-ff`. |
| **Aplicar is the local save; Publicar (Ajustes) is the upload.** | Aplicar writes the files on this Mac and never touches git. Publicar takes what is saved and keeps it as a version she can go back to; the git push goes inside it later — see §6 "Publicar and versions". |
| **Nothing touches the site's files until Aplicar** — the draft is previewed by posting it into the running site | The user chose this over write-through. A save button should save. |
| **What is not applied is kept anyway, as the soft draft** — autosaved beside the site, and reopened with every Cambiado / ↺ Deshacer mark | The user's design: "the autosave can contain the Cambiado and deshacer tags and the draft is the one that removes them". Closing loses nothing, so it no longer asks; Descartar is the one way to throw changes away. See §6 "The soft draft". |
| **Home page first**, then review, then the rest | The user wants to see and judge one page before the pattern is replicated. |
| **Every tab and section owns its data outright** | See §4. This overrides an older design where the home page sampled other files. |
| **Internal links are hardcoded**; external links stay editable | A mistyped `/libros` is a dead link with no warning and nothing is gained by letting her retype it. Amazon/YouTube/social URLs genuinely change, so those stay. |
| **Colours come later** | Purely additive — a new `tema.json`, a small loader, one new screen. Nothing already built has to change. |

---

## 2. Standing project rules — violating these is a real mistake

These come from the user directly and apply to everything in this repo.

1. **NEVER add tests.** His words: *"don't add any tests ever, we don't need
   them, remove — just adds bulk."* Not as part of a feature, not to verify a
   fix, not as a "quick smoke test". Do not suggest them. Verify with
   `CI=true npm run build` and by reading the rendered page instead.
2. **NEVER kill the dev server.** He runs `npm start` himself and keeps it
   running. He asked for this directly after a `pkill -f "react-scripts start"`
   used as cleanup stopped his localhost several times. **Do not use `pkill`
   in this project at all** — a pattern cannot tell his process from yours.
   Check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
   and use whatever is already answering. If you start one, leave it running.
3. **All user-facing content lives in `src/content/*.json`.** Nothing
   user-facing is hardcoded in a component — not a heading, not a label. The
   one deliberate exception is internal link destinations (see §4).
4. **The site fetches nothing at runtime.** No APIs, ever. In particular there
   are deliberately **no YouTube subscriber counts** anywhere: a number the site
   cannot refresh goes stale on its own. Do not reintroduce them.
5. **No email addresses.** No `mailto:` links, no contact address, not even an
   empty placeholder. People reach her through the social links.
6. **Video is not assumed to be YouTube.** Every video field accepts either an
   embed link (YouTube, Vimeo, anything) **or** the filename of a video dropped
   into `public/content/`. `videoSource()` tells them apart. Do not write code,
   copy or editor guidance that treats YouTube as the only source.
7. **The repo is public** (GitHub Pages free tier). Never commit secrets. A
   GitHub token, when publishing is eventually built, belongs in the macOS
   Keychain.
8. **The JSON schema is a contract with this editor.** Keep it simple, stable
   and self-describing. Prefer named string values an editor can show as a
   dropdown (`"shape": "alto"`) over raw CSS (`"2 / 3"`). Avoid churn.
9. **Every field must degrade gracefully.** An empty value, a typo or a missing
   image must produce a sensible fallback — a placeholder frame, a hidden
   section — never a broken page. No developer is watching when she edits.
10. **`_guia` and `_nota` keys are editor-facing notes that are never
    rendered.** `src/content/README.md` is the editing guide, written in Spanish
    for her, not for a developer. Keep both current when the schema changes.

---

## 3. Current state of the repo

- Path: `/Users/primike/coding/other/javascript/marciacreations`
- GitHub: `Primike/MarciaCreations`, branch `main`, **public**
- CRA `react-scripts` 5.0.1, React 18, `react-router-dom` 6. Node 21.4.0.
- Build check: `CI=true npm run build`
- **No CI/CD.** `package.json` has `"predeploy": "npm run build"` and
  `"deploy": "gh-pages -d build"`. The build is now correct for the
  `/MarciaCreations/` project page, but nothing has been deployed since 2023 —
  see §9.

### The refactor that has already been done

All of the following is **complete, building clean, and verified in the
browser**. Do not redo it.

**`src/App.js` is now the ONE file that imports content**, and its `useContent()`
hook is where a draft posted by the editor enters the page. Every page and
component receives its data as props and imports none of its own:

```jsx
<Route path="/libros" element={<Libros libros={libros} />} />
<Route path="/libros/:slug" element={<LibroDetalle libros={libros} />} />
```

Helpers are a different matter: `asset`, `hasText`, `hasItems`, `toLines`,
`shapeRatio`, `slugify`, `videoSource` and `sectionOn` are pure
functions and are still imported directly from `src/content/site.js` everywhere.
`Figure.js`, `Visor.js` and `naturalRatio.js` import only `asset()`.

**The three detail pages are split** into a pure presentational component and a
thin route wrapper. The pure one is exported:

```js
export function EventoPage({ event, labels }) { … }   // pure, looks nothing up

function EventoDetalle({ eventos = {} }) {            // the wrapper
    const { slug } = useParams();
    const { state } = useLocation();
    const event = state?.evento || findEvent(eventos, slug);
    if (!event) return <EventMissing labels={labels} />;
    return <EventoPage event={event} labels={labels} />;
}
```

Same shape in `LibroDetalle.js` (`LibroPage`) and `PoemaDetalle.js`
(`PoemaPage`). **The slug fallback is load-bearing — do not remove it.** Router
state survives a refresh but is lost on a shared link, a bookmark or a new tab,
and this is a public site where event and book links get shared. The pure
component stays unaware of either path; the fallback lives only in the wrapper.

**Helper signatures changed** so nothing reads the JSON implicitly:

```js
findBook(items, slug)            findEvent(eventosBlock, slug)
bookCategories(items)            eventCategories(items)
channelIndex(name, channels)
```

**A helper in `src/content/site.js` for the switches:**

```js
// A section is shown unless switched off. Absent means visible, so blocks
// written before the flag existed keep working untouched.
export function sectionOn(block) {
    return !!block && block.visible !== false;
}
```

**`visible` flags are live on every band of every page.** A section with a
block of its own carries `visible` inside it (`toggle: true` in the schema).
A section whose fields sit at the top of its file names a flag beside them
instead — `headVisible` (the masthead on the five inner pages),
`shelfVisible` (libros), `channelsVisible` (tejidos) and `bioVisible`
(biografía) — read on the site with `partOn(file, flag)` and written by the
schema's `toggle: "headVisible"`. Only the words of a book page, "Nombre y redes"
and Ajustes have no switch: none of them is a band that can be left out. The
English copy always takes its switches from the Spanish (`inLanguage` in
`src/App.js`), since it is rebuilt only when a translation is pasted.

**Internal links are hardcoded.** Removed from the JSON entirely:
`site.nav[].url`, `home.hero.primaryUrl`/`secondaryUrl`, and `linkUrl` on the
books / poem / tejidos / proximo bands. The tab bar went further: `site.nav`
is gone altogether, labels included. The user decided the tabs are structure,
so they are fixed in `src/components/tabs.js` with Spanish and English words.

---

## 4. Each tab owns its data — the rule and its history

**Rule: no page reads another page's content.** When a value needs to appear on
two pages, each page gets its own field. This is the user's decision, stated
twice; he was warned that duplicating an event's date invites drift and
reaffirmed it. **Do not reopen it.** If drift becomes a practical problem the
remedy inside his model is an explicit *"copiar de Eventos"* button in the
editor — the user pulling data across on purpose — never an implicit shared read
put back into the code.

**That remedy now exists for books.** The user asked that a book already
written on Libros need not be typed again for the cover page. The site is
untouched; the editor's list field takes a `source` (`{ file, key, label,
image, detail }`), and Portada › Libros › "Los libros" offers
**"+ Elegir un libro de Libros"**. It lists every book on the Libros page, with
its cover, and greys out the ones already on the cover page (matched by title).
Choosing one copies the whole model into `home.books.items`. From then on the
two copies are independent, exactly as if typed. "+ Escribir uno nuevo" still
adds a blank one. The same `source` can be given to any other list that
duplicates one (the cover page's channels, for instance).

What was moved to make this true:

| Was | Now |
|---|---|
| Hero read `site.honorific` | `home.hero.honorific` |
| Lo próximo read `eventos.upcoming` | `home.proximo` carries its own `rol/date/time/title/venue/city/poster…` |
| Books band read `libros.items[0..2]` | `home.books.items[]` — its own three |
| Tejidos band read `site.channels` | `home.tejidos.channels[]` |
| Tejidos page read `site.channels` | `tejidos.channels[]` — `site.channels` is gone |

### Every copy carries the COMPLETE model — this is the rule that matters

**The model is the unit, not the fields a given view happens to draw.** A
summary card renders a subset; it must still hold the whole object, because what
it hands over when pressed is the entire model. This was got wrong once and
corrected twice by the user — **do not "optimise" a copy back down to the fields
its view uses.**

So there is **one canonical shape per type, identical everywhere it appears**:

- An event on the cover page (`home.proximo.evento`) has **exactly** the same 20
  keys as one in `eventos.json` — `body` and `fotos` included — even though the
  strip draws only the poster, date, title and venue.
- A book in the cover row (`home.books.items[]`) has all 12 book keys —
  `synopsis`, `pages`, `excerpt`, `buyUrl` — even though the row shows only the
  cover, title and year.
- Missing keys are filled with empty values (`""`, `[]`) rather than omitted, so
  the shape never varies between copies.

**Every link into a detail page passes its model through router state**, on all
pages, not just some:

```jsx
<Link to={`/eventos/${eventSlug(ev)}`} state={{ evento: ev }}>
<Link to={`/libros/${bookSlug(book)}`} state={{ book }}>
<Link to={`/arte/${poemSlug(poem)}`}  state={{ poem }}>
```

Verified end to end: clicking through from the cover page renders the encounter
page from **home's own copy** (proved with a marker string present only in
`home.json`, and `01 / 05` showing the whole 5-frame gallery arrived), while
opening the same URL cold renders `eventos.json`'s version through the slug
fallback. Both paths are correct and intended.

The canonical shapes, as enforced today:

```
EVENT = slug, rol, categoria, date, time, year, title, venue, city, note,
        poster, posterAlt, posterShape, photo, photoAlt, shape,
        linkLabel, linkUrl, body, fotos[{ src, alt, shape }]
BOOK  = slug, title, year, categoria, shape, cover, pages, tagline,
        synopsis, excerpt, buyLabel, buyUrl
POEM  = slug, title, source, year, photo, photoAlt, shape, body
```

`EventoPage` reads `photo || poster` and `categoria || rol`, so one shape serves
both an encounter still to come and a filed one; the empty half simply loses.

---

## 5. The content schema (current, accurate)

Seven files in `src/content/`. Every value is a string, a list of strings, or a
list of flat objects. Nothing nests past three levels. `visible: boolean`
appears on sections that have a switch; more will be added as each page gets its
editor slice.

```
site.json
  name, honorific, tagline : str
  footer  = { note, socialTitle,
              social: [{ label, icon, url }] }
              icon ∈ youtube|facebook|instagram|x|linkedin|amazon|globe

home.json                                 ← SLICE 1 TARGET
  hero    = { visible, greeting, honorific, name, roles:[str], intro,
              photo, photoAlt, photoShape, primaryLabel, secondaryLabel, place }
  proximo = { visible, kicker, detalleLabel, todosLabel,
              evento: { …the full EVENT shape, identical to eventos.json… } }
  books   = { visible, kicker, title, lead, linkLabel,
              items: [ …the full BOOK shape, identical to libros.json… ] }
  poem    = { visible, kicker, title, body, attribution,
              photo, photoAlt, photoShape, linkLabel }
  tejidos = { visible, kicker, title, text, video, videoLabel, linkLabel,
              channels: [{ name, short, url, logo, logoAlt }] }
  quote   = { visible, text, source }

libros.json
  kicker, title, lead : str
  generos  = [str]                       the tabs, in order; categoria is one of these
  items    = [{ slug, title, year, categoria, shape, cover, pages,
                tagline, synopsis, excerpt, buyLabel, buyUrl }]
  upcoming = { kicker, title, body, cover, shape, photoAlt }
  detail   = { backLabel, synopsisLabel, excerptLabel }

arte.json
  kicker, title, lead : str              the masthead; empty title hides it
  poems = { kicker, title, lead,
            detail: { backLabel, prevLabel, nextLabel },
            items: [{ slug, title, source, year, photo, photoAlt, shape, preview, body }] }
  songs = { kicker, title, lead,
            items: [{ title, year, note, photo, photoAlt, video }] }

tejidos.json
  kicker, title, lead : str
  channels  = [{ name, short, description, url, logo, logoAlt }]
  featured  = { title, lead, items: [{ title, note, channel, photo, photoAlt, video }] }
  gallery   = { kicker, title, lead, items: [{ title, shape, note, photo, photoAlt }] }
  playlists = { title, items: [{ name, note }] }

eventos.json
  kicker, title, subtitle, lead : str
  upcoming = { …the full EVENT shape… }
  past     = { title, lead,
               items: [ …the full EVENT shape, same 20 keys… ],
               detalle: { backLabel, detalleLabel, galleryLabel },
               categorias: [{ nombre, texto }] }

biografia.json
  kicker, title, lede, body : str
  portrait, portraitAlt, portraitShape : str
  album       = { kicker, title, lead, items: [{ photo, photoAlt, shape, year, pie }] }
  roles       = [str]
  formacion   = { kicker, title, lead, degree, place, detail, photo, photoAlt, shape }
  timeline    = { title, items: [{ year, title, text }] }
  recognition = { title, lead, items: [{ year, title, text, shape, photo, photoAlt }] }
```

### Picture shapes — one vocabulary for the whole site

Every non-video picture is filed as one Spanish word: `"cuadrado"`, `"alto"`
(standing, the default) or `"ancho"` (lying). That is the entire vocabulary.

**The word only reserves space.** Once the file itself loads, the frame takes
the picture's own proportion and closes around it — nothing is ever cropped
(`object-fit: contain` everywhere) and no band of empty ground is left.
`useNaturalRatio` in `src/components/common/naturalRatio.js` carries this;
`Figure` reports each picture's natural size as it lands. The measured ratio is
clamped to 3:1 either way so one panorama can't set a whole row's height.

`shapeRatio(shape, set)` therefore shapes only *reserved* frames. Two sets exist
— `wall` (5:6, 6:5, 1:1) and `print` (2:3, 3:2, 1:1) — and the set is a design
decision chosen by the component, never written in the JSON. **The editor should
offer exactly three choices, drawn at their real proportions, and never mention
sets or ratios.**

Only the *proportion* ever comes from the file; the size never does. A row gives
every picture the same height, so a 3000px photo and a 400px one come out
identical on the page. That is the answer whenever the user worries about files
of wildly different dimensions.

### Images

Files live in `public/content/`. A field holds just the filename
(`"portada.jpg"`); `asset()` resolves it. A full `https://` URL also works.
Empty string → a designed placeholder frame, never a broken image.

**Currently only these are real photographs:** the sixteen book covers,
`marcia.jpg`, and the two channel logos. Everything else — event photos, album
prints, diplomas, poem illustrations — is sample material standing in, put there
because the user asked for every slot to be filled ("just put a random photo
everywhere dont leave anything not filled") so features would be reviewable.
**Do not describe a stand-in in `alt` text as though it were real**, and don't
present them in the editor's image browser as belonging where they sit.

---

## 6. The editor app — architecture

```
marciacreations/
  .gitignore                    carries one line:  /editor
  editor/                       gitignored by the site, its own git repo
    .git/                       `git init` here — also what protects it from
                                `git clean -fdx`, which skips nested repos
    package.json                own deps; Vite + React + Electron
    vite.config.js              UI on :5174, proxies /api to :5175
    server.js                   the file side — THE ONLY THING THAT WRITES
    electron/
      main.js                   the Mac app: window + the two servers
      write-default-site.js     run at packaging; emits default-site.json
      default-site.json         generated — the folder it was built from
    schema/home.js              the field inventory for slice 1
    src/
      main.jsx                  mounts App
      App.jsx                   the screen: tabs, form, splitter, preview
      fields.jsx                one control per field `kind`
      config.js                 asks the API where the preview lives
      styles.css                all of the editor's styling
    build/icon.icns             the app icon
    dist/                       built UI          (gitignored)
    preview-site/               bundled site      (gitignored)
    release/                    the packaged .app (gitignored)
```

There is **no `.baseline/` or `.draft/`** — an earlier design wrote through to
disk and kept a baseline to roll back to. That was replaced: the draft lives in
memory and nothing is written until Aplicar, so there is nothing to roll back.

Content paths are plain relative ones (`../src/content`, `../public/content`)
when unpacked; packaged, the folder comes from `default-site.json` or is asked
for once. CRA compiles only `src/`, so `editor/` can never reach `build/` or the
deployed site.

### The scripts

| In `editor/` | Does |
|---|---|
| `npm start` | API + Vite dev server, browser at :5174. Needs the site's dev server on :3000. |
| `npm run app` | Builds, then runs Electron unpackaged |
| `npm run package` | Builds and produces `release/mac-arm64/Sitio de Marcia.app` |
| `npm run dmg` | The same, as a disk image |
| `npm run preview-site` | Just the bundled site (calls the site's `build:preview`) |
| `npm run ui` / `server` | One half only, for debugging |

### Server routes — all of them

| Route | Does |
|---|---|
| `GET /api/config` | Where the preview lives, and which folder is being edited |
| `GET /api/content` | Read all seven content files |
| `GET /api/images` | The photo library: every picture in `public/content/`, as `{ name, time }`, newest first |
| `POST /api/staging?name=` | A photo she has just chosen, copied into `.borrador/fotos/` (HEIC converted to JPEG) |
| `GET` / `PUT` / `DELETE /api/borrador` | The soft draft: read it, keep `{ base, draft }` (written to a temporary name, then renamed), or remove it and tidy its photos |
| `POST /api/aplicar` | **The only write to the site.** Materialise new pictures, rewrite only the content files whose contents actually changed, then remove the soft draft |
| `GET /api/versiones` | Published versions, newest first, without contents; `upToDate` (saved = newest), `kept`, `uploads` (the folder is a git checkout with a remote), `pending` (the newest was kept but never pushed) |
| `GET /api/versiones/:id` | One version, with its Spanish and English content |
| `POST /api/publicar` | Keep what is saved on disk as a version (or reuse the newest if it was never pushed), prune to the newest 50, then `sendToInternet`: commit `src/content` and `public/content` and push to `main` |

Descartar is `DELETE /api/borrador` followed by a fresh `/api/content`.

### Aplicar and Descartar — as built

Because every page is a pure function of a model (§3), the editor holds the
draft and hands it to the site to render. The site's files do not change until
Aplicar. The draft is also kept on disk as the soft draft (§6), but beside the
site, never in it; Descartar removes that copy and re-reads the site's files.

**How the draft reaches the preview.** The editor is on `:5174`, the site on
`:3000` — different origins, so it goes by `postMessage`, debounced ~140ms:

- `src/App.js` holds content in state and listens for `{type:"marcia:draft"}`.
- On mount, the framed page posts `{type:"marcia:ready"}` so a reload of the
  preview asks for the draft again.
**Two locks keep this off the published site**, and both matter:

1. **An origin check at runtime.** `LOCAL_ORIGIN` in `src/App.js` requires
   `event.origin` to be `localhost` or `127.0.0.1`. The browser sets that and it
   cannot be forged, so even if the code did reach the open web, a stranger
   framing the site could not drive it. **This is the lock that actually
   protects the page.**
2. **Removal at build time.** The listener is behind a literal test on
   `NODE_ENV` and `REACT_APP_PREVIEW`, so a bundle that is neither the dev server
   nor a preview build drops the whole block. Verified: `marcia:draft` appears
   0 times in `build/static/js/` and once in `editor/preview-site/static/js/`.

Lock 2 is defence in depth and is **fragile** — see §7 on why both build scripts
must set `REACT_APP_PREVIEW` explicitly. Lock 1 is the one to rely on. It was
added after lock 2 silently failed.

**How a new photo works without being written.** When she picks a file it is
copied at once into the soft draft's photo folder, `<site>/.borrador/fotos/`,
under a unique name that starts with the editor's process id and keeps the
original after `__`. The draft holds its address,
`http://…/api/staging/<name>`.
`asset()` passes any http address through, so the picture appears in the
preview instantly, and her original file can be moved or deleted without
consequence. On Aplicar the server walks the content, copies each staged photo
into `public/content/` under a slugified name (`Prueba Retrato Ñ.png` →
`prueba-retrato-n.png`), never overwriting an existing file — a taken name gets
`-2`, `-3` — and swaps the address for the filename. A photo used in two places
is copied once. `tidyPhotos()` in `server.js` removes every staged photo that
the soft draft on disk does not use, except those of another editor still open
on the same site (known by the process id in the name). It runs at startup,
after Aplicar, on Descartar and as the process exits, so a photo in an unapplied
soft draft survives quitting and one left by a crash is swept away. Any picture
field also accepts a plain `https://` link, which is left as it is.

**The gallery.** Every picture field has **Galería** (or, when empty, "Elegir
una foto de la galería"). It opens a grid of every picture in
`public/content/`, newest first. The new photos of the current draft come ahead
of them, tagged "Nueva". Choosing one puts its name in the field; nothing is
copied. Before this, reusing a photo meant finding the file again, and every
re-upload added a numbered copy (`-2`, `-3`). With more than twelve photos a
search box filters by name, accents ignored.

Every photo carries a × that deletes it after a confirmation. When something
uses the photo, the confirmation says so first. The saved site, the soft draft
or what is on screen gives "se usa en el sitio", and those places then show
the empty frame the site draws for a missing picture. A kept version gives
the warning that going back to it will show an empty frame there.
`/api/images` marks each photo `used: "sitio" | "version" | false`, and
`DELETE /api/images/:name` removes the file. The preview serves `/content`
from the site folder only (`fallthrough: false`), so a deleted photo is gone
from the preview too, rather than served from the bundled build's old copy.
The deletion is immediate, like staging a photo. It reaches GitHub with the
next Publicar that has a content change, because Publicar only offers itself
when the JSON differs from the last version.

**iPhone photos.** A `.heic` or `.heif` file, which no browser can display, is
converted to JPEG while it is being staged, using macOS's own `sips`. From then
on it is an ordinary `.jpg` in the preview and on the site. If the conversion
fails, she is told in Spanish to export the photo as JPEG. A dropped file that
is not a picture at all gets a message too, rather than nothing happening.

**English.** `src/content/en/` holds an English copy of every content file,
same shape, words translated. The site shows it when the visitor picks English
in the footer (remembered in localStorage, or `?lang=en` in the address); a
missing English file falls back to Spanish. The footer's «Español · English»
is always shown and fixed in `SiteFooter.js`: the user removed the on/off
switch and the two editable language names, so there is no `site.languages`.
The editor never has anyone write it by hand: `editor/src/english.js` exports
the translatable strings of every Spanish file as one JSON text with
translator instructions, and rebuilds the English files from whatever comes
back by laying the translated strings over a fresh copy of the Spanish —
photos, links, shapes, slugs and switches always come from the Spanish, so a
translator cannot break them. Arrays match by position, which is why the
English is rebuilt rather than patched, and why the editor warns when the
Spanish structure has moved on since the last translation. Settings that are
not words (`theme`, `fontTitles`, `fontText`) are read from the
Spanish `site.json` only.

**Themes.** `site.theme` names a block in `src/styles/tokens.css` that restates
the colour tokens and some "flair" tokens — corners (`--radius*`,
`--radius-btn`), the kicker's mark (`--kicker-mark-*`), `--title-style`, the
pattern on the strong rose bands (`--strong-texture`), shadows and
`--portrait-turn` — so each theme has a character, not just a palette. App.js
stamps it on `<html data-theme>`. The editor's swatches in
`editor/schema/ajustes.js` are only a picture of each theme. The holiday themes
were removed "for now" at the user's request; their CSS is kept, unimported, in
`src/styles/themes-fiestas.css`.

**Holiday themes and their extras.** The eight holiday themes live in
`src/styles/themes-fiestas.css` (imported after `tokens.css`). Besides colours
and flair, each sets `--fiesta-a … --fiesta-e` and `--fiesta-sky`, the paint of
its extras. `src/components/common/Fiesta.js` holds the extras as inline SVG:
`<FiestaProvider>` in App.js decides whether a holiday is on (a holiday theme,
and `site.holidayExtras` not `false`); `<Adorno spot="portrait">` sits on the
hero portrait, `spot="brand"` on her name in the bar, `spot="garland"` along the
top of the footer; `<FiestaSky>` drops snow, bats, hearts, leaves or confetti
through the hero and every masthead. All of it is `aria-hidden`, ignores
pointers, and stands still under `prefers-reduced-motion`. The user asked for
exactly this: holiday themes that bring "special props" — reindeer antlers, a
Santa hat — not just colours. In the editor, Ajustes › Colores lists them under
"Fiestas" with a note naming each one's extras, and an **Adornos del tema**
switch (`kind: "onoff"`) turns the extras off.

**The everyday themes have extras too.** The user then asked for every theme to
have "its own spirit" like the holidays, not just colour changes. Each of the
twelve everyday themes draws a set in the same spots, from
`src/components/common/Temas.js`: a yarn ball and needle for Papel, sage sprigs,
lavender and poetry books, gulls and a paper boat for Mar, a sun and a clay
pitcher for Terracota, a moon and candle for Noche, hibiscus and peaches,
bookmark ribbons and a quill for Vino, sunflowers and bees, clouds and a
balloon for Cielo, crop marks and a pen nib for Grafito, a hanging star and a
constellation for Medianoche. There is also a `companion` spot (the foot of the
portrait). The holidays additionally use a `masthead` spot (right of every inner
page's header, hidden under 1000px) and their sky on the mastheads. **The
everyday themes stay off the mastheads.** The user found a yarn ball or a ship
on the Libros or Eventos header unrelated to those pages: *"unless its a
holiday we dont need pots and ships in tab headers."* The everyday sets are quieter:
the sky has half as many things, and it moves in its own way (`SKY_MODE`: fall,
rise, fly, slow drift or still twinkle), or is absent for the calmer themes.
Their colours default to the theme's palette at the end of `tokens.css`. The
same `holidayExtras` switch controls all of it, because the key was kept to
avoid schema churn.

**One file per section, not per page.** A section may name its own `file`.
"Nombre y redes" (her name and the footer, all in `site.json`) is one
section shown as the last tab of Portada — the user found a page of its own
with three tabs too much for what is one thing. `fileOf(form, section)` in
`editor/src/App.jsx` resolves it everywhere a section reads, writes, restores or
is marked changed.

**Middle-of-page flair.** Besides the page tops, each theme restates
`--band-texture` / `--band-seam` (a pattern on every paper band and a seam along
its top), `--title-mark*` (a mark under each `.bandTitle`), `--card-border` and
`--photo-outline*`. All are `none` or neutral in Papel, so the everyday site is
unchanged. The user asked for this because themes "leave the middle part mostly
the same".

**Fonts are one list.** `fontTitles` and `fontText` choose from the same 22
faces (`FONTS` in ajustes.js), grouped Clásicas / Modernas / Manuscritas. A
script face as body text sets `--body-adjust`, used as `font-size-adjust`, so it
is scaled to Inter's lowercase height and stays readable.

**The preview follows the form.** A section in a schema may name `find`, a
selector inside that section on the site. Choosing its tab posts
`{type: "marcia:find", selector}` and the page scrolls to it — through the same
localhost-only listener as the draft, so it too is absent from the deployed
build. `findSection()` in the site's App.js waits up to 3s for the section to
exist (a page still loading after a change of page), glides to it, then
corrects drift for ~2.6s as pictures above it load, and stops if the reader
scrolls. A single scroll missed both cases; verified by measuring every tab's
band landing under the bar.

**Fonts.** `site.fontTitles` and `site.fontText` are stamped as
`<html data-titles>` / `<html data-text>` and pick blocks at the end of
`tokens.css`. The big titles (`.pageTitle`, `.bandTitle`, `.heroName`, the
detail-page titles, the footer name) use `--title` with its own weight,
tracking, leading and scale; everything smaller uses `--display`, which a
script title face pairs with a readable companion. Every family is in the
`@import` in `src/index.css` and in the editor's `index.html`.

**Writing.** Only files whose formatted contents actually differ are rewritten,
so editing one page does not show up as seven changed files. `formatJson()`
reproduces the house style exactly — four spaces, a blank line between
top-level sections — and `_guia` / `_nota` keys survive untouched, so a file the
app rewrites is indistinguishable from one written by hand.

### The soft draft

The user's design, added after the flow below was settled: three layers, not
two.

    soft draft  ──Aplicar──▶  saved draft (the site's files)  ──Publicar──▶  version
    (autosaved,                (marks gone)                                  (in the list,
     marks showing)                                                           with its date)

- **Kept after every change.** 300ms after she stops, `App.jsx` sends
  `{ base, draft }` to `PUT /api/borrador`, which writes
  `<site>/.borrador/borrador.json` (git-ignored). With nothing left unapplied,
  it is removed. The writes run one after another through a promise chain, so
  an older one can never land after a newer one, or after Aplicar or
  Descartar, which wait for the chain first.
- **Closing loses nothing and does not ask.** `main.js` holds the first
  `close`, calls `window.__editorFlush()` so the last keystroke is written at
  once rather than 300ms later, and closes when that is done (at most two
  seconds). A browser tab tries the same on `pagehide`, best effort.
- **Reopening lays it back** over the saved site. The Cambiado and ↺ Deshacer
  marks are only the difference between the draft and the saved site, so they
  come back by themselves; the status says "Siguen aquí los cambios sin
  aplicar de la última vez." A staged photo's address names the old session's
  port, so `rebaseStaged()` points it at the new one.
- **If the site's files changed in between** (edited by hand, or pulled from
  git), laying the whole draft back would silently undo those changes at the
  next Aplicar. So `recoverDraft()` compares the stored `base` with the files:
  if they differ, only the sections she had changed come back, each laid over
  the new files, and the status says so.
- **Wording.** The top bar says "Hay cambios sin aplicar" and "Todo aplicado",
  not "Sin guardar": unapplied work is kept, so calling it unsaved would
  frighten her for nothing. It does not list which sections — the user asked
  for just "there are some changes"; the dots on the tabs show where, and the
  Aplicar dialog lists every one.
- One site folder, one soft draft. Two editors open on the same folder (the
  dev editor and the app, say) take turns writing it, and the last one to
  change something wins. Each keeps its own photos safe while it is open.

### Publicar and versions

The user settled the flow: **Aplicar is the local save** — quit and reopen and
the editor opens on it, with the soft draft laid over it. **Descartar throws
away the unapplied changes** (the soft draft), never the local save. **Publicar, in Ajustes › Publicar, is the only
thing that goes to the internet**, and every publish is kept as a version so an
older site can always be brought back. Aplicar must not grow into a commit.

- A version is `{ id, date, changes, note, content }` where `content` is the
  whole site in `/api/content`'s shape, **Spanish and English together**. It is
  one compact JSON file in `<site>/.versiones/` (git-ignored), named by its ISO
  timestamp so names sort and are validated against a regex before being read.
- **Pictures are not copied.** Aplicar never overwrites a photo and nothing
  deletes one, so every file an old version names is still in
  `public/content/`. A version is therefore ~170KB, and **50 are kept**
  (`VERSIONS_KEPT` in `server.js`, ~5.5MB) — the user asked for 10, or more if
  cheap.
- Publicar publishes **what is saved on disk, never the draft**: the button is
  disabled while anything is unapplied, and while the saved site already
  equals the newest version. `changes` is worked out in the editor with
  `changedSections(saved, newest)`, so the list reads "Portada · La frase".
- **Going back** loads a version into the draft over the whole site. Nothing is
  written: she looks at it in the preview, then Aplicar and Publicar make it
  the site again (becoming the newest version), or Descartar returns to the
  local save. No version is ever deleted by going back.
- **Uploading is a git commit and push**, in `sendToInternet()` in
  `server.js`. The version is kept first, so a failed upload loses nothing.
  - Only `src/content/` and `public/content/` are added and committed
    (`git commit -- <paths>`), so unfinished work on the site's code on the
    same Mac is never swept into her commit. With no content change there is
    no commit, only a push.
  - The message is `Sitio: <changes>` (or `Sitio: N cambios` past 72
    characters), each change listed below, then `Nota: <note>`. A Mac with no
    `user.email` commits as Marcia Gomezcoello.
  - It pushes `HEAD:main` and refuses on any other branch. If GitHub has
    newer commits, it runs `pull --rebase --autostash` and pushes again. If
    the two changed the same lines it runs `rebase --abort` and forces
    nothing.
  - Git runs with `GIT_TERMINAL_PROMPT=0`, so a missing login fails at once
    instead of hanging, and uses the Mac's osxkeychain login. Failures are
    said in Spanish (`uploadProblem()`): no internet, the login refused,
    git missing, the wrong branch, a collision.
  - A failed upload leaves the version marked `uploaded: false`. The screen
    shows it as "Sin subir", and the button becomes "Subir otra vez", which
    retries that same version rather than keeping a second copy.
  - When other commits came down with the push (`pulled`), the editor reads
    the files again. Publicar is only possible with nothing unapplied, so
    nothing is lost by that.
  - Also: a push sends every commit on `main`, so on the developer's Mac any
    committed-but-unpushed code goes up with her publish.
  - **Not done yet: the live site.** Pushing puts the content on GitHub; the
    site only changes once GitHub Pages builds from it — see §9.

### Forms that build themselves from a schema

**The single most important implementation decision.** Do not hand-build 30
screens. The content shape is extremely regular — write one schema describing
each field's *kind*, and one renderer that turns a kind into a control.

```js
// editor/schema/home.js
export default {
    hero: {
        label: "Portada",
        help: "Lo primero que se ve al abrir la página.",
        fields: {
            greeting:  { kind: "text",  label: "Saludo" },
            honorific: { kind: "text",  label: "Título antes del nombre" },
            name:      { kind: "text",  label: "Su nombre" },
            roles:     { kind: "words", label: "Las palabras que van cambiando" },
            intro:     { kind: "prose", label: "Presentación" },
            photo:     { kind: "image", label: "Retrato",
                         alt: "photoAlt", shape: "photoShape" },
            primaryLabel:   { kind: "text", label: "Botón principal",
                              help: "Lleva siempre a los libros." },
            secondaryLabel: { kind: "text", label: "Segundo botón",
                              help: "Lleva siempre a los tejidos." },
            place:     { kind: "text",  label: "Los lugares" },
        },
    },
    // … proximo, books (list:true), poem, tejidos (channels list), quote
};
```

**Nine field kinds cover the entire site.** Slice 1 needs the first eight:

| Kind | Control |
|---|---|
| `text` | One line |
| `prose` | A box that grows; blank line = new paragraph, said as a hint |
| `poem` | Like prose but with line breaks made visible — `toLines()` keeps blank lines as stanza breaks and the poem band renders every one |
| `words` | Short words as removable chips (the hero's cycling roles) |
| `image` | Thumbnail, drag-and-drop, "Cambiar…", with its alt text beside it as one unit |
| `shape` | Three labelled buttons drawn at their real proportions — *cuadrada · alta · ancha*. Never a dropdown. Read `SHAPES` from `site.js`. **Shown only while the slot is empty** — see below. |

**The shape control appears only when there is no picture.** The user asked why
it was there at all, and was right: `Figure` passes the shape word to
`useNaturalRatio` as the *reserved* ratio only, and the moment the file loads the
frame takes the picture's own proportion (`Figure.js:50`). So for a slot that
already holds a photograph the buttons change nothing — they ask her to guess at
something the site has already measured. With a picture present the editor says
so instead: *"El marco se ajusta solo a la foto: sale entera, sin recortar."*
The stored word stays in the JSON untouched, because it is what the reserved
frame uses if she removes the picture again.

A CSS trap found here and worth remembering: `.sub > span` is **more specific**
than `.shapes`, so it silently forced the row of shape buttons to `display:
block` and stacked them vertically. The fix is `.sub > .shapes`.
| `video` | Accepts an embed link **or** a filename; use `videoSource()` to tell her which it read |
| `url` | External only, with a "probar" link. Internal destinations are not editable at all. |
| `suggest` | Free text with existing values as chips — needed from the Libros slice on, for `categoria` and `channel` |

Each section gets an on/off switch in its header writing `visible`. **A section
switched off greys and collapses but keeps everything inside it** — that is the
entire point of the flag.

### What "very user friendly" means concretely

The user stressed this. It is not a vibe, it is these decisions:

- **Everything in Spanish, and nothing named as a developer names it.** No
  `photoShape`, no `slug`, no `kicker` — that one becomes *"la palabrita de
  arriba"*. No JSON is ever visible: no braces, no file names.
- **Tabs across the top, in page order**: Portada → Lo próximo → Libros → Poema
  → Tejidos → La frase. What she scrolls past is what she reads across. This was
  a column down the left side and the user had it moved: six short words cost
  220px of width for the whole height of the window, and a row costs one line.
  **Do not put it back down the side.**
- **Each section's switch sits beside that section's own title**, with a word
  saying which way it is — *Se ve* / *Apagada* — not in the tab strip, where it
  crowded the names. A tab whose section is off is marked, so the state is still
  visible at a glance.
- **Only fields she can see the effect of.** The user asked for the invisible
  ones to go: `videoLabel` (an iframe title), `detalle.galleryLabel` (an
  aria-label), every `slug` (the old "Mostrar lo técnico" fold), and the `ui`
  words that are only read by screen readers or printed inside an empty
  picture frame. They stay in the JSON with their fallbacks, so the site is
  unchanged — the editor simply does not offer them. Fields that only show
  after a click (a video, a photo caption, a book's synopsis reached from the
  cover page) are visible and stay. Before adding a field, check it changes
  something she can see. The encounter still to come is the clearest case: its forms
  (`UPCOMING_HOME_FIELDS`, `UPCOMING_EVENTOS_FIELDS` in `schema/shared.js`)
  leave out `categoria`, `year` and `photo`, which only matter once it is in
  the archive. The cover page's form also leaves out `note` and the button,
  which only the Eventos band draws. Its JSON keeps every key of the model.
- **One column, large type, big targets.** No dense two-column forms.
- **A `↺` beside any field she has changed**, restoring just that field to its
  last applied value. Per-field undo is worth more than a global one to someone
  nervous about breaking things.
- **Nothing can be lost.** Her own picture files are read, never moved or
  copied. Descartar and deleting a list item are the only things that ask
  *"¿seguro?"*. Unapplied work survives closing the app, a crash and a restart,
  as the soft draft (§6), which is an autosaved file beside the site — not a
  return to write-through.
- **Empty is never an error.** Clearing a photo shows the site's designed
  placeholder frame — deliberate behaviour, said as much, not flagged as a
  problem.
- **Aplicar reports in plain Spanish**: *"Guardado: el saludo, el retrato, y
  apagaste la franja de la frase."*

### The preview pane

The right of the window: an `<iframe>` of whatever `/api/config` names as the
preview — the bundled copy of the site in the app, the dev server on `:3000`
under `npm start`. Three width buttons — *teléfono 390 · tablet 820 ·
escritorio* — and, at the far right, **Ver la portada**.

**A draggable handle sits between the form and the preview** (`.splitter`),
clamped to 340–860px, remembered in `localStorage`, double-click to reset. While
dragging, the iframe gets `pointer-events: none` — otherwise the pointer is
swallowed the moment it crosses into the preview and the drag dies.

The page is rendered at its **true** width and scaled down to the room available
(`transform: scale()`), so "Escritorio" really is a 1280px layout rather than a
narrow pane pretending to be one. Media queries answer to the frame's own width,
so what it shows is what a visitor gets.

*Ver la portada* was called *Recargar* until the user asked what it meant —
which was the answer. It sets the iframe's `src` rather than reloading, so after
following a link inside the preview it returns to the page being edited instead
of reloading wherever she ended up.

The dev server is assumed already running. Check port 3000 and show *"Abre la
página web para ver los cambios"* if it isn't. **Never start or stop it.**

---

## 7. Slice order

### Slice 1 — the home page: BUILT, and it is a Mac app

```
cd editor
npm install
npm run package     # → editor/release/mac-arm64/Sitio de Marcia.app
```

Double-click it. No terminal, no prompt, its own Dock icon. Verified from a
genuinely clean state (settings deleted) — it opens straight into the editor.

### How the packaged app hangs together

It is a window plus two local servers on random free ports, all inside the
Electron main process (`editor/electron/main.js`):

- **The API + editor screen.** Serves `editor/dist` (the Vite build) and the
  `/api/*` routes. The window loads this.
- **The preview site.** Serves `editor/preview-site` — a bundled copy of the
  real site — plus `/content/*` from **the live `public/content/` folder**, not
  the copy inside the build, so a photograph saved a moment ago appears without
  the app being rebuilt.

Two servers rather than one on purpose: the preview stays a separate origin, so
the draft travels by `postMessage` exactly as it does when the site's own dev
server is used. One code path covers both.

**The preview needs its own build of the site.** `npm run build` deliberately
compiles the draft listener out (see §6), so the app would have nothing to talk
to. Hence a third mode:

```
npm run build          # deployed — NO listener
npm run build:preview  # bundled in the app — listener ON, never deployed
```

Both scripts set `REACT_APP_PREVIEW` explicitly, and that matters: **left
undefined the variable is not substituted at all, the test cannot fold, and the
listener ships in the deployed bundle.** That happened once during this work and
was caught by the check in §10. Keep running it.

### The window's own chrome

The app uses `titleBarStyle: "hiddenInset"`, so the window has no title bar of
its own and the editor's top bar **is** the title bar. Two things follow, and
both were reported as bugs before they were fixed:

- It must leave room for the three round buttons, or macOS draws them straight
  over the title. The bar takes `padding-left: 92px` — **only in the app**, since
  the same build also runs in a browser tab where that would just be a gap.
- It must be draggable, or the window cannot be moved at all. The bar is
  `-webkit-app-region: drag`, and every button and status on it is `no-drag`,
  or pressing Aplicar would move the window instead of clicking.

The page is told which it is by being loaded as `?app=1`, read synchronously at
module load so there is no flash of the wrong layout.

Three more things about the frame:

- **The top bar is always one line.** The status gives way and ends in "…",
  with the full text on hover; the buttons never shrink. After Aplicar, more
  than three saved sections are said as "27 partes, en Portada, Tejidos…"
  (`briefly()` in `App.jsx`). The Aplicar dialog still lists every section.
- **The preview always keeps 520px.** The width she drags the form to is
  remembered as she chose it. A smaller window only lends the form less for
  now (`MIN_PREVIEW`, `widestForm()`), and the preview bar wraps rather than
  pushing its buttons out of sight.
- **Closing keeps the soft draft instead of asking.** In the app, `main.js`
  holds the first `close`, has the page write its soft draft at once through
  `window.__editorFlush()`, and closes again once that is done — or after two
  seconds. (It used to ask "Hay cambios sin guardar"; the soft draft made the
  question pointless.)

### Three traps that cost time here — don't rediscover them

1. **`productName` must be top-level in `editor/package.json`**, not only under
   `build`. Electron takes `app.getName()` from the top-level field, so with it
   only in `build` the app calls itself "Sitio de Marcia" while keeping its
   settings under `~/Library/Application Support/marcia-editor` — and anything
   written to the name you expect is silently never read.
2. **Verify the PRODUCTION build, not the dev server.** React StrictMode
   remounts components in development and runs effects twice, which hides bugs
   that depend on mount order. One shipped: the code that scales the preview to
   fit read a `useRef` in an effect whose only dependency was the width. On the
   first render the screen is still saying "Abriendo el sitio…", so the node did
   not exist, the effect bailed, and — having no dependency on the node — never
   looked again. The preview stayed unscaled and was clipped by its pane. In the
   dev server StrictMode's second mount made it work, so it looked fine right up
   until it was packaged. The fix is a **callback ref**, which fires whenever the
   node appears, plus a guard against measuring a zero-width pane (a negative
   scale turns the preview inside out rather than merely small). The general
   lesson: for anything that touches layout or mount order, check with
   `MARCIA_SHOT` against the real app.

3. **First run must not stop to ask where the site is.** `npm run prepack`
   writes `editor/electron/default-site.json` with the folder the app was built
   from, and `main.js` uses it as one guess among several. It is still checked
   with `isSite()` first, so an app built here and moved elsewhere degrades into
   a question rather than an error. Without this the app opens on a modal and
   looks broken.

**Looking inside the packaged app.** Everything listed under `build.files` is
packed into `Contents/Resources/app.asar`, not laid out as loose files — so
`ls Contents/Resources/app/` finds nothing and looks like a failed build. Use
`npx asar list "…/Sitio de Marcia.app/Contents/Resources/app.asar"` instead.
Electron patches `fs` to read from inside the archive, which is why
`express.static` can serve `dist/` and `preview-site/` straight out of it.

**Gatekeeper.** The app is unsigned (`identity: null`). Run from where it was
built it opens normally, because it was never quarantined. Emailed, AirDropped
or downloaded, macOS will block it and she must right-click → **Abrir** once.
Signing it properly needs an Apple Developer account at $99/yr.

What works, verified end to end in the browser:

- All six bands of the cover page, every field, in Spanish.
- Typing updates the preview in under a second; **the file on disk stays
  untouched** (confirmed: greeting still read `"Bienvenidos"` on disk while the
  preview showed the new text).
- Section switches, beside each section's title — the band vanishes from the
  preview and its tab is marked, **keeping its text**.
- A `↺` beside any changed field, restoring just that field.
- Adding, deleting and reordering list items (books, channels, event photos).
  **Reordering is by dragging**, with a grip of dots at the left of every line
  and a rose line showing where it will land. It started as up/down arrows;
  the user asked for draggers on every list instead. One hook, `useDragOrder`
  in `fields.jsx`, drives both the lists of cards and the lists of words.
- Drag-and-drop or click to choose a photo, with its alt text and the three
  shape buttons grouped beside it.
- Aplicar: writes only what changed, reports in plain Spanish — *"Guardado:
  Portada y La frase. Se guardó 1 foto."*
- Descartar: returns to the last applied state and removes the soft draft.
- Preview at three widths, scaled down to fit the pane so "Escritorio" is a real
  1280px layout rather than a narrow pane pretending to be one.

**Known limits of slice 1:** only `home.json` is editable — the navbar, footer
and site name (`site.json`) are visible in the preview but not yet editable; no
colours; no browser of existing images (she picks from her own files); no git,
so publishing is still a developer's job; the app is arm64-only and unsigned.

Next: hand it over and wait for the user's verdict before continuing.

Then, in any order, roughly half a day each — schema plus one `sectionOn` guard
line per band:

**Slice 2 — Libros.** Adds the `suggest` kind for `categoria` and the list
machinery (add / delete / drag-reorder), which the home book row also wants.
**Slice 3 — Arte** (poems and songs). **Slice 4 — Tejidos.**
**Slice 5 — Eventos**, the most structural: nested `fotos` inside each event.
**Slice 6 — Biografía.** **Slice 7 — site.json**: name, footer.

**Later phases, deliberately deferred:**

- **Colours.** A new `src/content/tema.json` with ~14 seed colours and a
  `tema.js` that writes them onto `document.documentElement.style`, imported
  from `src/index.js` before `App`. Derive the `-rgb` triplets from the hexes —
  `tokens.css` currently warns in a comment that `--ink` and `--ink-rgb` must be
  kept in step **by hand**, and deriving them removes that trap.
  > **Constraint: colours and typefaces only.** Never put `--gutter`, `--band`
  > or `--nav-pad` in the theme. They are re-declared inside media queries at
  > the bottom of `tokens.css`, and an inline style on `:root` beats a media
  > query at *every* width — it would silently flatten the responsive ladder.
- **Git + publishing.** Publicar keeps a version and commits and pushes it
  (§6 "Publicar and versions"). What is left is the deploy itself — see §9.
- **Electron packaging**, and the Gatekeeper workaround for an unsigned app
  (right-click → Abrir, once).

---

## 8. Design language and layout decisions to respect

Called **"papel y hilo"** — paper and thread, after the writing and the
knitting. A warm paper ground, one ink, her rose as the accent, a thread-gold
used sparingly, Fraunces for display and Inter for text. Sections fade up on
scroll via `Reveal`, and everything respects `prefers-reduced-motion`.

`src/styles/tokens.css` holds the whole design system as CSS variables — about
50 colours, of which ~14 are seeds and the rest derive from three RGB triplets.
**Nothing outside that file writes a hex value**, so the site can be retuned
from one place.

`Placeholder` is the reserved frame — a woven panel with a thin-line glyph
naming the kind of picture that belongs there. `Figure` falls back to it
whenever a file is missing or fails to load. **This is deliberate and must not
be "fixed".**

**Screen widths:** a six-rung ladder — 1200, 1000, 900, 700, 560, 400px — and
every stylesheet uses those numbers and no others. Anything between rungs is
carried by `clamp()` and grids that wrap on their own. Where a measurement must
shrink continuously rather than at a threshold, prefer a fluid rule to a new
breakpoint.

**An event's own page** shows one mounted print with a tray of small prints
below as the only way to change it. A draggable rail that used to be there was
removed on purpose. **Do not rebuild it.**

---

## 9. The publish path — GitHub Pages settings fixed, deploy still to come

The site is a project page, served from `https://primike.github.io/MarciaCreations/`.

1. **Fixed: the base path.** The `build` script sets
   `PUBLIC_URL=/MarciaCreations`, so the deployed bundle loads its scripts,
   styles and `public/content/` pictures from `/MarciaCreations/`. The router
   basename in `src/App.js` and `asset()` in `site.js` both read
   `PUBLIC_URL`, so they follow along.
   **`"homepage"` in `package.json` is deliberately left empty.** Setting it
   would also move `npm start` to `localhost:3000/MarciaCreations/`, breaking
   the editor's preview, which expects the site at the
   root. `build:preview` (the copy inside the editor) stays at `/` for the same
   reason. Never add `PUBLIC_URL=/` there: `asset()` would then produce
   `//content/…`, which a browser reads as a different server.
2. **Fixed: deep links.** `public/404.html` has `pathSegmentsToKeep = 1`, as
   a project page needs. GitHub serves that file for any unknown path, it
   redirects to `/MarciaCreations/?/libros/…`, and the decoder in
   `public/index.html` restores the address before React starts.
   This was verified on a local server that serves `build/` the way Pages does,
   in WebKit: a click into a book, a refresh on it, a cold shared link with
   `?lang=en`, `#hash` kept, an unknown page, tab links, the back button, and
   no failed requests.
3. **Not done: the live site.** `origin/gh-pages` was last touched
   **2023-03-16**. Also, in September 2026 the repo answered "Not Found" to
   an anonymous GitHub API request, and the live address returned GitHub's
   404. That means the repo was private (or renamed) at the time, and free
   Pages only serves public repos. Check its visibility and
   Settings › Pages (source: `gh-pages` branch, or Actions once there is a
   workflow) before the first deploy.

**The recommended publish design:** the app only commits and pushes the changed
JSON and photos — that half is built — and a GitHub Actions workflow builds and
deploys. The workflow is not written yet. Her Mac would then need no Node, no
npm install and no terminal. There is currently **no `.github/` directory at
all**, and `gh` CLI is **not installed**; pushes would use the existing
`osxkeychain` credential helper.

---

## 10. Verifying work

- **`CI=true npm run build`** — the project's check. Catches broken imports,
  malformed JSON, lint errors. **There are no tests and must never be any.**
- **Look at the running page.** The user keeps a dev server on port 3000.
  Check it with
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` and use it.
- **Read the JSON diff after an editing session.** Files must stay 4-space
  indented, key order preserved, `_guia` / `_nota` keys untouched. That property
  is what keeps hand-editing possible alongside the app.
- **Check the `visible` switches** by flipping one and confirming the band
  vanishes *and its text survives*.
- **Check the cold-link fallback**: open `/eventos/<slug>` or `/libros/<slug>`
  in a fresh tab, not by clicking through, and confirm it still renders.

### Browser-automation traps, all real and all cost hours here

1. **The Chrome extension cannot inject into a page that has mounted a live
   YouTube `<iframe>`** — every call returns *"Cannot access a
   chrome-extension:// URL"*. This rules out the home page, whose Tejidos band
   embeds a video on load. Temporarily blank `home.tejidos.video`, inspect, then
   restore it.
2. **An automation tab is `visibilityState: "hidden"`**, where
   `requestAnimationFrame`, native scroll events, CSS transitions and smooth
   scrolling do not run. `Reveal` sections therefore screenshot as **blank**,
   which looks like a catastrophic bug and is not one. Read the DOM text
   (`get_page_text`) instead of screenshotting, or disable the transition and
   read the settled value. **Never claim motion was observed when it wasn't.**
3. Window resizing is no use for responsive checks — the extension renders at a
   fixed viewport whatever `resize_window` reports. What works is putting the
   site in same-origin `<iframe>`s of chosen widths on one localhost page.

**Seeing the Mac app at all.** The Chrome extension cannot reach an Electron
window, and `screencapture` needs Screen Recording permission that may not be
granted. Electron can photograph itself instead, which needs no permission:

```
cd editor && MARCIA_SHOT=/tmp/shot.png npx electron .

# MARCIA_SHOT_JS runs first, for anything below the fold or behind a click:
cd editor && MARCIA_SHOT=/tmp/shot.png \
  MARCIA_SHOT_JS='document.querySelector(".form").scrollTop = 620;' npx electron .
```

It loads, waits for the page to settle, writes the PNG and quits. This is the
only reliable way to see what the app actually looks like — use it rather than
guessing, and rather than checking the browser build and assuming the app
matches. It captures the web contents only, not the window frame, so the traffic
lights do not appear in the image; check their clearance by the left padding on
the top bar instead.

---

## 11. Quick orientation to the code

```
src/App.js                      the ONE place content is imported
src/content/*.json              all copy and imagery
src/content/site.js             loader + every helper
src/content/README.md           the Spanish editing guide FOR MARCIA — keep current
src/styles/tokens.css           the whole design system as CSS variables
src/components/common/          Placeholder, Figure, Reveal, PageHeader, Upcoming,
                                ScrollToTop, Visor (full-screen image viewer,
                                mounted once from App as VisorProvider),
                                useBodyLock, naturalRatio
src/pages/                      one file per page; home's bands in src/pages/home/
docs/EDITOR-APP.md              this file
```

Six routes plus three detail routes: `/`, `/libros`, `/libros/:slug`, `/arte`,
`/arte/:slug`, `/tejidos`, `/eventos`, `/eventos/:slug`, `/biografia`.

**Video plays inside its own card** so the reader can scroll away while it keeps
playing. **Images may open full-screen** in `Visor`, because they exist to be
looked at. That asymmetry is deliberate.
