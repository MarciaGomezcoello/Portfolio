# Marcia Creations

Personal website for **Dra. Marcia Gomezcoello** — médica, escritora, poeta,
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
| Poemas               | `/poemas`        | An illustrated contents page — every poem in order, opening lines    |
| A poem               | `/poemas/:slug`  | The verse set on a page beside its picture, with previous and next   |
| Tejidos              | `/tejidos`       | The two channels, chosen videos, where they began, and a gallery     |
| Eventos              | `/eventos`       | TARLITEART, the monthly literary afternoon she has run since 2019    |
| Biografía            | `/biografia`     | The long version, a dated timeline, recognitions                     |

**Decisions worth knowing**

- **No photographs yet.** Every image slot renders a designed placeholder
  frame — a woven panel with a thin-line glyph saying what belongs there. That
  is deliberate, not a broken image.
- **Nothing is fetched at runtime.** No APIs, no live data. In particular there
  are no YouTube subscriber counts anywhere: a number the site cannot refresh
  goes stale on its own, so the copy avoids citing figures that change.
- **No email addresses.** Contact happens through the social links in the
  footer.
- **Empty means hidden.** Clear a section's content and that section disappears
  from the page rather than leaving an empty heading behind.
- **Lists grow on their own.** Add a book and it appears; give it a new
  `categoria` and a new filter tab appears with it. No code changes.

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
  content/              # editable images go here (empty for now)
  index.html            # metadata, fonts, GitHub Pages SPA shim
src/
  styles/tokens.css     # ← the design system: colour, type, spacing, motion
  content/
    site.json           # name, menu, footer, the two channels
    home.json           # the cover page
    libros.json  poemas.json  tejidos.json  eventos.json  biografia.json
    site.js             # loads the JSON; image paths, slugs, categories
    README.md           # ← the editing guide (Spanish)
  components/
    Navbar.js           # sticky bar, floats over the hero on the home page
    Footer/SiteFooter.js
    common/
      Placeholder.js    # the designed empty box that stands in for a photo
      Figure.js         # a picture, or that placeholder
      Reveal.js         # fade-up on scroll
      PageHeader.js     # the masthead each inner page opens with
      Upcoming.js       # "Lo que viene", shown on the book pages
      ScrollToTop.js
  pages/
    Home.js  home/      # Hero + the cover-page bands
    Libros.js           # the shelf and its genre tabs
    LibroDetalle.js     # one book
    Poemas.js           # the illustrated contents run
    PoemaDetalle.js     # one poem
    Tejidos.js  Eventos.js  Biografia.js  NotFound.js
```

## Tech

- [Create React App](https://create-react-app.dev/) (`react-scripts`)
- React 18, `react-router-dom` for the tabs and the per-book routes
- `typewriter-effect` for the cycling roles in the hero
- Plain CSS — one file per component, all reading from `tokens.css`
