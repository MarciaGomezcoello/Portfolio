# Marcia Creations

Personal website for **Dra. Marcia Gomezcoello** — doctora, escritora, poeta,
compositora y tejedora. Born in Azogues, Ecuador; based in Queens, New York.

---

## Summary

A six-page React site built so that **Marcia can change everything on it
without touching code**. Every word and picture comes from JSON files in
`src/content/`, one per page; the components only decide how that content is
arranged. A separate editing program is planned that will read and write those
same files, so the JSON is treated as a stable contract rather than an
implementation detail.

**What's here**

| Page                 | Route            | What it holds                                                        |
| -------------------- | ---------------- | -------------------------------------------------------------------- |
| Portada              | `/`              | Hero with cycling roles, a line in her voice, three books, a poem, the two channels, TARLITEART |
| Libros               | `/libros`        | Every book, filterable by genre; each links to its own page          |
| A book               | `/libros/:slug`  | Cover, synopsis, optional excerpt, buy link, and what's coming next  |
| Arte                 | `/arte`          | Her poems, in order with their opening lines, and her songs          |
| A poem               | `/arte/:slug`    | The verse set on a page beside its picture, with previous and next   |
| Tejidos              | `/tejidos`       | The two channels, chosen videos, where they began, and a gallery     |
| Eventos              | `/eventos`       | The next event, then every past one — by kind, grouped by year       |
| An event             | `/eventos/:slug` | Its account and a carousel of its photos                             |
| Biografía            | `/biografia`     | The long version, a dated timeline, recognitions                     |

**Decisions worth knowing**

- **Empty frames are designed.** An image slot with no photo yet renders a
  placeholder frame — a woven panel with a thin-line glyph saying what belongs
  there. That is deliberate, not a broken image.
- **Nothing is fetched at runtime.** No APIs, no live data. In particular there
  are no YouTube subscriber counts anywhere: a number the site cannot refresh
  goes stale on its own, so the copy avoids citing figures that change.
- **No email addresses.** Contact happens through the social links in the
  footer.
- **Empty means hidden.** Clear a section's content and that section disappears
  from the page rather than leaving an empty heading behind.
- **Lists grow on their own.** Add a book and it appears; give it a new
  `categoria` and a new filter tab appears with it. No code changes.
- **Every event has its own address**, made from its title plus its year
  (`/eventos/evento-de-febrero-2023`) unless the title already has the year;
  two with the same title and year get `-2`. Her evenings repeat their names
  every year, so the title alone was not enough. Older year-less addresses
  still open, and the English site uses the same addresses as the Spanish.
- **English is a translation, never a second copy to keep in step.** The files
  in `src/content/en/` are the Spanish ones with the words laid over them, made
  with the editor's Traducir tools. Her poems are never translated — titles,
  verses and excerpts stay in Spanish on the English site, and the editor
  enforces it.

---

## Editing the site (no code)

Everything the site says and shows lives in **`src/content/*.json`** — one file
per page, plus `site.json` for what appears everywhere (the name, the menu, the
footer, the two channels).

See **[`src/content/README.md`](src/content/README.md)** for the field-by-field
guide, written in Spanish for her rather than for a developer. In short:

- Change any text by editing its value in the matching JSON file.
- Add a book, a poem, an event: copy an existing block in that list and edit it.
- Empty a section's content and that section disappears.
- Text can be any length — every layout wraps and grows to fit.
- Keys starting with `_` (`_guia`, `_nota`) are notes for whoever is editing.
  They never appear on the page and can be deleted freely. The `_nota` ones
  flag sample text still waiting on her real words — the poems and the closing
  quote, mainly.

### Pictures

To put a real photo into a placeholder frame:

1. Drop the file into **`public/content/`**.
2. Put its file name in the matching JSON field: `"cover": "portada.jpg"`.

A full `https://...` URL works too. Leave a field as `""` and the placeholder
stays. If a file name is wrong or the image fails to load, the page falls back
to the placeholder rather than showing a broken image.

Every photo also gets smaller WebP copies (480, 960 and 1600px wide), made
automatically before each `npm start`, `npm run build` and `npm run deploy` by
`scripts/tallas.mjs`, and the browser downloads the smallest one that is sharp
where the photo is shown. Her originals are never touched; the copies sit in
`public/content/tallas/` and their list in `src/tallas.json`, both left out of
git because they can always be made again. The first run takes a minute or two;
after that only new photos are processed.

The published site is about 860 MB of GitHub Pages' ~1 GB limit, almost all of
it photos — worth keeping an eye on as she adds more.

### Videos

A video field takes a file in `public/content/` (`"clase.mp4"`) or a link. A
YouTube or Vimeo link can be pasted exactly as copied from the address bar or
the Share button — `youtube.com/watch?v=…`, `youtu.be/…`, Shorts, Live — and is
played from its embed address (`src/content/videoLink.js`). The editor converts
it the moment it is pasted.

Book covers can be either shape — `"shape": "alto"` (rectangular) or
`"cuadrado"`. The two mix freely in one row: covers stand on a shared bottom
line, like books on a shelf, and nothing is cropped or stretched.

---

## Running it locally

Requires [Node.js](https://nodejs.org/).

```bash
npm install     # first time only
npm start       # http://localhost:3000, live reload
npm run build   # also the quickest check that nothing is broken
```

There are no tests in this project by design.

## Building and deploying

Deploys to GitHub Pages. The SPA redirect shim in `public/404.html` and
`public/index.html` makes deep links like `/libros/el-ojo-de-la-muerte` work
there.

```bash
npm run build   # production build into build/
npm run deploy  # builds, then publishes build/ to the gh-pages branch
```

Set `"homepage"` in `package.json` to the published URL before deploying — the
router and the image paths both read `PUBLIC_URL` from it.

---

## Design

One warm paper ground, one ink, her rose as the accent, and a thread-gold used
sparingly — "papel y hilo", paper and thread, after the writing and the
knitting. Every colour, font and spacing step is a CSS variable in
**`src/styles/tokens.css`**; nothing hard-codes a colour, so the whole site can
be retuned from that one file. Type is Fraunces for display, Inter for text.

Sections fade up as they scroll into view, the navigation floats over the hero
on the home page and gains its background as you scroll, and everything
respects `prefers-reduced-motion`.

## Layout

```
public/
  content/              # her photos and video files
    tallas/             # smaller copies, made before each build (not in git)
  index.html            # metadata, fonts, GitHub Pages SPA shim
scripts/
  tallas.mjs            # makes the smaller photo copies
editor/                 # the Mac editing app — see docs/EDITOR-APP.md
src/
  styles/tokens.css     # ← the design system: colour, type, spacing, motion
  content/
    site.json           # name, menu, footer, the two channels
    home.json           # the cover page
    libros.json  arte.json  tejidos.json  eventos.json  biografia.json
    en/                 # the English copy of each file
    site.js             # loads the JSON; image paths, addresses, categories
    videoLink.js        # a pasted YouTube/Vimeo link → its embed address
    README.md           # ← the editing guide (Spanish)
  components/
    Navbar.js           # sticky bar, floats over the hero on the home page
    Footer/SiteFooter.js
    common/
      Placeholder.js    # the designed empty box that stands in for a photo
      Figure.js         # a picture, or that placeholder
      tallas.js         # offers each picture's smaller copies to the browser
      Reveal.js         # fade-up on scroll
      PageHeader.js     # the masthead each inner page opens with
      Upcoming.js       # "Lo que viene", shown on the book pages
      ScrollToTop.js
  pages/
    Home.js  home/      # Hero + the cover-page bands
    Libros.js           # the shelf and its genre tabs
    LibroDetalle.js     # one book
    Arte.js             # the poems and the songs
    PoemaDetalle.js     # one poem
    Eventos.js          # the next event and the archive, by year
    EventoDetalle.js    # one event and its photo carousel
    Tejidos.js  Biografia.js  NotFound.js
```

## Tech

- [Create React App](https://create-react-app.dev/) (`react-scripts`)
- React 18, `react-router-dom` for the tabs and the per-book routes
- `typewriter-effect` for the cycling roles in the hero
- Plain CSS — one file per component, all reading from `tokens.css`
