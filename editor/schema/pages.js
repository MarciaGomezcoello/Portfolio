import { HOME } from "./home.js";
import { LIBROS } from "./libros.js";
import { ARTE } from "./arte.js";
import { TEJIDOS } from "./tejidos.js";
import { EVENTOS } from "./eventos.js";
import { BIOGRAFIA } from "./biografia.js";
import { AJUSTES } from "./ajustes.js";

/* ============================================================================
   The pages of the editor, in the order of the tabs along the top — the same
   order as the site's own top bar (src/components/tabs.js), with the cover
   page first and Ajustes last. Keep the two in step.

   Each `form` names the content file it edits and lists its sections — the row
   of tabs under the page tabs. A section with a `key` edits that block of the
   file; a section without one edits fields at the top of the file itself.
   A section may name its own `file` when it edits a different content file
   from its page ("Nombre y redes" on Portada edits site.json).
   `toggle` gives a section the on/off switch, and only sections the site
   actually switches off may have it: `true` writes `visible` inside the
   section's block, and a name (`"headVisible"`) writes that flag at the top of
   the file for a section that has no block of its own. `path` is where the preview opens.
   A section with `custom` is drawn by its own component rather than from
   fields, and names the keys it owns in `keys`. `find` names something inside
   that section on the site, and the preview scrolls to it when the section's
   tab is chosen. A list field with a `source` ({ file, key, label, image,
   detail }) also offers the entries of that other list to copy in whole.
   ============================================================================ */

export const PAGES = [
    { key: "home", path: "/", form: HOME },
    { key: "tejidos", path: "/tejidos", form: TEJIDOS },
    { key: "libros", path: "/libros", form: LIBROS },
    { key: "arte", path: "/arte", form: ARTE },
    { key: "eventos", path: "/eventos", form: EVENTOS },
    { key: "biografia", path: "/biografia", form: BIOGRAFIA },
    { key: "ajustes", path: "/", form: AJUSTES },
];
